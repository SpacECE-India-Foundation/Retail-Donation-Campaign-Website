import mongoose from "mongoose";
import BankStatement from "../models/bankStatement.modals.js";
import BankTransaction from "../models/bankTransaction.model.js";
import bankStatementParserService from "./bankStatementParser.service.js";
import { verificationQueue } from "../queues/verification.queue.js";
import { ApiError } from "../utils/apiError.utils.js";


//--------------------------THIS SERVICE CLASSES ARE FOR THE STATEMENT UPLOAD FUNCTIONALITY HANDLING---------------------------------

class StatementUploadService {

    async uploadStatement(file, adminId) {

        //HERE, WE HAVE IMPLEMENTED THE TRANSACTION TO MAINTAIN THE ATOMICITY OF THE ENTIRE PROCESS
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            ApiError.notFound(file,"No File Found!!")

            //here, we are calling the parse the bank statement service to parse this entire bank statement file, this will return an array
            const transactions = await bankStatementParserService.parseStatement(file);

            // if (!transactions.length) {
            //     throw new ApiError(
            //         400,
            //         "No valid transactions found in statement."
            //     );
            // }
            ApiError.assert(transactions.length>0,"No Valid Transaction found in Statement")

            //Calculating the total amount of the bank statement file contains
            //here, we are simply using the reduce to calculate the sum of all the transaction amount.
            const totalAmount = transactions.reduce(
                (sum, transaction) => sum + transaction.amount,
                0
            );

            //creating the statement summary, the bank statement model we have created we will store this summary there
            const [statement] = await BankStatement.create(
                [
                    {
                        fileName: file.originalname,
                        statementDate: new Date(),
                        uploadedBy: adminId,
                        totalTransactions: transactions.length,
                        totalAmount,
                        processingStatus: "PENDING",
                    },
                ],
                { session }
            );

            //preparing the bulk documents
            //hwere, we wre returning the new array using the map method which we will going to store in the bank transaction entry document collection
            const bankTransactionDocuments = transactions.map(
                (transaction) => ({
                    statement: statement._id,
                    utr: transaction.utr,
                    amount: transaction.amount,
                    senderName: transaction.senderName,
                    remarks: transaction.remarks,
                    transactionDate: transaction.transactionDate,
                    processingStatus: "PENDING",
                })
            );

            //now here, we will be performing bulk insert we will insert all the transaction entries to our bank Transaction collection
            await BankTransaction.insertMany(
                bankTransactionDocuments,
                {
                    session,
                    ordered: false,
                }
            );
            //till here we will commit the transaction, now we have our all the transaction records in the collection
            await session.commitTransaction();

            //now we are starting the 
            /*
            -----------------------------------------
            Queue Job
            -----------------------------------------
            */
            //here, we are adding the new job in th verification que with the job name and the data 
            await verificationQueue.add(
                "PROCESS_BANK_STATEMENT",
                {
                    statementId: statement._id.toString(),
                }
            );

            return {
                statementId: statement._id,
                totalTransactions: transactions.length,
                totalAmount,
                processingStatus: statement.processingStatus,
            };

        } catch (error) {

            await session.abortTransaction();

            throw error;

        } finally {

            session.endSession();

        }

    }

}

export default new StatementUploadService();