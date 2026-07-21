import Donation from "../../models/donation.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import Campaign from "../../models/campaign.modals.js"
import emailService from "../../services/email.services.js";
import Message from "../../models/message.modals.js";
import mongoose from "mongoose";

// export const fetchDonations = async (req, res) => {
//   try {
//     const {
//       status,
//       campaign,
//       donorName,
//       donorEmail,
//       transactionId,
//       paymentMode,
//       verified,
//       minAmount,
//       maxAmount,
//       paymentDateFrom,
//       paymentDateTo,
//     } = req.query

//     //just for debugging, remove later
//     console.log("fetchDonations called with query:", req.query)

//     const filter = {}

//     if (status) {
//       filter.status = status
//     }
//     if (campaign) {
//       filter.campaign = campaign
//     }
//     if (donorName) {
//       filter.donorName = { $regex: donorName, $options: "i" }
//     }
//     if (donorEmail) {
//       filter.donorEmail = { $regex: donorEmail, $options: "i" }
//     }
//     if (transactionId) {
//       filter.transactionId = { $regex: transactionId, $options: "i" }
//     }
//     if (paymentMode) {
//       filter.paymentMode = paymentMode
//     }
//     if (verified !== undefined) {
//       filter.verified = verified === "true" || verified === "1"
//     }

//     if (minAmount !== undefined || maxAmount !== undefined) {
//       filter.amount = {}
//       if (minAmount !== undefined && !isNaN(Number(minAmount))) {
//         filter.amount.$gte = Number(minAmount)
//       }
//       if (maxAmount !== undefined && !isNaN(Number(maxAmount))) {
//         filter.amount.$lte = Number(maxAmount)
//       }
//       if (Object.keys(filter.amount).length === 0) {
//         delete filter.amount
//       }
//     }

//     if (paymentDateFrom || paymentDateTo) {
//       filter.paymentDate = {}
//       if (paymentDateFrom) {
//         const fromDate = new Date(paymentDateFrom)
//         if (!isNaN(fromDate.getTime())) {
//           filter.paymentDate.$gte = fromDate
//         }
//       }
//       if (paymentDateTo) {
//         const toDate = new Date(paymentDateTo)
//         if (!isNaN(toDate.getTime())) {
//           filter.paymentDate.$lte = toDate
//         }
//       }
//       if (Object.keys(filter.paymentDate).length === 0) {
//         delete filter.paymentDate
//       }
//     }

//     const donations = await Donation.find(filter)
//       .populate("campaign")
//       .populate("verifiedBy", "fullName email")
//       .sort({ createdAt: -1 })

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           donations,
//         },
//         "Donations fetched successfully"
//       )
//     )
//   } catch (error) {
//     console.error(error)
//     return res.status(error.statusCode || 500).json(
//       new ApiError(
//         error.statusCode || 500,
//         error.message
//       )
//     )
//   }
// }

//---------------------------------------------------THIS IS THE FETCH DONATION FUNCTIONALITY USING THE CONCEPT OF PAGINATION AND REAL TIME SEARCH---------------------------------------------------------------------------------------
export const fetchDonations = async (req,res) =>{
  try {
    //we will give the data based on the search filters and the pagination 
    const adminId = req.admin.adminId
    const page = Number(req.query.page)||1
    const limit = Number(req.query.limit) ||10 //this is the limit of responses on a single page
    const search = req.query.search?.trim()
    const campaign = req.query.campaign
    const status = req.query.status

    const skip = (page-1)*limit

    let filter = {
      admin:adminId
    }

    //if there is a serch parameter in the query so we have to search using owner email,name, transactionId
    if (search) {
    filter.$or = [
        {
            donorName: {
                $regex: search,
                $options: "i"  //this is for case insensitivity
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

    //if campaign is filetered though queries 
    if(campaign){
      filter.campaign = campaign
    }

    //if there is a status filter
    if(status){
      filter.status = status
    }

  
    //now we will find members based on the parameters
    const [donations,totalDonations] = await Promise.all([
      Donation.find(filter)
      .populate("campaign, campaignName")
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit)
    ],

      Donation.countDocuments(filter)
  )

  ApiError.assert(donations,"No result for the search")

   return res.status(200).json(
        new ApiResponse(
          200,
          {
            donations,
            pagination:{
              totalDonations,
              totalPages = Match.ceil(totalDonations/limit),
              pageSize:limit,
              currentPage:page
            }
          },
            "Campaign Fetched Successfully!!"
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

// export const verifyDonation = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { verificationRemarks } = req.body

//     //just for debugging, remove later
//     console.log("verifyDonation called for id:", id, "adminId:", req.admin?.adminId)

//     ApiError.assert(id, "Donation ID is required")

//     const donation = await Donation.findById(id)
//     ApiError.notFound(donation, "Donation not found")
//     ApiError.assert(donation.status === "Pending", "Donation is not pending verification")

//     donation.status = "Verified"
//     donation.verified = true
//     donation.verifiedBy = req.admin.adminId
//     donation.verifiedAt = new Date()
//     if (verificationRemarks !== undefined) {
//       donation.verificationRemarks = verificationRemarks
//     }

//     await donation.save()

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           donation,
//         },
//         "Donation verified successfully"
//       )
//     )
//   } catch (error) {
//     console.error(error)
//     return res.status(error.statusCode || 500).json(
//       new ApiError(
//         error.statusCode || 500,
//         error.message
//       )
//     )
//   }
// }



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


//-----------------------------------------------------------CONTROLLER FOR THE VERIFICATION OF DONATION----------------------------------------
export const verifyDonation = async (req,res) =>{
  const session = await mongoose.startSession();  //here, we had starting the session

  //milestone updation is left
  try {
    
    session.startTransaction();
    //so, how the verification process will goes
    //user get all the pending donations record
    //user checks them manually and if everything is correct he will click on the verify so we just have to change the status of the donation send success email and make some numeric changes in the collectons

    //first of all we want adminId for authentication 
    const adminId = req.admin.adminId
    const {donationId} = req.params

    //lets check weather the donation entry is valid or not 
    let donation = await Donation.findOne({
      _id:donationId,
      status:"Pending"
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
    let donation = await Donation.findOne({
    _id: donationId,
    status: "Pending"
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