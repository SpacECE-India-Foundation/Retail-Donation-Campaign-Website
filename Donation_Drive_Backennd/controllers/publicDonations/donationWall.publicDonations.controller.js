import Donation from "../../models/donation.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import Campaign from "../../models/campaign.modals.js";

//------------------------------------THIS IS THE CONTROLLER FUNCTION TO GET THE DATA ON THE DONATION WALL------------------------------------------------------- 
export const fetchDonationsForDonationWall = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const lastDays = Number(req.query.lastDays);

        const skip = (page - 1) * limit;

        const filter = {
            status: "Verified"
        };

        // Optional filter: last X days
        if (!isNaN(lastDays) && lastDays > 0) {
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - lastDays);

            filter.verifiedAt = {
                $gte: fromDate
            };
        }

        const [
    donations,
    totalDonations,
    totalCampaigns,
    totalRaisedResult
] = await Promise.all([

    Donation.find(filter)
        .select("donorName amount donorMessage verifiedAt campaign")
        .populate("campaign", "campaignName")
        .sort({ verifiedAt: -1 })
        .skip(skip)
        .limit(limit),

    Donation.countDocuments(filter),

    Campaign.countDocuments(),

    Donation.aggregate([
        {
            $match: filter
        },
        {
            $group: {
                _id: null,
                totalAmount: {
                    $sum: "$amount"
                }
            }
        }
    ])
]);

const totalRaised = totalRaisedResult[0]?.totalAmount || 0;

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    donations,
                    pagination: {
                        page,
                        limit,
                        totalDonations,
                        totalPages: Math.ceil(totalDonations / limit),
                        hasNextPage: page * limit < totalDonations,
                        hasPreviousPage: page > 1
                    },
                   statistics: {
                        totalRaised,
                        totalDonations,
                        totalCampaigns
                    }
                },
                "Donation wall fetched successfully."
            )
        );

    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        );
    }
};