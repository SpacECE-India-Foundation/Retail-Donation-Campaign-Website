import "dotenv/config";
import mongoose from "mongoose";

import Admin from "./models/admin.modals.js";
import Campaign from "./models/campaign.modals.js";
import Certificate from "./models/certificate.modals.js";
import Donation from "./models/donation.modals.js";
import Message from "./models/message.modals.js";
import Milestone from "./models/milestone.modals.js";
import Otp from "./models/otp.modals.js";

const models = [Admin, Campaign, Certificate, Donation, Message, Milestone, Otp];

const printCollectionContents = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MONGODB_URI is not set. Please add it to your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    for (const model of models) {
      const collectionName = model.collection.name;
      const docs = await model.find({}).lean();

      console.log(`\n========================================`);
      console.log(`Collection: ${collectionName}`);
      console.log(`Model: ${model.modelName}`);
      console.log(`Document count: ${docs.length}`);
      console.log(`========================================`);

      if (docs.length === 0) {
        console.log("(empty)");
        continue;
      }

      console.log(JSON.stringify(docs, null, 2));
    }
  } catch (error) {
    console.error("Failed to print collections:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
};

printCollectionContents();
