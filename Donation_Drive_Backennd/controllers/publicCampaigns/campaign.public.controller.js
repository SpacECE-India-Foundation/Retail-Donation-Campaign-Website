import mongoose from "mongoose"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import Milestone from "../../models/milestone.modals.js"

export const fetchPublicCampaigns = async (req, res) => {
  try {
    //just for debugging, remove later
    console.log("fetchPublicCampaigns called")
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          campaigns,
        },
        "Campaigns fetched successfully"
      )
    )
  } catch (error) {
    console.error(error)
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message
      )
    )
  }
}

export const fetchPublicCampaignDetail = async (req, res) => {
  try {
    const { id } = req.params
    //just for debugging, remove later
    console.log("fetchPublicCampaignDetail called for id:", id)
    ApiError.assert(id, "Campaign ID is required")
    ApiError.assert(
      mongoose.Types.ObjectId.isValid(id),
      "Invalid campaign ID"
    )

    const [campaign, milestones] = await Promise.all([
      Campaign.findById(id),
      Milestone.find({ campaign: id }).sort({ displayOrder: 1 }),
    ])

    ApiError.notFound(campaign, "Campaign not found")

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          campaign,
          milestones,
        },
        "Campaign details fetched successfully"
      )
    )
  } catch (error) {
    console.error(error)
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message
      )
    )
  }
}
