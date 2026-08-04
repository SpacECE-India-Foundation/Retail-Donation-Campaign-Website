import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import Milestone from "../../models/milestone.modals.js"
import emailService from "../../services/email.services.js";
import Message from "../../models/message.modals.js";
import mongoose from "mongoose";
import Certificate from "../../models/certificate.modals.js";
import certificateService from "../../services/certificate.services.js";


//---------------------------------------------------HELPER: RESOLVE WHICH CAMPAIGNS THIS REQUEST IS ALLOWED TO SEE---------------------------------------------------------------------------------------
// Centralizes the admin-scoping logic so fetchDonations, fetchPendingRejectedDonations, and
// fetchRecentActivity all apply the exact same rule instead of three separate copies that can
// drift out of sync (which is how the fetchDonations bug happened in the first place — its own
// campaign-filter override blew away the ownership restriction entirely).
//
// Behavior:
// - No `campaign`/`admin` query param, not Super Admin (or Super Admin without
//   `viewAll=true`): scoped to campaigns this admin created — same as before this change,
//   for everyone by default.
// - `campaign` query param given, regular admin: only honored if it's actually one of their own
//   campaigns; otherwise resolves to a filter that matches nothing (rather than silently leaking
//   another admin's data, which is what happened before).
// - `campaign` query param given, Super Admin: honored as-is, any campaign.
// - `admin` query param given, Super Admin, no specific campaign: scoped to every campaign
//   created by that admin (the new "Admin" filter dropdown on the frontend).
// - `viewAll=true`, Super Admin, no specific campaign or admin: no restriction at all.
async function resolveDonationCampaignFilter(req) {
  const adminId = req.admin.adminId
  const isSuperAdmin = req.admin.role === "SUPER_ADMIN"
  const campaignFilter = req.query.campaign
  const adminFilter = req.query.admin
  const viewAll = isSuperAdmin && req.query.viewAll === "true"

  const ownCampaigns = await Campaign.find({ createdBy: adminId }).select("_id")
  const ownCampaignIds = ownCampaigns.map((c) => c._id)

  if (campaignFilter) {
    if (isSuperAdmin) {
      return { campaign: campaignFilter }
    }
    const owns = ownCampaignIds.some((id) => id.toString() === campaignFilter)
    // not their campaign — resolve to a filter that can never match a real document,
    // instead of falling through to "no restriction"
    return { campaign: owns ? campaignFilter : new mongoose.Types.ObjectId() }
  }

  if (isSuperAdmin && adminFilter) {
    const targetCampaigns = await Campaign.find({ createdBy: adminFilter }).select("_id")
    return { campaign: { $in: targetCampaigns.map((c) => c._id) } }
  }

  if (viewAll) {
    return {}
  }

  return { campaign: { $in: ownCampaignIds } }
}


//---------------------------------------------------THIS IS THE FETCH DONATION FUNCTIONALITY USING THE CONCEPT OF PAGINATION AND REAL TIME SEARCH---------------------------------------------------------------------------------------
export const fetchDonations = async (req, res) => {
  try {
    //we will give the data based on the search filters and the pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10 //this is the limit of responses on a single page
    const search = req.query.search?.trim()
    const status = req.query.status
    const paymentMode = req.query.paymentMode
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate

    const skip = (page - 1) * limit

    //resolves to { campaign: {$in: [...]} }, { campaign: <id> }, or {} depending on
    //role and whatever scope params were sent — see resolveDonationCampaignFilter above
    let filter = await resolveDonationCampaignFilter(req)

    //if there is a search parameter in the query so we have to search using donor email, name, transactionId
    if (search) {
      filter.$or = [
        {
          donorName: {
            $regex: search,
            $options: "i" //this is for case insensitivity
          }
        },
        {
          donorEmail: {
            $regex: search,
            $options: "i"
          }
        },
        {
          transactionId: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    //if there is a status filter
    if (status) {
      filter.status = status
    }

    //if there is a payment mode filter
    if (paymentMode) {
      filter.paymentMode = paymentMode
    }

    //if there is a date range filter (based on when the donation was submitted)
    if (fromDate || toDate) {
      filter.createdAt = {}
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate)
      }
      if (toDate) {
        //include the entire "to" day, not just midnight
        const endOfDay = new Date(toDate)
        endOfDay.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = endOfDay
      }
    }

    //now we will find donations based on the parameters, plus a total count for pagination
    const [donations, totalDonations] = await Promise.all([
      Donation.find(filter)
        .populate({
          path: "campaign",
          select: "campaignName createdBy",
          populate: { path: "createdBy", select: "fullName" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(filter)
    ])

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          donations,
          pagination: {
            totalDonations,
            totalPages: Math.ceil(totalDonations / limit),
            pageSize: limit,
            currentPage: page
          }
        },
        "Donations fetched successfully"
      )
    );

  } catch (error) {
    console.log(error)
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message
      )
    )
  }
}


//-------------------------------------------------THIS IS THE FUNCTION FOR THE FETCHING THE PENDING AND REJECTED DONATION ENTRIES FOR THE DEDICATED ADMIN FOR THOSE CAMPIGN THAT THEY HAVE CREATED----------------------------------------------------------------------------------------
export const fetchPendingRejectedDonations = async (req,res) =>{
  //the main goal is to show pending donation to the admin based on the campaigns they created
  //(or, for a Super Admin who's opted into viewAll / picked a specific campaign, whatever
  //that broader scope resolves to — see resolveDonationCampaignFilter)
  try {
    const campaignScope = await resolveDonationCampaignFilter(req)

    const donations = await Donation.find({
      ...campaignScope,
      $or: [
      {
        status: "Pending",
        automaticVerificationAttempted: true,
      },
      {
        status: "Rejected",
        resubmissionCount: { $gt: 0 }
      }
    ]
  })
    .populate({
      path: "campaign",
      select: "campaignName createdBy",
      populate: { path: "createdBy", select: "fullName" }
    })
    .sort({
      createdAt: -1
    });

    //now we have those donations we will simply send them with the response

    return res.status(200).json(
        new ApiResponse(
          200,
          {
            newPendingDonations:donations
          },
            "Campaign Fetched Successfully!!"
          )
      );


  } catch (error) {
    return res.status(error.statusCode || 500).json(
        new ApiError(
            error.statusCode || 500,
            error.message
            )
        )

  }
}


//--------------------------------------------------HELPER: SYNC MILESTONE COMPLETION AGAINST CAMPAIGN RAISED AMOUNT--------------------------------------------------
// Each milestone's targetAmount is an absolute checkpoint on the campaign's total raised
// amount (like a marathon's distance markers — the "20k" marker means 20k total run, not
// "20k more" after the "10k" marker). So milestone N completes the moment campaignRaisedAmt
// reaches ITS OWN targetAmount, independent of any other milestone — no summing across
// milestones. Called inside verifyDonation's transaction right after campaignRaisedAmt is
// incremented, so it always re-evaluates every milestone against the fresh total — meaning
// any previously-missed completions catch up automatically on the next verified donation.
async function syncMilestoneCompletion(campaignId, session) {
  const [freshCampaign, milestones] = await Promise.all([
    Campaign.findById(campaignId).session(session),
    Milestone.find({ campaign: campaignId }).sort({ displayOrder: 1 }).session(session)
  ])

  if (!freshCampaign) return

  const now = new Date()

  for (const milestone of milestones) {
    if (!milestone.isCompleted && milestone.targetAmount <= freshCampaign.campaignRaisedAmt) {
      milestone.isCompleted = true
      milestone.completedAt = now
      await milestone.save({ session })
    }
  }
}


//-------------------------------------------------RECENT ACTIVITY FEED FOR THE ADMIN DASHBOARD---------------------------------------------------------------------------------------
// No dedicated activity-log collection exists, so this is built directly from data that
// already exists: donations this admin has verified/rejected (verifiedAt), and milestones
// that have been completed on their campaigns (completedAt). The two lists are merged into
// a single timeline sorted by when each thing actually happened.
export const fetchRecentActivity = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8

    const campaignScope = await resolveDonationCampaignFilter(req)
    // resolveDonationCampaignFilter returns { campaign: ... } (or {}) — pull out just the
    // campaign-id constraint to reuse against both Donation and Milestone queries below.
    const campaignConstraint = campaignScope.campaign

    const donationFilter = { status: { $in: ["Verified", "Rejected"] }, verifiedAt: { $ne: null } }
    const milestoneFilter = { isCompleted: true, completedAt: { $ne: null } }
    if (campaignConstraint !== undefined) {
      donationFilter.campaign = campaignConstraint
      milestoneFilter.campaign = campaignConstraint
    }

    const [recentDonations, recentMilestones] = await Promise.all([
      Donation.find(donationFilter)
        .populate("campaign", "campaignName")
        .sort({ verifiedAt: -1 })
        .limit(limit),
      Milestone.find(milestoneFilter)
        .populate("campaign", "campaignName")
        .sort({ completedAt: -1 })
        .limit(limit)
    ])

    const donationEvents = recentDonations.map((donation) => ({
      type: donation.status === "Verified" ? "donation_verified" : "donation_rejected",
      timestamp: donation.verifiedAt,
      donorName: donation.donorName,
      amount: donation.amount,
      campaignName: donation.campaign?.campaignName ?? "Campaign"
    }))

    const milestoneEvents = recentMilestones.map((milestone) => ({
      type: "milestone_completed",
      timestamp: milestone.completedAt,
      milestoneTitle: milestone.milestoneTitle,
      targetAmount: milestone.targetAmount,
      campaignName: milestone.campaign?.campaignName ?? "Campaign"
    }))

    //merge both feeds into one timeline, most recent first, capped at `limit`
    const activity = [...donationEvents, ...milestoneEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)

    return res.status(200).json(
      new ApiResponse(
        200,
        { activity },
        "Recent activity fetched successfully"
      )
    )
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message
      )
    )
  }
}


//-----------------------------------------------------------CONTROLLER FOR THE VERIFICATION OF DONATION----------------------------------------
export const verifyDonation = async (req,res) =>{
  const session = await mongoose.startSession();  //here, we had starting the session

  try {

    session.startTransaction();
    //just for debugging, remove later
    console.log("verifyDonation request params:", req.params)
    console.log("verifyDonation adminId:", req.admin?.adminId)

    //so, how the verification process will goes
    //user get all the pending donations record
    //user checks them manually and if everything is correct he will click on the verify so we just have to change the status of the donation send success email and make some numeric changes in the collectons

    //first of all we want adminId for authentication
    const adminId = req.admin.adminId
    const isSuperAdmin = req.admin.role === "SUPER_ADMIN"
    const {donationId} = req.params

    //lets check weather the donation entry is valid or not
    //allow verifying a donation that's either freshly Pending, OR was Rejected and has since
    //been resubmitted by the donor (same condition fetchPendingRejectedDonations uses to
    //surface it in the first place)
    let donation = await Donation.findOne({
      _id:donationId,
      $or: [
        { status: "Pending" },
        { status: "Rejected", resubmissionCount: { $gt: 0 } }
      ]
    }).session(session)

    //just for debugging, remove later
    console.log("verifyDonation found donation:", donation ? {
      id: donation._id,
      status: donation.status,
      transactionId: donation.transactionId,
      campaign: donation.campaign,
      certificateGenerated: donation.certificateGenerated
    } : null)

    ApiError.assert(donation,"Donation don't found")

    //Get campaign before generating certificate
    let campaign = await Campaign.findById(donation.campaign).session(session)
    //just for debugging, remove later
    console.log("verifyDonation found campaign:", campaign ? { id: campaign._id, name: campaign.campaignName } : null)
    ApiError.assert(campaign,"No campaign Found with this donation")

    //Ownership check — previously missing entirely, meaning any authenticated admin could
    //verify any donation regardless of which campaign it belonged to. Super Admin is exempt
    //by design; everyone else must actually own the campaign this donation is under.
    ApiError.assert(
      isSuperAdmin || campaign.createdBy.toString() === adminId,
      "You are not authorized to verify donations for this campaign.",
      403
    )

    //Generate certificate for verified donation with error handling
    let certificateData = null;
    try {
      certificateData = await certificateService.generateAndUploadCertificate({
        donorName: donation.donorName,
        campaignName: campaign.campaignName,
        amount: donation.amount,
        donationDate: donation.paymentDate,
      });
      //just for debugging, remove later
      console.log("verifyDonation certificateData:", certificateData)
    } catch (certError) {
      console.error("Certificate generation failed, continuing with verification:", certError.message);
      //Certificate generation failure should not block donation verification
      //Log the error but allow the donation to be verified without certificate
    }

    //Update donation with certificate information if generated successfully
    if (certificateData) {
      donation.certificateGenerated = true;
      donation.certificateUrl = certificateData.certificateUrl;
    }


    //Atomically claim this donation for verification. If another admin (or Super Admin)
    //verified/rejected it in the gap between the read above and this update, the status
    //condition below no longer matches and we return a clean "already processed" message
    //instead of double-crediting the campaign or racing on the write. This is the actual
    //fix for the "two admins verifying at once" race condition.
    const claimedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        $or: [
          { status: "Pending" },
          { status: "Rejected", resubmissionCount: { $gt: 0 } }
        ]
      },
      {
        $set: {
          status: "Verified",
          verifiedBy: adminId,
          verifiedAt: new Date(),
          verified: true,
          automaticVerificationAttempted: true,
          ...(certificateData ? {
            certificateGenerated: true,
            certificateUrl: certificateData.certificateUrl
          } : {})
        }
      },
      { session, new: true }
    )

    ApiError.assert(claimedDonation, "This donation has already been verified or rejected by another admin. Please refresh the queue.", 409)

    donation = claimedDonation

 //Update campaign totals and create the certificate record in parallel.
 //(the donation itself was already persisted by the atomic claim above)
    const saveOperations = [
      Campaign.findByIdAndUpdate(
        campaign._id,
        {
          $inc:{
            campaignRaisedAmt: donation.amount,
            contributors:1
          }
        },
        {
          session
        }
      )
    ];

    //Add certificate creation if certificate was generated
    if (certificateData) {
      saveOperations.push(
        Certificate.create([{
          certificateId: certificateData.certificateId,
          donation: donation._id,
          displayCertificateNo: certificateData.displayCertificateNo,
          donorName: donation.donorName,
          campaignName: campaign.campaignName,
          amount: donation.amount,
          donationDate: donation.paymentDate,
          certificateUrl: certificateData.certificateUrl,
          publicId: certificateData.publicId,
          verificationUrl: certificateData.verificationUrl,
          verified: true,
          verifiedAt: new Date(),
        }], { session })
      );
    }

    await Promise.all(saveOperations)


    //campaignRaisedAmt just moved — recalculate which milestones this reaches
    await syncMilestoneCompletion(campaign._id, session)

    await session.commitTransaction();
    res.status(200).json(
    new ApiResponse(
        200,
        {
            donationId: donation._id
        },
        "Donation verified successfully."
    )
);

    //now we will send success message through email
    emailService.sendDonationVerifiedEmail({

    donorName: donation.donorName,

    donorEmail: donation.donorEmail,

    campaignName: campaign.campaignName,

    donationAmount: donation.amount,

    transactionId: donation.transactionId,

    certificateLink: donation.certificateUrl

});

  } catch (error) {
    await session.abortTransaction();
    //MongoDB itself also detects a real simultaneous write collision (both requests hitting
    //the exact same instant) and aborts one side with a WriteConflict/TransientTransactionError
    //— catch that here too so it surfaces as the same friendly message instead of a raw 500.
    const isWriteConflict = error.errorLabels?.includes("TransientTransactionError") || error.code === 112
    if (isWriteConflict) {
      return res.status(409).json(
        new ApiError(409, "This donation is currently being processed by another admin. Please refresh and try again.")
      )
    }
    return res.status(error.statusCode || 500).json(
        new ApiError(
            error.statusCode || 500,
            error.message
            )
        )
  }finally{
    session.endSession();
  }
}



//-------------------------------------------------FUNCTION FOR REJECTION OF DONATION---------------------------------------------------------------------------------------
export const rejectDonation = async (req,res) =>{
  try {
    const adminId = req.admin.adminId
    const isSuperAdmin = req.admin.role === "SUPER_ADMIN"
    const {donationId} = req.params

    //lets get the rejection reason from the admin
    const {verificationRemarks} = req.body

    ApiError.assert(verificationRemarks,"Verification Remarks are mandatory for Rejection")

    //lets check weather the donation entry is valid or not
    //same as verifyDonation — allow rejecting again on a resubmitted-rejected donation, not just
    //fresh Pending ones, so "Reject Again" actually works from the Verification Queue
    let donation = await Donation.findOne({
    _id: donationId,
    $or: [
      { status: "Pending" },
      { status: "Rejected", resubmissionCount: { $gt: 0 } }
    ]
      }).populate(
    "campaign",
    "campaignName createdBy"
    );

    ApiError.assert(donation,"Donation doesn't exist!")

    //Ownership check — previously missing, same issue as verifyDonation above.
    ApiError.assert(
      isSuperAdmin || donation.campaign.createdBy.toString() === adminId,
      "You are not authorized to reject donations for this campaign.",
      403
    )

    //Atomically claim this donation for rejection. If another admin (or Super Admin)
    //verified/rejected it in the gap between the read above and this update, the status
    //condition below no longer matches and we return a clean "already processed" message
    //instead of silently overwriting whatever the other admin just did. Same fix as
    //verifyDonation's race condition, applied here since this function had zero
    //concurrency protection before (no transaction, no atomic check).
    const updatedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        $or: [
          { status: "Pending" },
          { status: "Rejected", resubmissionCount: { $gt: 0 } }
        ]
      },
      {
        $set: {
          status: "Rejected",
          verificationRemarks: verificationRemarks.trim(),
          verified: false,
          verifiedBy: adminId,
          verifiedAt: new Date()
        }
      },
      { new: true }
    )

    ApiError.assert(updatedDonation, "This donation has already been processed by another admin. Please refresh the queue.", 409)

    res.status(200).json(
    new ApiResponse(
        200,
        {
            donationId: updatedDonation._id
        },
        "Donation Rejcted Successfully."
    )
);

    emailService.sendDonationRejectedEmail({
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    campaignName: donation.campaign.campaignName,
    donationAmount: donation.amount,
    transactionId: donation.transactionId,
    verificationRemarks: updatedDonation.verificationRemarks,
    resubmitLink: `${process.env.FRONTEND_URL}/donate/${donation.campaign._id}`
}).catch(console.error);
  } catch (error) {
    console.log(error)
    return res.status(error.statusCode || 500).json(
        new ApiError(
            error.statusCode || 500,
            error.message
            )
        )
  }
}