import "dotenv/config";
import mongoose from "mongoose";

import Campaign from "./models/campaign.modals.js";
import Donation from "./models/donation.modals.js";

const populateDonations = async () => {

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("MONGODB_URI is not set.");
        process.exit(1);
    }

    try {

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        // Uses the first campaign in the database
        const campaign = await Campaign.findOne({ campaignName: "testcampaign2" });

        if (!campaign) {
            console.log("No campaign found.");
            process.exit(1);
        }

        const donations = [];

        const amounts = [
            500,
            1200,
            750,
            2500,
            1000,
            150,
            3000,
            850,
            600,
            2000,
        ];

        for (let i = 1; i <= 10; i++) {

            donations.push({

                donorName: `Test Donor ${i}`,

                donorEmail: `juhi.gupta@avantika.edu.in`,

                donorPhone: `98765432${String(i).padStart(2, "0")}`,

                address: "Test Address",

                donorMessage: "Testing Auto Verification",

                amount: amounts[i - 1],

                paymentMode: "UPI",

                transactionId: `TSN22610${i}`,

                paymentDate: new Date(),

                screenshot: {
                  "url": "https://res.cloudinary.com/ygrmkhks/image/upload/v1784909563/donation-screenshots/in07jz61clhwtqbxzrkw.png",
                  "publicId": "donation-screenshots/in07jz61clhwtqbxzrkw"
                },

                campaign: campaign._id,

                status: "Pending",

            });

        }

        let inserted = 0;

        for (const donation of donations) {

            const exists = await Donation.findOne({
                transactionId: donation.transactionId,
            });

            if (exists) {
                console.log(`Skipped ${donation.transactionId}`);
                continue;
            }

            await Donation.create(donation);

            console.log(`Inserted ${donation.transactionId}`);

            inserted++;

        }

        console.log(`\nInserted ${inserted} donations.`);

    } catch (error) {

        console.error(error);

    } finally {

        await mongoose.disconnect();

        console.log("Disconnected.");

    }

};

populateDonations();