import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import Milestone from "../../models/milestone.modals.js"
import emailService from "../../services/email.services.js";
import Message from "../../models/message.modals.js";
import Certificate from "../../models/certificate.modals.js";
import certificateService from "../../services/certificate.services.js";
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
    //just for debugging, remove later
    console.log("fetchDonations adminId:", adminId)
    console.log("fetchDonations adminCampaignIds:", campaignIds)

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
    //just for debugging, remove later
    console.log("fetchDonations result count:", donations.length, "totalDonations:", totalDonations)
    console.log("fetchDonations sample:", donations.slice(0, 5).map(d => ({ id: d._id, status: d.status, campaign: d.campaign, transactionId: d.transactionId })))
    //just for debugging, remove later
    console.log("fetchDonations result count:", donations.length, "totalDonations:", totalDonations)

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

    //just for debugging, remove later
    console.log("fetchPendingRejectedDonations adminId:", adminId)
    console.log("fetchPendingRejectedDonations campaignIds:", campaign.map(c => c._id))

    //now we will get all the ids of this campaign just id's
    const campaignIds = campaign.map(c=>c._id) //this will return a new array with only id numbers

    //just for debugging, remove later
    console.log("fetchPendingRejectedDonations filter:", {
      campaign: { $in: campaignIds },
      $or: [
        { status: "Pending" },
        { status: "Rejected", resubmissionCount: { $gt: 0 } }
      ]
    })
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

    //Set the status of this donation to verified
    donation.status = "Verified"
    //lets set verified by to the admin id
    donation.verifiedBy = adminId
    //lets set verified at to the current date
    donation.verifiedAt = new Date();
    //lets set the verified booleam to true
    donation.verified = true;

    //Save donation, update campaign, and create certificate record in parallel
    const saveOperations = [
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
    ];

    //Add certificate creation if certificate was generated
    if (certificateData) {
      saveOperations.push(
        Certificate.create([{
          certificateId: certificateData.certificateId,
          donation: donation._id,
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