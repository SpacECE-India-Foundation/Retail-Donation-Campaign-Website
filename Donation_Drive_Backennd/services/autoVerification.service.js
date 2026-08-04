import mongoose from "mongoose";
import Donation from "../models/donation.modals.js";
import Campaign from "../models/campaign.modals.js";
import Milestone from "../models/milestone.modals.js";
import Certificate from "../models/certificate.modals.js";
import BankTransaction from "../models/bankTransaction.model.js";
import certificateService from "./certificate.services.js";
import emailService from "./email.services.js";
import { ApiError } from "../utils/apiError.utils.js";
import { normalizeTransactionId, paiseToAmount } from "../utils/bankTransaction.utils.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function syncMilestoneCompletion(campaignId, session) {
    const freshCampaign = await Campaign.findById(campaignId).session(session);
    if (!freshCampaign) return;

    const milestones = await Milestone.find({ campaign: campaignId })
        .sort({ displayOrder: 1 })
        .session(session);
    const now = new Date();

    for (const milestone of milestones) {
        if (!milestone.isCompleted && milestone.targetAmount <= freshCampaign.campaignRaisedAmt) {
            milestone.isCompleted = true;
            milestone.completedAt = now;
            await milestone.save({ session });
        }
    }
}

class AutoVerificationService {
    async retryFailedEmails() {
        const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
        await BankTransaction.updateMany(
            { emailStatus: "PROCESSING", emailLastAttemptedAt: { $lt: staleBefore } },
            { $set: { emailStatus: "FAILED", emailError: "Email processing timed out." } }
        );

        const candidates = await BankTransaction.find({
            isMatched: true,
            matchedDonation: { $ne: null },
            $or: [
                { emailStatus: { $in: ["NOT_SENT", "FAILED"] } },
                { emailStatus: { $exists: false } },
            ],
        })
            .sort({ matchedAt: 1 })
            .limit(100);

        let sentCount = 0;
        let failedCount = 0;

        for (const candidate of candidates) {
            const transaction = await BankTransaction.findOneAndUpdate(
                {
                    _id: candidate._id,
                    $or: [
                        { emailStatus: { $in: ["NOT_SENT", "FAILED"] } },
                        { emailStatus: { $exists: false } },
                    ],
                },
                { $set: { emailStatus: "PROCESSING", emailLastAttemptedAt: new Date() } },
                { returnDocument: "after" }
            ).populate("matchedDonation");
            if (!transaction) continue;

            const donation = transaction.matchedDonation;
            if (!donation || donation.status !== "Verified") {
                await BankTransaction.updateOne(
                    { _id: transaction._id },
                    {
                        $set: {
                            emailStatus: "FAILED",
                            emailError: "Matched donation is unavailable or not verified.",
                        },
                    }
                );
                failedCount++;
                continue;
            }

            try {
                const campaign = await Campaign.findById(donation.campaign);
                ApiError.assert(campaign, "Campaign not found.", 404);

                await emailService.sendDonationVerifiedEmail({
                    donorName: donation.donorName,
                    donorEmail: donation.donorEmail,
                    campaignName: campaign.campaignName,
                    donationAmount: donation.amount,
                    transactionId: donation.transactionId,
                    certificateLink: donation.certificateUrl,
                });
                await BankTransaction.updateOne(
                    { _id: transaction._id },
                    { $set: { emailStatus: "SENT", emailError: "" } }
                );
                sentCount++;
            } catch (error) {
                await BankTransaction.updateOne(
                    { _id: transaction._id },
                    {
                        $set: {
                            emailStatus: "FAILED",
                            emailError: String(error?.message || "Email delivery failed.").slice(0, 1000),
                        },
                    }
                );
                failedCount++;
            }
        }

        return { attemptedCount: candidates.length, sentCount, failedCount };
    }

    
    async verifyDonation({donation,
    bankTransaction,
    superAdminId}) {
        
        const campaignForCertificate = await Campaign.findById(donation.campaign);
        ApiError.assert(campaignForCertificate, "Campaign not found.", 404);

        // External work is deliberately outside the database transaction. If the transaction
        // fails, the catch block below compensates by deleting the uploaded PDF.
        const certificateData = await certificateService.generateAndUploadCertificate({
            donorName: donation.donorName,
            campaignName: campaignForCertificate.campaignName,
            amount: donation.amount,
            donationDate: donation.paymentDate,
        });

        let session;
        let verifiedDonation;
        let campaign;
        let committed = false;

        try {
            session = await mongoose.startSession();
            await session.withTransaction(async () => {
                const freshDonation = await Donation.findOne({
                    _id: donation._id,
                    status:"Pending"
                }).session(session);
                ApiError.assert(freshDonation, "Donation has already been processed.", 409);

                campaign = await Campaign.findById(freshDonation.campaign).session(session);
                ApiError.assert(campaign, "Campaign not found.", 404);

                verifiedDonation = await Donation.findOneAndUpdate(
                    { _id: freshDonation._id, status: "Pending" },
                    {
                        $set: {
                            status: "Verified",
                            verified: true,
                            verifiedBy: superAdminId,
                            verifiedAt: new Date(),
                            certificateGenerated: true,
                            certificateUrl: certificateData.certificateUrl,
                            automaticVerificationAttempted: true,
                        },
                    },
                    { returnDocument: "after", session }
                );
                ApiError.assert(verifiedDonation, "Donation has already been processed.", 409);

                await Campaign.findByIdAndUpdate(
                    campaign._id,
                    { $inc: { campaignRaisedAmt: freshDonation.amount, contributors: 1 } },
                    { session }
                );

                await syncMilestoneCompletion(campaign._id, session);

                // The donation is claimed atomically above; this check also makes recovery
                // safe if a legacy partial certificate record exists.
                const existingCertificate = await Certificate.findOne({ donation: freshDonation._id }).session(session);
                if (!existingCertificate) {
                    await Certificate.create([{
                        certificateId: certificateData.certificateId,
                        donation: freshDonation._id,
                        displayCertificateNo: certificateData.displayCertificateNo,
                        donorName: freshDonation.donorName,
                        campaignName: campaign.campaignName,
                        amount: freshDonation.amount,
                        donationDate: freshDonation.paymentDate,
                        certificateUrl: certificateData.certificateUrl,
                        publicId: certificateData.publicId,
                        verificationUrl: certificateData.verificationUrl,
                        verified: true,
                        verifiedAt: new Date(),
                    }], { session });
                }

                const matchedTransaction = await BankTransaction.findOneAndUpdate(
                    { _id: bankTransaction._id, isMatched: false },
                    {
                        $set: {
                            isMatched: true,
                            matchedDonation: freshDonation._id,
                            matchedAt: new Date(),
                            reconciliationStatus: "MATCHED",
                            reconciliationError: "",
                            emailStatus: "PROCESSING",
                            emailLastAttemptedAt: new Date(),
                        },
                    },
                        { returnDocument: "after", session }
                    );
                    ApiError.assert(matchedTransaction, "Bank transaction is no longer available for reconciliation.", 409);
                }
            });
            committed = true;
        } catch (error) {
            if (certificateData?.publicId) {
                await certificateService.deleteCertificate(certificateData.publicId);
            }
            throw error;
        } finally {
            session?.endSession();
        }

        let emailError = "";
        try {
            await emailService.sendDonationVerifiedEmail({
                donorName: verifiedDonation.donorName,
                donorEmail: verifiedDonation.donorEmail,
                campaignName: campaign.campaignName,
                donationAmount: verifiedDonation.amount,
                transactionId: verifiedDonation.transactionId,
                certificateLink: verifiedDonation.certificateUrl,
            });
            await BankTransaction.updateOne(
                {  _id: bankTransaction._id},
                { $set: { emailStatus: "SENT", emailError: "" } }
            );
        } catch (error) {
            emailError = String(error?.message || "Email delivery failed.").slice(0, 1000);
            await BankTransaction.updateOne(
                { _id: bankTransaction._id },
                { $set: { emailStatus: "FAILED", emailError } }
            );
        }

        return { donation: verifiedDonation, committed, emailError };
    }
}

export default new AutoVerificationService();
