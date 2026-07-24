import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import Milestone from "../../models/milestone.modals.js"
import emailService from "../../services/email.services.js";
import Message from "../../models/message.modals.js";
import mongoose from "mongoose";

//---------------------------------------------------THIS IS THE FETCH DONATION FUNCTIONALITY USING THE CONCEPT OF PAGINATION AND REAL TIME SEARCH---------------------------------------------------------------------------------------
export const fetchDonations = async (req, res) => {
  try {
    //we will give the data based on the search filters and the pagination
    const adminId = req.admin.adminId
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10 //this is the limit of responses on a single page
    const search = req.query.search?.trim()
    const campaignFilter = req.query.campaign
    const status = req.query.status
    const paymentMode = req.query.paymentMode
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate

    const skip = (page - 1) * limit

    //we only want donations belonging to campaigns this admin created, so first
    //fetch this admin's campaign ids, same pattern as fetchPendingRejectedDonations
    const adminCampaigns = await Campaign.find({
      createdBy: adminId
    }).select("_id")

    const campaignIds = adminCampaigns.map((c) => c._id)

    let filter = {
      campaign: { $in: campaignIds }
    }

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

    //if a specific campaign is selected via the filter, narrow down to just that one
    //(it must still be one of this admin's own campaigns, otherwise it simply won't match anything)
    if (campaignFilter) {
      filter.campaign = campaignFilter
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
        .populate("campaign", "campaignName")
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
  try {
    const adminId = req.admin.adminId //this we will get from the middelware

    //---------------------------------IMPORTANT CONCEPT NOTE------------------------------
    //till here we didn't implemented indexing in our database as a result if we find a donation for particular
    //campaign then query has to search entire document this is called COLLECTION SCAN (COLLSCAN) which is inefficient
    //so now we will implement indexing in our donations model
    //we have implemented the indexing in this, now we can perform queries
    //first we will get campaigns which is created by this admin

    const campaign = await Campaign.find({
      createdBy:adminId
    }).select("_id")

    //now we will get all the ids of this campaign just id's
    const campaignIds = campaign.map(c=>c._id) //this will return a new array with only id numbers

    //now we will implement the second query
    const donations = await Donation.find({
      campaign: {
        $in: campaignIds
      },
      $or: [
      {
        status: "Pending"
      },
      {
        status: "Rejected",
        resubmissionCount: { $gt: 0 }
      }
    ]
  })
    .populate(
      "campaign",
      "campaignName"
    )
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
    const adminId = req.admin.adminId
    const limit = Number(req.query.limit) || 8

    const adminCampaigns = await Campaign.find({ createdBy: adminId }).select("_id")
    const campaignIds = adminCampaigns.map((c) => c._id)

    const [recentDonations, recentMilestones] = await Promise.all([
      Donation.find({
        campaign: { $in: campaignIds },
        status: { $in: ["Verified", "Rejected"] },
        verifiedAt: { $ne: null }
      })
        .populate("campaign", "campaignName")
        .sort({ verifiedAt: -1 })
        .limit(limit),
      Milestone.find({
        campaign: { $in: campaignIds },
        isCompleted: true,
        completedAt: { $ne: null }
      })
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
    //so, how the verification process will goes
    //user get all the pending donations record
    //user checks them manually and if everything is correct he will click on the verify so we just have to change the status of the donation send success email and make some numeric changes in the collectons

    //first of all we want adminId for authentication
    const adminId = req.admin.adminId
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

    ApiError.assert(donation,"Donation don't found")

    //Here, we have to implement the certificate generation functionality and save those links into the collection, this is left

    //lets set the status of this donation to verified
    donation.status = "Verified"
    //lets set verified by to the admin id
    donation.verifiedBy = adminId
    //lets set verified at to the current date
    donation.verifiedAt = new Date();
    //lets set the verified booleam to true
    donation.verified = true;

    //now we will campaign of this donation
    let campaign = await Campaign.findById(donation.campaign).session(session)
    ApiError.assert(campaign,"No campaign Found with this donation")


    //now we will save both the collections
    await Promise.all([
      donation.save({session}),
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
    ])

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
    "campaignName"
    );

    ApiError.assert(donation,"Donation doesn't exist!")

    //now we just have to simply set status of this donation to rejected or cancelled and send email
    donation.status = "Rejected"
    donation.verificationRemarks = verificationRemarks.trim()
    donation.verified = false;
    donation.verifiedBy = adminId;
    donation.verifiedAt = new Date();
    await donation.save()

    res.status(200).json(
    new ApiResponse(
        200,
        {
            donationId: donation._id
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
    verificationRemarks: donation.verificationRemarks,
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