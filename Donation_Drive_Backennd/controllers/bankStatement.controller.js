import BankTransaction from "../models/bankTransaction.model.js";
import bankStatementParserService from "../services/bankStatementParser.service.js";
import reconciliationService from "../services/reconciliation.service.js";
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";

export const uploadBankStatement = async (req, res) => {
    try {

        if (!req.file) {
            throw new ApiError(400, "Bank statement is required.");
        }

        const transactions =
            await bankStatementParserService.parseStatement(req.file);

        // DEBUG (remove before production)
        // console.log(`Parsed ${transactions.length} transaction(s)`);

        let importedCount = 0;
        let duplicateCount = 0;
        let failedCount = 0;

        for (const transaction of transactions) {

            try {

                const alreadyExists = await BankTransaction.findOne({
                    transactionId: transaction.transactionId,
                });

                if (alreadyExists) {
                    duplicateCount++;
                    continue;
                }

                await BankTransaction.create({
                    ...transaction,

                    uploadedBy: req.admin.adminId,

                    statementFileName: req.file.originalname,
                });

                importedCount++;

            } catch (error) {

                failedCount++;

                // DEBUG (remove before production)
                // console.error(
                //     "Import failed:",
                //     transaction.transactionId,
                //     error.message
                // );

            }

        }

        const reconciliationSummary =
            await reconciliationService.reconcileTransactions();

        return res.status(201).json(

            new ApiResponse(

                201,

                {
                    importedCount,
                    duplicateCount,
                    failedCount,
                    reconciliationSummary,
                },

                "Bank statement processed successfully."

            )

        );

    } catch (error) {

        return res.status(error.statusCode || 500).json(

            new ApiError(
                error.statusCode || 500,
                error.message
            )

        );

    }
};


// THIS FUNCTION BUILDS THE UPLOAD HISTORY TABLE FOR THE SUPER ADMIN'S BANK STATEMENT PAGE.
// There's no separate "upload event" record anywhere — every uploaded statement just leaves
// behind a batch of BankTransaction rows tagged with the same statementFileName. So "one row
// per upload" is reconstructed here by grouping those rows back together by file name, and
// "status" is reported as how many of that file's transactions ended up matched to a donation
// during reconciliation (isMatched), out of the total parsed from that file.
export const fetchBankStatementHistory = async (req, res) => {
    try {

        const uploads = await BankTransaction.aggregate([
            {
                $group: {
                    _id: "$statementFileName",
                    uploadedBy: { $first: "$uploadedBy" },
                    uploadedAt: { $min: "$createdAt" },
                    totalTransactions: { $sum: 1 },
                    matchedTransactions: {
                        $sum: { $cond: [{ $eq: ["$isMatched", true] }, 1, 0] }
                    }
                }
            },
            { $sort: { uploadedAt: -1 } },
            {
                $lookup: {
                    from: "admins",
                    localField: "uploadedBy",
                    foreignField: "_id",
                    as: "uploadedByAdmin"
                }
            },
            {
                $project: {
                    _id: 0,
                    fileName: "$_id",
                    uploadedAt: 1,
                    totalTransactions: 1,
                    matchedTransactions: 1,
                    uploadedByName: {
                        $ifNull: [{ $arrayElemAt: ["$uploadedByAdmin.fullName", 0] }, "Unknown Admin"]
                    }
                }
            }
        ]);

        return res.status(200).json(
            new ApiResponse(200, { uploads }, "Bank statement upload history fetched successfully.")
        );

    } catch (error) {

        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message)
        );

    }
};