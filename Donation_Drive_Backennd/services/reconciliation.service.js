// import BankTransaction from "../models/bankTransaction.model.js";
// import autoVerificationService from "./autoVerification.service.js";
// import { amountToPaise, normalizeTransactionId } from "../utils/bankTransaction.utils.js";

// const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;
// const errorMessage = (error) => String(error?.message || "Verification failed.").slice(0, 1000);

// class ReconciliationService {
//     async reconcileTransactions() {
//         // A server crash must not leave a payment locked forever.
//         await BankTransaction.updateMany(
//             {
//                 reconciliationStatus: "PROCESSING",
//                 reconciliationLastAttemptedAt: { $lt: new Date(Date.now() - PROCESSING_TIMEOUT_MS) },
//             },
//             {
//                 $set: {
//                     reconciliationStatus: "FAILED",
//                     reconciliationError: "Processing timed out before verification completed.",
//                 },
//             }
//         );

//         const candidates = await BankTransaction.find({
//             isMatched: false,
//             $or: [
//                 { reconciliationStatus: { $in: ["UNMATCHED", "FAILED"] } },
//                 { reconciliationStatus: { $exists: false } }, // records imported before this release
//             ],
//         }).sort({ createdAt: 1 });

//         const summary = {
//             totalTransactions: candidates.length,
//             matchedCount: 0,
//             unmatchedCount: 0,
//             failedCount: 0,
//             failures: [],
//         };

//         for (const candidate of candidates) {
//             const transaction = await BankTransaction.findOneAndUpdate(
//                 {
//                     _id: candidate._id,
//                     isMatched: false,
//                     $or: [
//                         { reconciliationStatus: { $in: ["UNMATCHED", "FAILED"] } },
//                         { reconciliationStatus: { $exists: false } },
//                     ],
//                 },
//                 {
//                     $set: {
//                         reconciliationStatus: "PROCESSING",
//                         reconciliationLastAttemptedAt: new Date(),
//                         reconciliationError: "",
//                     },
//                     $inc: { reconciliationAttempts: 1 },
//                 },
//                 { returnDocument: "after" }
//             );

//             // Another request/job already owns this payment.
//             if (!transaction) continue;

//             const transactionIdNormalized = transaction.transactionIdNormalized
//                 || normalizeTransactionId(transaction.transactionId);
//             const amountInPaise = transaction.amountInPaise || amountToPaise(transaction.amount);

//             if (!transactionIdNormalized || !amountInPaise) {
//                 const reason = "Transaction has an invalid reference or amount.";
//                 await BankTransaction.updateOne(
//                     { _id: transaction._id, reconciliationStatus: "PROCESSING" },
//                     { $set: { reconciliationStatus: "FAILED", reconciliationError: reason } }
//                 );
//                 summary.failedCount++;
//                 summary.failures.push({ transactionId: transaction.transactionId, reason });
//                 continue;
//             }

//             try {
//                 const result = await autoVerificationService.verifyDonation({
//                     bankTransactionId: transaction._id,
//                     transactionIdNormalized,
//                     amountInPaise,
//                     superAdminId: transaction.uploadedBy,
//                 });

//                 summary.matchedCount++;
//                 if (result.emailError) {
//                     summary.failures.push({
//                         transactionId: transaction.transactionId,
//                         reason: `Donation verified, but email delivery failed: ${result.emailError}`,
//                     });
//                 }
//             } catch (error) {
//                 const reason = errorMessage(error);

//                 // "No matching donation" is normal: the donation may be submitted later.
//                 const isUnmatched = error.code === "DONATION_NOT_FOUND";
//                 await BankTransaction.updateOne(
//                     { _id: transaction._id, reconciliationStatus: "PROCESSING" },
//                     {
//                         $set: {
//                             reconciliationStatus: isUnmatched ? "UNMATCHED" : "FAILED",
//                             reconciliationError: reason,
//                         },
//                     }
//                 );

//                 if (isUnmatched) {
//                     summary.unmatchedCount++;
//                 } else {
//                     summary.failedCount++;
//                     summary.failures.push({ transactionId: transaction.transactionId, reason });
//                 }
//             }
//         }

//         summary.emailRetry = await autoVerificationService.retryFailedEmails();
//         return summary;
//     }
// }

// export default new ReconciliationService();

import BankTransaction from "../models/bankTransaction.model.js";
import autoVerificationService from "./autoVerification.service.js";
import { amountToPaise, normalizeTransactionId } from "../utils/bankTransaction.utils.js";
import Donation from "../models/donation.modals.js";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;
const errorMessage = (error) =>
    String(error?.message || "Verification failed.").slice(0, 1000);

class ReconciliationService {
    async reconcileTransactions() {

        await BankTransaction.updateMany(
            {
                reconciliationStatus: "PROCESSING",
                reconciliationLastAttemptedAt: {
                    $lt: new Date(Date.now() - PROCESSING_TIMEOUT_MS),
                },
            },
            {
                $set: {
                    reconciliationStatus: "FAILED",
                    reconciliationError:
                        "Processing timed out before verification completed.",
                },
            }
        );

        const donations = await Donation.find({
            status: "Pending",
            verified: false,
        }).sort({ createdAt: 1 });
        //just for debugging, remove later
        console.log( "Reconciliation candidates", {
            donationCount: donations.length,
        });

        const summary = {
            totalDonations: donations.length,
            matchedCount: 0,
            pendingManualReview: 0,
            failedCount: 0,
            failures: [],
        };

        for (const donation of donations) {
            //just for debugging, remove later
            console.log("Evaluating donation for auto-verification", {
                donationId: donation._id,
                transactionId: donation.transactionId,
                amount: donation.amount,
            });

            const transactionIdNormalized = normalizeTransactionId(
                donation.transactionId
            );

            const amountInPaise = amountToPaise(donation.amount);

            const transaction = await BankTransaction.findOne({
                isMatched: false,
                transactionIdNormalized,
                $or: [
                    {
                        reconciliationStatus: {
                            $in: ["UNMATCHED", "FAILED"],
                        },
                    },
                    {
                        reconciliationStatus: {
                            $exists: false,
                        },
                    },
                ],
            });

            // No transaction found
            if (!transaction) {
                //just for debugging, remove later
                console.log( "No matching bank transaction found for donation", {
                    donationId: donation._id,
                    transactionId: donation.transactionId,
                });
                donation.automaticVerificationAttempted = true;
                await donation.save();

                summary.pendingManualReview++;
                continue;
            }

            const bankAmount =
                transaction.amountInPaise ??
                amountToPaise(transaction.amount);

            // Amount mismatch
            if (bankAmount !== amountInPaise) {
                //just for debugging, remove later
                console.log("Donation amount mismatch", {
                    donationId: donation._id,
                    donationAmountInPaise: amountInPaise,
                    bankAmountInPaise: bankAmount,
                });
                donation.automaticVerificationAttempted = true;
                await donation.save();

                summary.pendingManualReview++;
                continue;
            }

            //just for debugging, remove later
            console.log("Attempting donation verification", {
                donationId: donation._id,
                transactionId: transaction.transactionId,
                bankTransactionId: transaction._id,
            });

            try {

                const result =
                    await autoVerificationService.verifyDonation({
                        donation,
                        bankTransaction: transaction,
                        superAdminId: transaction.uploadedBy,
                    });

                //just for debugging, remove later
                console.log("Donation verified successfully", {
                    donationId: donation._id,
                    bankTransactionId: transaction._id,
                    result,
                });
                summary.matchedCount++;

                if (result.emailError) {
                    summary.failures.push({
                        donationId: donation._id,
                        reason: `Donation verified but email failed: ${result.emailError}`,
                    });
                }

            } catch (error) {

                //just for debugging, remove later
                console.log("Donation verification failed", {
                    donationId: donation._id,
                    error: errorMessage(error),
                });

                donation.automaticVerificationAttempted = true;
                await donation.save();

                summary.failedCount++;

                summary.failures.push({
                    donationId: donation._id,
                    reason: errorMessage(error),
                });

            }
        }

        summary.emailRetry =
            await autoVerificationService.retryFailedEmails();
        return summary;
    }
}

export default new ReconciliationService();