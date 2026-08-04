import Donation from "../models/donation.modals.js";
import BankTransaction from "../models/bankTransaction.model.js";
import { normalizeTransactionId } from "../utils/bankTransaction.utils.js";

class DonationScanService {

    async markAutoVerificationAttempted() {

        const donations = await Donation.find({

            status: "Pending",

            automaticVerificationAttempted: false

        });

        let updated = 0;

        for (const donation of donations) {

            const normalized = normalizeTransactionId(
                donation.transactionId
            );

            const transaction = await BankTransaction.findOne({

                transactionIdNormalized: normalized

            });

            await Donation.updateOne(

                {

                    _id: donation._id

                },

                {

                    $set: {

                        automaticVerificationAttempted: true

                    }

                }

            );

            updated++;

        }

        return {

            updated

        };

    }

}

export default new DonationScanService();