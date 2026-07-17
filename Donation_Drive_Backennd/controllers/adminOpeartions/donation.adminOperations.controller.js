import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"

export const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params
    const { verificationRemarks } = req.body

    //just for debugging, remove later
    console.log("verifyDonation called for id:", id, "adminId:", req.admin?.adminId)

    ApiError.assert(id, "Donation ID is required")

    const donation = await Donation.findById(id)
    ApiError.notFound(donation, "Donation not found")
    ApiError.assert(donation.status === "Pending", "Donation is not pending verification")

    donation.status = "Verified"
    donation.verified = true
    donation.verifiedBy = req.admin.adminId
    donation.verifiedAt = new Date()
    if (verificationRemarks !== undefined) {
      donation.verificationRemarks = verificationRemarks
    }

    await donation.save()

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donation,
        },
        "Donation verified successfully"
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
