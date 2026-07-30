// services/autoVerification.service.js

import mongoose from "mongoose";

import Donation from "../models/donation.modals.js";
import Campaign from "../models/campaign.modals.js";
import Milestone from "../models/milestone.modals.js";
import Certificate from "../models/certificate.modals.js";

import certificateService from "./certificate.services.js";
import emailService from "./email.services.js";

import { ApiError } from "../utils/apiError.utils.js";

// DEBUG (remove before production)

async function syncMilestoneCompletion(campaignId, session) {

    const [freshCampaign, milestones] = await Promise.all([

        Campaign.findById(campaignId).session(session),

        Milestone.find({
            campaign: campaignId,
        })
            .sort({
                displayOrder: 1,
            })
            .session(session),

    ]);

    if (!freshCampaign) {
        return;
    }

    const now = new Date();

    for (const milestone of milestones) {

        if (
            !milestone.isCompleted &&
            milestone.targetAmount <= freshCampaign.campaignRaisedAmt
        ) {

            milestone.isCompleted = true;
            milestone.completedAt = now;

            await milestone.save({
                session,
            });

        }

    }

}

class AutoVerificationService {

    async verifyDonation({ donationId, superAdminId }) {

        const session = await mongoose.startSession();

        try {

            session.startTransaction();

            const donation = await Donation.findOne({
                _id: donationId,
                status: "Pending",
            }).session(session);

            ApiError.assert(
                donation,
                "Donation not found."
            );

            const campaign = await Campaign.findById(
                donation.campaign
            ).session(session);

            ApiError.assert(
                campaign,
                "Campaign not found."
            );

            let certificateData = null;

            try {

                certificateData =
                    await certificateService.generateAndUploadCertificate({

                        donorName: donation.donorName,

                        campaignName: campaign.campaignName,

                        amount: donation.amount,

                        donationDate: donation.paymentDate,

                    });

            } catch (error) {

                console.error(
                    "Certificate generation failed:",
                    error.message
                );

            }

            if (certificateData) {

                donation.certificateGenerated = true;
                donation.certificateUrl =
                    certificateData.certificateUrl;

            }

            donation.status = "Verified";
            donation.verified = true;
            donation.verifiedBy = superAdminId;
            donation.verifiedAt = new Date();

            const operations = [

                donation.save({
                    session,
                }),

                Campaign.findByIdAndUpdate(
                    campaign._id,
                    {
                        $inc: {
                            campaignRaisedAmt: donation.amount,
                            contributors: 1,
                        },
                    },
                    {
                        session,
                    }
                ),

            ];

            if (certificateData) {

                operations.push(

                    Certificate.create(
                        [
                            {

                                certificateId:
                                    certificateData.certificateId,

                                donation: donation._id,

                                displayCertificateNo:
                                    certificateData.displayCertificateNo,

                                donorName: donation.donorName,

                                campaignName:
                                    campaign.campaignName,

                                amount: donation.amount,

                                donationDate:
                                    donation.paymentDate,

                                certificateUrl:
                                    certificateData.certificateUrl,

                                publicId:
                                    certificateData.publicId,

                                verificationUrl:
                                    certificateData.verificationUrl,

                                verified: true,

                                verifiedAt: new Date(),

                            },
                        ],
                        {
                            session,
                        }
                    )

                );

            }

            await Promise.all(operations);

            await syncMilestoneCompletion(
                campaign._id,
                session
            );

            await session.commitTransaction();

            emailService
                .sendDonationVerifiedEmail({

                    donorName: donation.donorName,

                    donorEmail: donation.donorEmail,

                    campaignName: campaign.campaignName,

                    donationAmount: donation.amount,

                    transactionId:
                        donation.transactionId,

                    certificateLink:
                        donation.certificateUrl,

                })
                .catch(console.error);

            return donation;

        } catch (error) {

            await session.abortTransaction();
            throw error;

        } finally {

            session.endSession();

        }

    }

}

export default new AutoVerificationService();