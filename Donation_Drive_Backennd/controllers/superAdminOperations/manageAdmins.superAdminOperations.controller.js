import Admin from "../../models/admin.modals.js";
import emailService from "../../services/email.services.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { generateRandomPassword } from "../../utils/randomPasswordGenerator.utils.js";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import Campaign from "../../models/campaign.modals.js";
import mongoose from "mongoose";


//-----------------------------------------------------------THIS IS THE FUNCTIONALITY TO ADD NEW ADMIN FROM THE SUPER ADMIN SECTION--------------------------------------------------------------------
export const addNewAdmin = async (req,res)=>{
    try {
        const superAdminId = req.admin._id

        const {
            fullName,
            email,
            phone,
        } = req.body

        ApiError.assert(fullName,"Full Name of the Admin is Required")
        ApiError.assert(email?.trim(),"Valid Email is Required")
        ApiError.assert(phone && phone.trim().length===10,"Please Provide a valid phone number")

        const adminExists = await Admin.exists({
            email
        })

        ApiError.assert(!adminExists,"Admin Already Exist with this email")

        const randomPassword = generateRandomPassword()

        const hashedPassword = await bcrypt.hash(randomPassword,12)

        const newAdmin = await Admin.create({
            fullName:fullName,
            email:email.toLowerCase().trim(),
            password:hashedPassword,
            phone:phone,
            role:"ADMIN",
            isVerified:true,
            createdBy:superAdminId,
            isActive:true
        })

        res.status(201).json(
            new ApiResponse(
                201,
                null,
                "Admin registered successfully"
            )
        );

        try {

            await emailService.sendAdminAccountCreatedEmail({
                adminName: newAdmin.fullName,
                adminEmail: newAdmin.email,
                temporaryPassword: randomPassword,
                loginUrl: `${process.env.FRONTEND_URL}/admin/login`
            });

        } catch (error) {
            console.error("Failed to send admin credentials email:", error);
        }



    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        )
    }
}



//------------------------------------------------THIS FUNCTIONAL CONTROLLER IS FOR DELETING THE ACCOUNT OF ANY ADMIN------------------------------------------------------------------
export const deleteAdminAccount = async (req,res) =>{
    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()
        const {adminId} = req.params
        const superAdminId = req.admin._id

        ApiError.assert( mongoose.Types.ObjectId.isValid(adminId),"adminId is required for this Functionality")

        ApiError.assert(
            adminId !== superAdminId.toString(),
            "Super Admin cannot delete their own account."
        );

        const admin = await Admin.findById(adminId).session(session);

        ApiError.notFound(admin,"No such Admin Exist!!")

        await Campaign.updateMany(
        {
            createdBy: adminId
        },
        {
            $set: {
                createdBy: superAdminId
            }
        },
        { session }
        );
        

        await Admin.deleteOne({
                _id:adminId
        },
        {session}
    )

        await session.commitTransaction();

       return res.status(201).json(
            new ApiResponse(
                201,
                null,
                "Admin Deleted Successfully"
            )
        );

    } catch (error) {
        await session.abortTransaction();
        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        )
    }finally{
       await session.endSession();
    }
} 

//-----------------------------------------------------THIS CONTROLLER IS FOR THE TRANSFERING OF THE CAMPAIGN MANAGEMENT TO OTHER SUB ADMINS----------------------------------------------------------------
export const transferCampaignManagement = async (req,res) =>{
    try {
        const superAdminId = req.admin._id
        const {
            campaignIds,
            adminId
        }=req.body

        ApiError.assert(
            Array.isArray(campaignIds) && campaignIds.length > 0,
            400,
            "At least one campaign ID is required."
        );

        ApiError.assert(adminId && mongoose.Types.ObjectId.isValid(adminId),"adminId is required for this Functionality")

        ApiError.assert(
            campaignIds.every(id => mongoose.Types.ObjectId.isValid(id)),
            400,
            "One or more campaign IDs are invalid."
        );

        const [admin,campaigns] = await Promise.all([
            Admin.findById(adminId).select("fullName email"),
            
            Campaign.find({
                _id: { $in: campaignIds }
            })
            .populate("createdBy", "fullName email")
        ])

        ApiError.notFound(admin,"Admin Didn't found!!")
        ApiError.assert(campaignIds.length===campaigns.length,"Some Campaign Ids are invalid")
        const alreadyOwned = campaigns.every(
            campaign => campaign.createdBy._id.toString() === adminId
        );
        ApiError.assert(
            !alreadyOwned,
            400,
            "Selected campaigns are already assigned to this admin."
        );


        const ownerCampaignMap = {};

        for (const campaign of campaigns) {

            const ownerId = campaign.createdBy._id.toString();

            if (!ownerCampaignMap[ownerId]) {

                ownerCampaignMap[ownerId] = {
                    owner: campaign.createdBy,
                    campaigns: []
                };

            }

            ownerCampaignMap[ownerId].campaigns.push(campaign);

        }

        await Campaign.updateMany(
            {
            _id: {
            $in: campaignIds
                }
            },
        
            {
                $set:{
                    createdBy:adminId
                }
            }
        )

        res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Campaign Management Transferred Successfully"
            )
        );

        // Wrapped in its own try/catch, same as addNewAdmin's email send —
        // the response above is already sent, so a thrown error here must
        // never fall into the outer catch (it would try to send a second
        // response on already-sent headers and crash the request).
        try {
            for (const key in ownerCampaignMap) {
                const { owner, campaigns } = ownerCampaignMap[key];
                await emailService.sendCampaignOwnershipTransferEmail({
                    adminName: owner.fullName,
                    adminEmail: owner.email,
                    transferredCampaigns: campaigns,
                    transferType: "REMOVED"
                });
            }

            await emailService.sendCampaignOwnershipTransferEmail({
                adminName: admin.fullName,
                adminEmail: admin.email,
                transferredCampaigns: campaigns,
                transferType: "ASSIGNED"
            });
        } catch (emailError) {
            console.error("Failed to send transfer notification emails:", emailError);
        }

    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        )
    }
}

//-----------------------------------------------------LIST ALL ADMINS (for the Manage Admins table + transfer/assign dropdowns)----------------------------------------------------------------
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({})
            .select("-password -refreshToken -resetPasswordOtp")
            .sort({ createdAt: -1 })
            .lean()
        return res.status(200).json(new ApiResponse(200, { admins }, "Admins fetched successfully"))
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message))
    }
}

//-----------------------------------------------------LIST ALL CAMPAIGNS WITH OWNER INFO (for the transfer picker)----------------------------------------------------------------
export const getAllCampaignsForTransfer = async (req, res) => {
    try {
        const campaigns = await Campaign.find({})
            .populate("createdBy", "fullName email")
            .sort({ createdAt: -1 })
            .lean()
        return res.status(200).json(new ApiResponse(200, { campaigns }, "Campaigns fetched successfully"))
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message))
    }
}


//-----------------------------------------------------FUNCTION CONTROLLER TO FETCH ALL THE SUB ADMINS-------------------------------------------------------
export const fetchAllAdmins = async (req, res) => {
    try {

        const superAdminId = req.admin._id;

        const admins = await Admin.aggregate([
    {
        $match: {
            _id: { $ne: req.admin._id }
        }
    },
    {
        $lookup: {
            from: "campaigns",
            localField: "_id",
            foreignField: "createdBy",
            as: "campaigns"
        }
    },
    {
        $project: {
            fullName: 1,
            email: 1,
            phone: 1,
            role: 1,
            isActive: 1,
            createdAt: 1,

            totalCampaigns: {
                $size: "$campaigns"
            },

            managedCampaigns: {
                $map: {
                    input: "$campaigns",
                    as: "campaign",
                    in: {
                        _id: "$$campaign._id",
                        campaignName: "$$campaign.campaignName"
                    }
                }
            }
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    }
]);

        ApiError.assert(
            admins.length > 0,
            404,
            "No admins found."
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                admins,
                "Admins fetched successfully."
            )
        );

    } catch (error) {

        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        );

    }
};