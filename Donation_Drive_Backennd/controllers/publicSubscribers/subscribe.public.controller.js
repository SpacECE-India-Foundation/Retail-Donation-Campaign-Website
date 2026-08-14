import Subscriber from "../../models/subscribers.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeToUpdates = async (req, res) => {
    try {
        const donorName = String(req.body?.name || req.body?.donorName || "").trim();
        const donorEmail = String(req.body?.email || req.body?.donorEmail || "").trim().toLowerCase();

        ApiError.assert(donorName, "Name is required.");
        ApiError.assert(EMAIL_PATTERN.test(donorEmail), "A valid email is required.");

        const subscriber = await Subscriber.findOneAndUpdate(
            { donorEmail },
            {
                $setOnInsert: {
                    donorName,
                    donorEmail,
                    subscribedCampaigns: [],
                    lastDonationAt: null,
                },
                $set: { subscribed: true },
            },
            { upsert: true, new: true, runValidators: true }
        ).select("_id donorName donorEmail subscribed").lean();

        return res.status(200).json(new ApiResponse(
            200,
            { subscriber },
            "You have been subscribed to campaign updates successfully."
        ));
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Failed to subscribe to campaign updates.")
        );
    }
};
