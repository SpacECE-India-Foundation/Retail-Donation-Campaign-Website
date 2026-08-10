import Subscribers from "../../models/subscribers.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import {ApiResponse} from "../../utils/apiResponse.utils.js";



//------------------------------------------------------------SEARCH FUNCTIONALITY FOR SUBSCRIBERS------------------------------------------------
export const searchSubscribers = async (req, res) => {
    // Search subscribers by donor name or email
    // Pagination is handled here.
    // Debouncing should be implemented on the frontend.

    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const skip = (page - 1) * limit;

        const search = String(req.query.search || "").trim();

        let filter = {};

        if (search) {
            const regex = new RegExp(search, "i");

            filter = {
                $or: [
                    { donorName: regex },
                    { donorEmail: regex }
                ]
            };
        }

        const [subscribers, totalSubscribers] = await Promise.all([
            Subscribers.find(filter)
                .skip(skip)
                .limit(limit)
                .lean(),

            Subscribers.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalSubscribers / limit);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    subscribers,
                    pagination: {
                        currentPage: page,
                        limit,
                        totalSubscribers,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                },
                "Subscribers fetched successfully."
            )
        );

    } catch (error) {
        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message || "Failed to search subscribers."
            )
        );
    }
};