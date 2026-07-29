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
        //first we will get the adminId from the middelware as we have to pass super admin id in the created by field
        const superAdminId = req.admin._id

        //now we will take the new admin details from the body
        const {
            fullName,
            email,
            phone,
        } = req.body

        //now we will implement the validations for the body parameters
        ApiError.assert(fullName,"Full Name of the Admin is Required")
        ApiError.assert(email?.trim(),"Valid Email is Required")
        ApiError.assert(phone && phone.trim().length===10,"Please Provide a valid phone number")

        //lets find weather any other admin exist with the same email
        const adminExists = await Admin.exists({
            email
        })

        ApiError.assert(!adminExists,"Admin Already Exist with this email")

        //now we have to generate the password for the admin which they can later reset by their own
        const randomPassword = generateRandomPassword()

        //now we will use the hashed password to store it in db
        const hashedPassword = await bcrypt.hash(randomPassword,12)

        //now we will save the new admin to the collection
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

        //here, we will not create any cookies or send any cookies to browser because we dont need to register immidiately so that functionality is not needed here.

        //sending the response 
        res.status(201).json(
            new ApiResponse(
                201,
                null,
                "Admin registered successfully"
            )
        );

        //now we will send email to the new admin considering their credentials of login 
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
        return res.status(error.statusCode || 500).json(
            
    new ApiError(
        console.log(error),
        error.statusCode || 500,
        error.message
    )
)
    }
}



//------------------------------------------------THIS FUNCTIONAL CONTROLLER IS FOR DELETING THE ACCOUNT OF ANY ADMIN------------------------------------------------------------------
export const deleteAdminAccount = async (req,res) =>{
    //in this we will not only delete the admin we will transfer all the campiagns of the deleted admin to the super admin which will maintain the consistency of the entire system and give a controlled version of implementation
    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()
        const {adminId} = req.params
        const superAdminId = req.admin._id

        ApiError.assert( mongoose.Types.ObjectId.isValid(adminId),"adminId is required for this Functionality")

        //lets enforce that super admin can not delete himself
        ApiError.assert(
            adminId !== superAdminId.toString(),
            "Super Admin cannot delete their own account."
        );

        //lets find weather this admin exist or not
        const admin = await Admin.findById(adminId).session(session);

        ApiError.notFound(admin,"No such Admin Exist!!")

        //now we havee to do operation that update all the campaign createby id with superadmin id hwerever the createdBy id is of admin
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
        

        //now we will delete that admin collection
        await Admin.deleteOne({
                _id:adminId
        },
        {session}
    )

        await session.commitTransaction();

    //sending the response 
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
    //here, our intention and requirement is that super Admin can manually transfer the management of campaigns to any other sub ADmin
    //first we will take the list/array of the campaign ids we want to transfer
    //now we want the admin id to whom we wanted to transfer the management of the campaigns 
    //in last we will map them together 
    //we will make it more modular we can transfer anyone's created campaigns to anyother by the authority of super admin
    try {
        const superAdminId = req.admin._id
        const {
            campaignIds,
            adminId
        }=req.body

        //now we will perform the valdiations
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

        
        //now we want to update the campaigns with the selected adminId
        //but also we wanted to notify the previous manager of those campaigns regarding the ownership changes 
        //for that we also need the both new and old admin email

        //firstly lets check weather the provided admin id and campaignId exist or not 
        const [admin,campaigns] = await Promise.all([
            Admin.findById(adminId).select("fullName email"),
            
            Campaign.find({
                _id: { $in: campaignIds }
            })
            .populate("createdBy", "fullName email")
        ])

        console.log("Campaign IDs:", campaignIds);
console.log("Campaigns Found:", campaigns);
console.log("Campaign Count:", campaigns.length);

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

        //now we have every information regarding the old manager of campaign and the new we can simply update this now
        await Campaign.updateMany(
            {
            //filter
            _id: {
            $in: campaignIds
                }
            },
        
            {
                //update 
                $set:{
                    createdBy:adminId
                }
            }
        )

        //now we will send response to the frontend 
        //sending the response 
        res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Campaign Management Transferred Successfully"
            )
        );

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

        //and here we will send email to the dedicated involvers in this transaction
    } catch (error) {
         return res.status(error.statusCode || 500).json(
            
    new ApiError(
        console.log(error),
        error.statusCode || 500,
        error.message
    )
)
    }
}