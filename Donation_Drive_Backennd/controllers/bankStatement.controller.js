// import BankTransaction from "../models/bankTransaction.model.js";
// import bankStatementParserService from "../services/bankStatementParser.service.js";
// import reconciliationService from "../services/reconciliation.service.js";
// import { ApiError } from "../utils/apiError.utils.js";
// import { ApiResponse } from "../utils/apiResponse.utils.js";

// export const uploadBankStatement = async (req, res) => {
//     try {

//         if (!req.file) {
//             throw new ApiError(400, "Bank statement is required.");
//         }

//         const transactions =
//             await bankStatementParserService.parseStatement(req.file);

//         // DEBUG (remove before production)
//         // console.log(`Parsed ${transactions.length} transaction(s)`);

//         let importedCount = 0;
//         let duplicateCount = 0;
//         let failedCount = 0;

//         for (const transaction of transactions) {

//             try {

//                 const alreadyExists = await BankTransaction.findOne({
//                     transactionId: transaction.transactionId,
//                 });

//                 if (alreadyExists) {
//                     duplicateCount++;
//                     continue;
//                 }

//                 await BankTransaction.create({
//                     ...transaction,

//                     uploadedBy: req.admin.adminId,

//                     statementFileName: req.file.originalname,
//                 });

//                 importedCount++;

//             } catch (error) {

//                 failedCount++;

//                 // DEBUG (remove before production)
//                 // console.error(
//                 //     "Import failed:",
//                 //     transaction.transactionId,
//                 //     error.message
//                 // );

//             }

//         }

//         const reconciliationSummary =
//             await reconciliationService.reconcileTransactions();

//         return res.status(201).json(

//             new ApiResponse(

//                 201,

//                 {
//                     importedCount,
//                     duplicateCount,
//                     failedCount,
//                     reconciliationSummary,
//                 },

//                 "Bank statement processed successfully."

//             )

//         );

//     } catch (error) {

//         return res.status(error.statusCode || 500).json(

//             new ApiError(
//                 error.statusCode || 500,
//                 error.message
//             )

//         );

//     }
// };

//-------------------------------------------------------THIS IS A DEDICATED CONTROLLER TO DEAL WITH THE BANK STATEMENT UPLOAD FUNCTIONALITY-----------------------------------------------------

import statementUploadService from "../services/statementUpload.service.js";

import { ApiResponse } from "../utils/apiResponse.utils.js";

export const uploadBankStatement = async (req, res) => {

    try {
        //HERE, WE ARE STORING THE RESPONSE GIVEN BY THE STATEMENT UPLOAD SERVICE WE PASSING THE BANK STATEMENT FILE ALONG WITH THE ADMIN ID 
        const response =
            await statementUploadService.uploadStatement(
                req.file,
                req.admin.adminId
            );
        
        return res.status(201).json(

            new ApiResponse(

                201,

                response,

                "Bank statement uploaded successfully."

            )

        );

    } catch (error) {

        return res.status(error.statusCode || 500).json(error);

    }

};