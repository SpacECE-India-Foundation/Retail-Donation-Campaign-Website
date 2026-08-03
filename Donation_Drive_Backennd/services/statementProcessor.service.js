import mongoose from "mongoose";
import BankStatement from "../models/bankStatement.modals.js";
import BankTransaction from "../models/bankTransaction.model.js";
import Donation from "../models/donation.modals.js";
import Campaign from "../models/campaign.modals.js";
import verificationService from "./verification.service.js";
import { certificateQueue } from "../queues/certificate.queue.js";
import { ApiError } from "../utils/apiError.utils.js";

class StatementProcessorService {
   

    //this are the statement processing services different service have dedicated different role 
    async processStatement(statementId) {
        //this is a service to process the statement, the worker will identify the job and trigger this service 
        
    //here, we will find the statement by the statement id
    const statement = await BankStatement.findById(statementId);
    ApiError.assert(statement,"No statement found!")

    //here,we are updating the status of the bank statement to processing when the worker sees this job from the que
    statement.processingStatus = "PROCESSING";
    
    //just immediately saving this so the status can be updated as soon as workers start working over the job
    await statement.save();

    //now we will be fetching all the trnsaction from the bankTransaction collection which have the same statement id as that job the worker is working for 
    // const transactions = await BankTransaction.find({
    //     statement: statement._id,
    //     processingStatus: "PENDING"
    // }).sort({
    //     transactionDate: 1
    // });

    //here, we will be using the donation driven approach that we will take  individual donation and then find that donation transaction id in the banktransaction
    const pendingDonations = await Donation.find({
    status: "Pending"
    });

    // console.log(
    //     `Found ${transactions.length} transactions`
    // );

    //now we will be processing this in batch
    const batchSize = 100;
    for (let i = 0;i < pendingDonations.length;i += batchSize) {
        const batch = pendingDonations.slice(i, i + batchSize);
        //now we are calling the process batch
        await this.processBatch(batch);
    }
    // await this.processRetryTransactions();

    /*
    ------------------------------------------
    Update Statistics
    ------------------------------------------
    */
    await this.updateStatementStatistics(statement._id);
    }

    //----------------------------------------SERVICE FOR BATCH PROCESSING--------------------------------------------------
    async processBatch(pendingDonations) {
         await Promise.allSettled( //Here, we have used Promise.allSettled because in the promise.all whenever any promise get failed it returns the code to carch block without giving the status of other promises it marks entire promise as failed,
            //whereas, promise.allsettled wait for every promise it doesnt stop if any promise fails it gives the result of every promise
            //and thats exactly we needed in our system we dont stop if any error arises we have to verify other transactions also
                pendingDonations.map(donation =>
            this.processSingleDonation(donation)
        )
    );
    }


    //----------------------------------------------------------PROCESS SINGLE TRANSNACTION SERVICE--------------------------------
    async processSingleDonation(donation) {

        //this is the particular transaction processing status which shows that we are currently processing this partuclar transaction
        
        //first of all we will matk this particualr donation as automatic verification is attempted for this donation
        donation.automationAttempted=true;
        await donation.save()
         
        //now the very main part comes that is finding the matching donation in the transaction
        //no looping, no ay extra call just finding the very first record which matches the transaction id and which have the status rejected or pending
        // const donation = await Donation.findOne({
        //     transactionId: bankTransaction.utr,
        //     status:{
        //     $in:[
        //         "Pending",
        //         "Rejected"
        //         ]
        //     }
        // });
        //here, instead of donation we will find the transaction matching this donation id 
        const bankTransaction = await BankTransaction.findOne({
            utr: donation.transactionId,
        });

        //if no such doantion find then we will call another dedicated service of marking it as a failed
        // if (!bankTransaction) {
        //     await this.markFailed(
        //     bankTransaction,
        //     "Donation not found"
        //     );
        // return;
        // }
        if(!bankTransaction){
            donation.automationFailureReason = "Transaction Not Found"
            donation.save()
            return
        }

        bankTransaction.processingStatus = "PROCESSING";
        await bankTransaction.save();
        // if (donation.status === "Verified") {
        //     await this.markFailed(
        //     bankTransaction,
        //     "DUPLICATE_TRANSACTION"
        //     );
        // return;
        // }
        //now we are validating the amount of actuall donation with that transaction record
        if (donation.amount !== bankTransaction.amount) {
            await this.markFailed(
                donation,
                "Amount mismatch"
            );
        return;
        }

        //now we are fetching the campaign 
        const campaign = await Campaign.findById(
            donation.campaign
        );

        if (!campaign) {
            await this.markFailed(
            donation,
            "Campaign not found"
            );
        return;
    }

    //here, we will be starting the mongo transaction as we are updating many collection from here so we need to maintain the atomicity of the entire system

    const session = await mongoose.startSession();

    try {
        //here we are calling the  verifydonation service
        //till above we are only dealing with the transaction record based on the donation details we get now we will work on actuall donation document
        session.startTransaction();
        await verificationService.verifyDonation({
            donation,
            campaign,
            verifiedBy: campaign.createdBy,
            session
        });

        //till here our donation is verified successfully

        //---------------------------NOW UPDATING THE BANKTRANSACTION COLLECTION FOR THE DEDICATED BANK TRANSACTION-------------------
        bankTransaction.isMatched = true;
        bankTransaction.matchedDonation = donation._id;
        bankTransaction.processingStatus = "MATCHED";
        bankTransaction.matchedAt = new Date();
        await bankTransaction.save({
            session
        });
        //HERE, WE WILL BE SAVING THE BANK TRANSACTION RECORDS FOR THE DEDICATED TRANSACTION
        await session.commitTransaction();
    }

    catch (error) {

        await session.abortTransaction();

        await this.markFailed(
            bankTransaction,
            "UNKNOWN_ERROR"
        );

    throw error;

    }

    finally {

        session.endSession();

    }

    /*
    ---------------------------------------
    Now we will do Queue Certificate Generation
    ---------------------------------------
    */

    //we have done with the verification queue which deals with the bank statements 
    //now this is the dedicated certification que qhich will bring the jobs to the redis and the worker will generate the certificates
    //now in certificate que we have added this new job to generate the certificate for the dedicated verified donation
    await certificateQueue.add(
        "GENERATE_CERTIFICATE",
        {
            donationId: donation._id.toString()
        }
    );
}

    //------------------------------THE SERVICE TO MARK THE FAILURE REASON FOR NOT ABLE NOT AUTO VERIFY THE DONATION-----------------------------
    async markFailed(donation, reason){

        donation.automationAttempted = true;
        donation.automationFailureReason = reason;
        await donation.save();
    }


    //------------------------------THIS IS THE SERVICE TO UPDATE BANK STATEMENT STATITSTICS-------------------------------------

    async updateStatementStatistics(statementId) {

    /*
    ------------------------------------------
    Aggregate Transaction Statistics
    ------------------------------------------
    */

    const stats = await BankTransaction.aggregate([

        {

            $match: {

                statement: new mongoose.Types.ObjectId(statementId)

            }

        },

        {

            $group: {

                _id: "$processingStatus",

                count: {

                    $sum: 1

                }

            }

        }

    ]);
    //Here, we will be preparing the summary of the statistics
    const summary = {
        PENDING: 0,
        PROCESSING: 0,
        MATCHED: 0,
        FAILED: 0
    };

    stats.forEach(item => {
        summary[item._id] = item.count;
    });

    /*
    ------------------------------------------
    Update Statement
    ------------------------------------------
    */

    await BankStatement.findByIdAndUpdate(

        statementId,

        {

            matchedTransactions: summary.MATCHED,

            failedTransactions: summary.FAILED,

            processingStatus:

                summary.PENDING === 0 &&

                summary.PROCESSING === 0

                    ? "COMPLETED"

                    : "PROCESSING"

        }

    );

}

 async processRetryTransactions(){

    const retryTransactions = await BankTransaction.find({

        processingStatus:"FAILED",

        retryCount:{

            $lt:5

        }

    });

    console.log(

        `Retry Transactions : ${retryTransactions.length}`

    );

    if(!retryTransactions.length){

        return;

    }

    await this.processBatch(

        retryTransactions

    );

}

}

export default new StatementProcessorService();