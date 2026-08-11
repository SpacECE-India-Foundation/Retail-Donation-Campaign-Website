// This service manages donor subscriptions for future campaign notifications
// and updates related to campaigns they have contributed to.

import Subscriber from "../models/subscribers.modals.js";
import { ApiError } from "../utils/apiError.utils.js";

export const addUserToSubscribers = async ({
    donorName,
    donorEmail,
    campaignId,
}) => {
    try {

        ApiError.assert(donorEmail, "Donor email is required to subscribe.", 400);
        ApiError.assert(donorName, "Donor name is required to subscribe.", 400);

        const update = {
            $setOnInsert: {
                donorName,
                donorEmail,
                subscribed: true,
            },

            $set: {
                lastDonationAt: new Date(),
            },
        };

        // Only add campaign if campaignId is provided
        if (campaignId) {
            update.$addToSet = {
                subscribedCampaigns: campaignId,
            };
        }

        const subscriber = await Subscriber.findOneAndUpdate(
            {
                donorEmail,
            },
            update,
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );

        return subscriber;

    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        console.error("Error while adding donor to subscribers:", error);

        throw new ApiError(
            500,
            "Failed to subscribe donor for campaign notifications."
        );
    }
};
