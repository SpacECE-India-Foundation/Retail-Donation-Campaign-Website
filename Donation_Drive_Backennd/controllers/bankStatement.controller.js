import BankTransaction from "../models/bankTransaction.model.js";
import bankStatementParserService from "../services/bankStatementParser.service.js";
import reconciliationService from "../services/reconciliation.service.js";
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { randomUUID } from "crypto";

export const uploadBankStatement = async (req, res) => {
    try {

        if (!req.file) {
            throw new ApiError(400, "Bank statement is required.");
        }

        const { transactions, invalidRows } =
            await bankStatementParserService.parseStatement(req.file);

        // DEBUG (remove before production)
        // console.log(`Parsed ${transactions.length} transaction(s)`);

        let importedCount = 0;
        let duplicateCount = 0;
        let failedCount = invalidRows.length;
        const importFailures = invalidRows.map((row) => ({
            transactionId: row.transactionId || `Row ${row.rowNumber}`,
            reason: row.reason,
        }));
        const uploadBatchId = randomUUID();

        for (const transaction of transactions) {

            try {

                const alreadyExists = await BankTransaction.exists({
                    $or: [
                        { transactionIdNormalized: transaction.transactionIdNormalized },
                        // Supports records imported before transactionIdNormalized existed.
                        { transactionId: transaction.transactionId },
                    ],
                });

                if (alreadyExists) {
                    duplicateCount++;
                    continue;
                }

                await BankTransaction.create({
                    ...transaction,

                    uploadedBy: req.admin.adminId,

                    statementFileName: req.file.originalname,
                    uploadBatchId,
                });

                importedCount++;

            } catch (error) {
                if (error?.code === 11000) {
                    duplicateCount++;
                } else {
                    failedCount++;
                    importFailures.push({
                        transactionId: transaction.transactionId,
                        reason: String(error?.message || "Import failed.").slice(0, 1000),
                    });
                }

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
                    invalidRowCount: invalidRows.length,
                    importFailures,
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

export const reconcileBankTransactions = async (req, res) => {
    try {
        const reconciliationSummary = await reconciliationService.reconcileTransactions();
        return res.status(200).json(
            new ApiResponse(200, { reconciliationSummary }, "Automated Donation Verification Completed Successfully.")
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message)
        );
    }
};

export const getBankStatementHistory = async (req, res) => {
    try {
        const uploads = await BankTransaction.aggregate([
            {
                $group: {
                    _id: {
                        batchId: { $ifNull: ["$uploadBatchId", "$statementFileName"] },
                        fileName: "$statementFileName",
                        uploadedBy: "$uploadedBy",
                    },
                    uploadedAt: { $min: "$createdAt" },
                    totalTransactions: { $sum: 1 },
                    matchedTransactions: {
                        $sum: { $cond: [{ $eq: ["$isMatched", true] }, 1, 0] },
                    },
                    failedTransactions: {
                        $sum: { $cond: [{ $eq: ["$reconciliationStatus", "FAILED"] }, 1, 0] },
                    },
                    unmatchedTransactions: {
                        $sum: { $cond: [{ $eq: ["$reconciliationStatus", "UNMATCHED"] }, 1, 0] },
                    },
                },
            },
            { $sort: { uploadedAt: -1 } },
            {
                $lookup: {
                    from: "admins",
                    localField: "_id.uploadedBy",
                    foreignField: "_id",
                    as: "uploader",
                },
            },
            {
                $project: {
                    _id: 0,
                    uploadBatchId: "$_id.batchId",
                    fileName: "$_id.fileName",
                    uploadedAt: 1,
                    totalTransactions: 1,
                    matchedTransactions: 1,
                    failedTransactions: 1,
                    unmatchedTransactions: 1,
                    uploadedByName: { $ifNull: [{ $arrayElemAt: ["$uploader.fullName", 0] }, "Unknown admin"] },
                },
            },
        ]);

        return res.status(200).json(
            new ApiResponse(200, { uploads }, "Bank statement history fetched successfully.")
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message)
        );
    }
};
