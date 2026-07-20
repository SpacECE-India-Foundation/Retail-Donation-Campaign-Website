import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Milestone from "../../models/milestone.modals.js"

export const fetchPublicMilestones = async (req, res) => {
  try {
    const { id } = req.params
    //just for debugging, remove later
    console.log("fetchPublicMilestones called for campaign id:", id)
    ApiError.assert(id, "Campaign ID is required")

    const milestones = await Milestone.find({ campaign: id })
      .sort({ displayOrder: 1 })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          milestones,
        },
        "Milestones fetched successfully"
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
