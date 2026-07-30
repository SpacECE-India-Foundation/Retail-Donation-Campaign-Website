import BankTransaction from "../models/bankTransaction.model.js";
import Donation from "../models/donation.modals.js";
import autoVerificationService from "./autoVerification.service.js";

class ReconciliationService {

    async reconcileTransactions() {

        // DEBUG (remove before production)
        // console.log("Starting reconciliation...");

        const transactions = await BankTransaction.find({
            isMatched: false,
        });

        let matchedCount = 0;

        for (const transaction of transactions) {

            // DEBUG (remove before production)
            // console.log("Checking transaction:", transaction.transactionId);

            const donation = await Donation.findOne({
                transactionId: transaction.transactionId,
                amount: transaction.amount,
                status: "Pending",
            });

            if (!donation) {
                continue;
            }

            try {

                await autoVerificationService.verifyDonation({
                    donationId: donation._id,
                    superAdminId: transaction.uploadedBy,
                });

                // Only mark the transaction as matched
                // after successful verification
                transaction.isMatched = true;
                transaction.matchedDonation = donation._id;
                transaction.matchedAt = new Date();

                await transaction.save();

                matchedCount++;

            } catch (error) {

                // DEBUG (remove before production)
                console.error(
                    `Auto verification failed for Donation ${donation._id}:`,
                    error.message
                );

                continue;

            }

        }

        return {
            totalTransactions: transactions.length,
            matchedCount,
            unmatchedCount: transactions.length - matchedCount,
        };
    }

}

export default new ReconciliationService();