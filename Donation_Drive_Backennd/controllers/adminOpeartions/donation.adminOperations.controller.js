import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"

export const fetchDonations = async (req, res) => {
  try {
    const {
      status,
      campaign,
      donorName,
      donorEmail,
      transactionId,
      paymentMode,
      verified,
      minAmount,
      maxAmount,
      paymentDateFrom,
      paymentDateTo,
    } = req.query

    //just for debugging, remove later
    console.log("fetchDonations called with query:", req.query)

    const filter = {}

    if (status) {
      filter.status = status
    }
    if (campaign) {
      filter.campaign = campaign
    }
    if (donorName) {
      filter.donorName = { $regex: donorName, $options: "i" }
    }
    if (donorEmail) {
      filter.donorEmail = { $regex: donorEmail, $options: "i" }
    }
    if (transactionId) {
      filter.transactionId = { $regex: transactionId, $options: "i" }
    }
    if (paymentMode) {
      filter.paymentMode = paymentMode
    }
    if (verified !== undefined) {
      filter.verified = verified === "true" || verified === "1"
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {}
      if (minAmount !== undefined && !isNaN(Number(minAmount))) {
        filter.amount.$gte = Number(minAmount)
      }
      if (maxAmount !== undefined && !isNaN(Number(maxAmount))) {
        filter.amount.$lte = Number(maxAmount)
      }
      if (Object.keys(filter.amount).length === 0) {
        delete filter.amount
      }
    }

    if (paymentDateFrom || paymentDateTo) {
      filter.paymentDate = {}
      if (paymentDateFrom) {
        const fromDate = new Date(paymentDateFrom)
        if (!isNaN(fromDate.getTime())) {
          filter.paymentDate.$gte = fromDate
        }
      }
      if (paymentDateTo) {
        const toDate = new Date(paymentDateTo)
        if (!isNaN(toDate.getTime())) {
          filter.paymentDate.$lte = toDate
        }
      }
      if (Object.keys(filter.paymentDate).length === 0) {
        delete filter.paymentDate
      }
    }

    const donations = await Donation.find(filter)
      .populate("campaign")
      .populate("verifiedBy", "fullName email")
      .sort({ createdAt: -1 })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
        },
        "Donations fetched successfully"
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
