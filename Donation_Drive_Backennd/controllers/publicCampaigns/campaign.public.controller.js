import mongoose from "mongoose"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import Milestone from "../../models/milestone.modals.js"

export const fetchPublicCampaigns = async (req, res) => {
  try {
    //just for debugging, remove later
    // console.log("fetchPublicCampaigns called")
    const query = {}
    // console.log("fetchPublicCampaigns query:", query)
    const campaigns = await Campaign.find(query)
    .select(`
        campaignName
        campaignBanner
        campaignGoalAmt
        campaignRaisedAmt
        contributors
        campaignStatus
        startDate
        endDate
        `).sort({ createdAt: -1 }).lean()
    //just for debugging, remove later
    // console.log("fetchPublicCampaigns result count:", campaigns.length)

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
    // console.log("fetchPublicCampaignDetail called for id:", id)
    ApiError.assert(id, "Campaign ID is required")
    ApiError.assert(
      mongoose.Types.ObjectId.isValid(id),
      "Invalid campaign ID"
    )

    const campaignQuery = { _id: id }
    const milestoneQuery = { campaign: id }
    //just for debugging, remove later
    // console.log("fetchPublicCampaignDetail campaignQuery:", campaignQuery)
    // console.log("fetchPublicCampaignDetail milestoneQuery:", milestoneQuery)

    const [campaign, milestones] = await Promise.all([
      Campaign.findById(id).lean(),
      Milestone.find(milestoneQuery).sort({ displayOrder: 1 }).lean(),
    ])
    //just for debugging, remove later
    // console.log("fetchPublicCampaignDetail campaign result:", campaign ? { id: campaign._id, name: campaign.campaignName } : null)
    // console.log("fetchPublicCampaignDetail milestone count:", milestones.length)

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
