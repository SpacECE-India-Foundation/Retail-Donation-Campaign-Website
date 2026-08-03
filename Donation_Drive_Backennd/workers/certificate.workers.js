// import { Worker } from "bullmq";
// import mongoose from "mongoose";
// import redisConnection from "../config/redis.config.js";
// import Donation from "../models/donation.model.js";
// import Campaign from "../models/campaign.model.js";
// import Certificate from "../models/certificate.model.js";
// import certificateService from "../services/certificate.service.js";
// import { emailQueue } from "../queues/email.queue.js";
// import { ApiError } from "../utils/apiError.utils.js";


// //-------------------------------------THIS IS THE WORKER WHICH TOOK THE JOBS FROM REDIS CERTIFIATE QUEUE AND START PROCESSING IT---------------------------------------
// export const certificateWorker = new Worker(
//     "certificate-generation",
//     async (job) => {
//         const { donationId } = job.data;
        

//         try {
//             session.startTransaction();
//             const donation = await Donation.findById(donationId).session(session);

//             ApiError.assert(donation,"Donation Didn't found for the certificate generation")

//             if (donation.certificateGenerated) {
//                 console.log("Certificate already exists.");
//                 await session.commitTransaction();
//                 return;
//             }

//             const campaign = await Campaign.findById(
//                 donation.campaign
//             ).session(session);

//             ApiError.assert(campaign,"Campaign not found")
//             //Now, here we will generate the certificate 

//             const certificateData =
//                 await certificateService.generateAndUploadCertificate({
//                     donorName: donation.donorName,
//                     campaignName: campaign.campaignName,
//                     amount: donation.amount,
//                     donationDate: donation.paymentDate
//                 });

//             //now we will save the certificate data into the certificate collection

//             const session = await mongoose.startSession();

//             await Certificate.create([{

//                 certificateId:certificateData.certificateId,
//                 displayCertificateNo:certificateData.displayCertificateNo,
//                 donation:donation._id,
//                 donorName:donation.donorName,
//                 campaignName:campaign.campaignName,
//                 amount:donation.amount,
//                 donationDate:donation.paymentDate,
//                 certificateUrl:certificateData.certificateUrl,
//                 publicId:certificateData.publicId,
//                 verificationUrl:certificateData.verificationUrl,
//                 verified: true,
//                 verifiedAt: new Date()

//             }], {

//                 session

//             });

//             /*
//             -------------------------------
//             Update Donation
//             -------------------------------
//             */

//             donation.certificateGenerated = true;

//             donation.certificateUrl = certificateData.certificateUrl;

//             await donation.save({ session });

//             await session.commitTransaction();

//             /*
//             -------------------------------
//             NOW WE WILL INITIALISE THE Queue Email
//             -------------------------------
//             */

//             await emailQueue.add(
//                 "SEND_VERIFICATION_EMAIL",
//                 {
//                     donationId: donation._id.toString()
//                 }
//             );

//         }

//         catch (error) {

//             await session.abortTransaction();

//             throw error;

//         }

//         finally {

//             session.endSession();

//         }

//     },

//     {

//         connection: redisConnection,

//         concurrency: 3

//     }

// );

// certificateWorker.on("completed", (job) => {

//     console.log(`Certificate Job ${job.id} Completed`);

// });

// certificateWorker.on("failed", (job, err) => {

//     console.log(`Certificate Job ${job.id} Failed`);

//     console.log(err.message);

// });
import { Worker } from "bullmq";
import mongoose from "mongoose";
import redisConnection from "../config/redis.config.js";
import Donation from "../models/donation.modals.js";
import Campaign from "../models/campaign.modals.js";
import Certificate from "../models/certificate.modals.js";
import certificateServices from "../services/certificate.services.js";
import { emailQueue } from "../queues/email.queue.js";
import { ApiError } from "../utils/apiError.utils.js";

export const certificateWorker = new Worker(
    "certificate-generation",

    async (job) => {

        const { donationId } = job.data;

        /*
        ---------------------------------------------------
        Fetch Donation (No Transaction Required)
        ---------------------------------------------------
        */

        const donation = await Donation.findById(donationId);

        ApiError.assert(
            donation,
            "Donation not found for certificate generation."
        );

        if (!donation.verified) {
            throw new ApiError(
                400,
                "Certificate can only be generated for verified donations."
            );
        }

        if (donation.certificateGenerated) {
            console.log(
                `Certificate already generated for donation ${donation._id}`
            );
            return;
        }

        /*
        ---------------------------------------------------
        Fetch Campaign
        ---------------------------------------------------
        */

        const campaign = await Campaign.findById(
            donation.campaign
        );

        ApiError.assert(
            campaign,
            "Campaign not found."
        );

        /*
        ---------------------------------------------------
        Prevent Duplicate Certificate Record
        ---------------------------------------------------
        */

        const existingCertificate =
            await Certificate.findOne({
                donation: donation._id
            });

        if (existingCertificate) {

            donation.certificateGenerated = true;

            donation.certificateUrl =
                existingCertificate.certificateUrl;

            await donation.save();

            console.log(
                "Certificate record already exists."
            );

            return;
        }

        /*
        ---------------------------------------------------
        Generate PDF + Upload Cloudinary
        (Outside Transaction)
        ---------------------------------------------------
        */

        const certificateData =
            await certificateServices.generateAndUploadCertificate({

                donorName: donation.donorName,

                campaignName: campaign.campaignName,

                amount: donation.amount,

                donationDate: donation.paymentDate

            });

        /*
        ---------------------------------------------------
        Start Mongo Transaction
        ---------------------------------------------------
        */

        const session = await mongoose.startSession();

        try {

            session.startTransaction();

            /*
            ---------------------------------------------------
            Save Certificate
            ---------------------------------------------------
            */

            await Certificate.create(
                [
                    {

                        certificateId:
                            certificateData.certificateId,

                        displayCertificateNo:
                            certificateData.displayCertificateNo,

                        donation: donation._id,

                        donorName: donation.donorName,

                        campaignName: campaign.campaignName,

                        amount: donation.amount,

                        donationDate: donation.paymentDate,

                        certificateUrl:
                            certificateData.certificateUrl,

                        publicId:
                            certificateData.publicId,

                        verificationUrl:
                            certificateData.verificationUrl,

                        verified: true,

                        verifiedAt: new Date()

                    }
                ],
                {
                    session
                }
            );

            /*
            ---------------------------------------------------
            Update Donation
            ---------------------------------------------------
            */

            donation.certificateGenerated = true;

            donation.certificateUrl =
                certificateData.certificateUrl;

            await donation.save({
                session
            });

            /*
            ---------------------------------------------------
            Commit
            ---------------------------------------------------
            */

            await session.commitTransaction();

        }

        catch (error) {

            await session.abortTransaction();

            throw error;

        }

        finally {

            session.endSession();

        }

        /*
        ---------------------------------------------------
        Queue Verification Email
        ---------------------------------------------------
        */

        await emailQueue.add(
            "SEND_VERIFICATION_EMAIL",
            {
                donationId: donation._id.toString()
            }
        );

    },

    {
        connection: redisConnection,

        concurrency: 3
    }

);

certificateWorker.on(
    "completed",
    (job) => {

        console.log(
            `Certificate Job ${job.id} Completed`
        );

    }
);

certificateWorker.on(
    "failed",
    (job, err) => {

        console.log(
            `Certificate Job ${job?.id} Failed`
        );

        console.error(err.message);

    }
);

certificateWorker.on(
    "error",
    (err) => {

        console.error(
            "Certificate Worker Error:",
            err.message
        );

    }
);