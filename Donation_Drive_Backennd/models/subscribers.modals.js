//This modal is for the subsribers record, we will ask the users in every donation to be notified about the similar new campaigns and their already donated campaigns milestones achievement and events
import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },

        donorEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        subscribed: {
            type: Boolean,
            default: true,
        },

        subscribedCampaigns: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Campaign",
            },
        ],

        lastDonationAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

subscriberSchema.index({ donorEmail: 1 });

export default mongoose.model("Subscriber", subscriberSchema);