import BankTransaction from "../models/bankTransaction.model.js";
import autoVerificationService from "./autoVerification.service.js";
import { amountToPaise, normalizeTransactionId } from "../utils/bankTransaction.utils.js";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;
const errorMessage = (error) => String(error?.message || "Verification failed.").slice(0, 1000);

class ReconciliationService {
    async reconcileTransactions() {
        // A server crash must not leave a payment locked forever.
        await BankTransaction.updateMany(
            {
                reconciliationStatus: "PROCESSING",
                reconciliationLastAttemptedAt: { $lt: new Date(Date.now() - PROCESSING_TIMEOUT_MS) },
            },
            {
                $set: {
                    reconciliationStatus: "FAILED",
                    reconciliationError: "Processing timed out before verification completed.",
                },
            }
        );

        const candidates = await BankTransaction.find({
            isMatched: false,
            $or: [
                { reconciliationStatus: { $in: ["UNMATCHED", "FAILED"] } },
                { reconciliationStatus: { $exists: false } }, // records imported before this release
            ],
        }).sort({ createdAt: 1 });

        const summary = {
            totalTransactions: candidates.length,
            matchedCount: 0,
            unmatchedCount: 0,
            failedCount: 0,
            failures: [],
        };

        for (const candidate of candidates) {
            const transaction = await BankTransaction.findOneAndUpdate(
                {
                    _id: candidate._id,
                    isMatched: false,
                    $or: [
                        { reconciliationStatus: { $in: ["UNMATCHED", "FAILED"] } },
                        { reconciliationStatus: { $exists: false } },
                    ],
                },
                {
                    $set: {
                        reconciliationStatus: "PROCESSING",
                        reconciliationLastAttemptedAt: new Date(),
                        reconciliationError: "",
                    },
                    $inc: { reconciliationAttempts: 1 },
                },
                { returnDocument: "after" }
            );

            // Another request/job already owns this payment.
            if (!transaction) continue;

            const transactionIdNormalized = transaction.transactionIdNormalized
                || normalizeTransactionId(transaction.transactionId);
            const amountInPaise = transaction.amountInPaise || amountToPaise(transaction.amount);

            if (!transactionIdNormalized || !amountInPaise) {
                const reason = "Transaction has an invalid reference or amount.";
                await BankTransaction.updateOne(
                    { _id: transaction._id, reconciliationStatus: "PROCESSING" },
                    { $set: { reconciliationStatus: "FAILED", reconciliationError: reason } }
                );
                summary.failedCount++;
                summary.failures.push({ transactionId: transaction.transactionId, reason });
                continue;
            }

            try {
                const result = await autoVerificationService.verifyDonation({
                    bankTransactionId: transaction._id,
                    transactionIdNormalized,
                    amountInPaise,
                    superAdminId: transaction.uploadedBy,
                });

                summary.matchedCount++;
                if (result.emailError) {
                    summary.failures.push({
                        transactionId: transaction.transactionId,
                        reason: `Donation verified, but email delivery failed: ${result.emailError}`,
                    });
                }
            } catch (error) {
                const reason = errorMessage(error);

                // "No matching donation" is normal: the donation may be submitted later.
                const isUnmatched = error.code === "DONATION_NOT_FOUND";
                await BankTransaction.updateOne(
                    { _id: transaction._id, reconciliationStatus: "PROCESSING" },
                    {
                        $set: {
                            reconciliationStatus: isUnmatched ? "UNMATCHED" : "FAILED",
                            reconciliationError: reason,
                        },
                    }
                );

                if (isUnmatched) {
                    summary.unmatchedCount++;
                } else {
                    summary.failedCount++;
                    summary.failures.push({ transactionId: transaction.transactionId, reason });
                }
            }
        }

        summary.emailRetry = await autoVerificationService.retryFailedEmails();
        return summary;
    }
}

export default new ReconciliationService();
