import { Worker } from "bullmq";
import redisConnection from "../config/redis.config.js";
import Donation from "../models/donation.modals.js";
import Campaign from "../models/campaign.modals.js";
import emailService from "../services/email.services.js";

export const emailWorker = new Worker(

    "email-service",

    async (job) => {

        const { donationId } = job.data;

        /*
        -----------------------------------------
        Fetch Donation
        -----------------------------------------
        */

        const donation = await Donation.findById(donationId);

        if (!donation) {

            throw new Error("Donation not found");

        }

        /*
        -----------------------------------------
        Prevent Duplicate Emails
        -----------------------------------------
        */

        if (donation.verificationEmailSent) {

            console.log(
                `Verification email already sent for Donation : ${donation._id}`
            );

            return;

        }

        /*
        -----------------------------------------
        Fetch Campaign
        -----------------------------------------
        */

        const campaign = await Campaign.findById(
            donation.campaign
        );

        if (!campaign) {

            throw new Error("Campaign not found");

        }

        /*
        -----------------------------------------
        Send Email
        -----------------------------------------
        */

        await emailService.sendDonationVerifiedEmail({

            donorName: donation.donorName,

            donorEmail: donation.donorEmail,

            campaignName: campaign.campaignName,

            donationAmount: donation.amount,

            transactionId: donation.transactionId,

            certificateLink: donation.certificateUrl

        });

        /*
        -----------------------------------------
        Mark Email Sent
        -----------------------------------------
        */

        donation.verificationEmailSent = true;

        await donation.save();

        console.log(
            `Verification Email Sent Successfully : ${donation.donorEmail}`
        );

    },

    {

        connection: redisConnection,

        concurrency: 10

    }

);

emailWorker.on(

    "completed",

    (job) => {

        console.log(
            `Email Job ${job.id} Completed`
        );

    }

);

emailWorker.on(

    "failed",

    (job, error) => {

        console.log(
            `Email Job ${job?.id} Failed`
        );

        console.error(error.message);

    }

);