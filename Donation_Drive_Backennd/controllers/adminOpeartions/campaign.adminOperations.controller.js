//THIS CONTROLLER CONTAINS THE ALL THE FUNCTIONAITY REGARDING THE NEW DONATION CAMPAIGN CREATION, UPDATION AND MANAGEMENT 

import Campaign from "../../models/campaign.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.utils.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.utils.js";


//THIS FUNCTIONALITY DEAL WITH THE NEW CAMPAIGN CREATION
export const newCampaign = async (req,res) =>{
    try {
        const {
            campaignName,
            campaignDescription,
            startDate,
            endDate,
            campaignGoalAmount
        } = req.body
        //lets get the admin id who is creating the campaign
        const adminId = req.admin.adminId //geeting this from the token/ the middelware we created 
        //just for debugging, remove later
        console.log("newCampaign called by adminId:", adminId)

        //as the date are coming as a string we can not directly compare them with actual date object for this we will typecase them into date
        const start = new Date(startDate)
        const end = new Date(endDate)
        //just for debugging, remove later
        console.log("newCampaign body:", req.body)
        console.log("newCampaign start/end:", start, end)
        //lets implement validations
        ApiError.assert(campaignName,"campaignName is required")
        ApiError.assert(campaignDescription,"Campaign description is required")
        ApiError.assert(!isNaN(start.getTime()) && start.getTime() > Date.now(),"Please Enter A valid Date")
        ApiError.assert(!isNaN(end.getTime()) && end.getTime() > start.getTime(),"Please enter a valid endDate")
        ApiError.assert(!isNaN(Number(campaignGoalAmount)) && Number(campaignGoalAmount) > 0,"Please enter a vlid goal amount")
        ApiError.assert(req.file?.buffer,"Campaign banner image is required");

        //lets check weather there is a campaign already exist with this credentials
        const isCampaignExist = await Campaign.findOne({
            campaignName
        })

        ApiError.assert(!isCampaignExist,"Caimpaign already exist with the given name and dates")

        //now lets handle the banner image input thing

        let uploadResult;

        try {
                uploadResult = await uploadBufferToCloudinary(
                req.file.buffer,
                "campaign-poster"
                );
            } catch (error) {
                //just for debugging, remove later
                console.log("Cloudinary Error:", error)
                throw new ApiError(500, "Failed to upload campaign banner");
            }

        const newCampaignData = new Campaign({
            campaignName,
            campaignDescription,
            startDate:start,
            endDate:end,
            campaignGoalAmt:campaignGoalAmount,
            campaignBanner: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
            },
            createdBy:adminId
        })
        //now lets toggle status of the campaign based on the start date
        newCampaignData.campaignStatus = start.getTime() > Date.now() ? "Upcoming" : "Active";
        await newCampaignData.save()

        //RETURNING THE RESPONSE BEFORE THE MAIL SERVICE BECAUSE MAIL SERVICES TAKES TIME SO IT IS NECESSARY TO GIVE A ATLEAST COMPLETION REPONSE TO THE FRONTEND
        return res.status(201).json(
                    new ApiResponse(
                    201,
                    {
                        campaignId: newCampaignData._id,
                        campaignName: newCampaignData.campaignName
                    },
                    "New Campaign Created Successfully!!"
                    )
                );

        //HERE, IF WE WANTS TO SEND MAIL TO THE OFFICIAL BODY REGARDING NEW CREATION WE CAN SEND 
        //------------------------------MAIL CODE GOES HERE ------------------------------------


    } catch (error) {
        console.error(error);
        
            return res.status(error.statusCode || 500).json(
                new ApiError(
                    error.statusCode || 500,
                    error.message
                )
            );
    }
}


//-----------------------------------------------------------THIS FUNCTION DEAL WITH THE CHANGES IN THE PARTICULAR CAMPAIGN------------------------------------------------------
export const updateCampaignDetails = async (req,res) =>{
    try {
        //let first get the admin Id, we are intended to allow those admins to make changes in the campaign they have created
        const adminId = req.admin.adminId

         const allowedStatus = [
        "Active",
        "inActive"
        ];

        //now we will ge the campaign id from the params
        const {campaignId} = req.params

        //just for debugging, remove later
        console.log("updateCampaignDetails called for campaignId:", campaignId, "adminId:", adminId)

        ApiError.assert(campaignId,"Campaign Id is required!")

        //lets check weather the campaign exist or not 
        const isCampaignExist = await Campaign.findOne({
            _id:campaignId,
            createdBy:adminId
        })

        //if not found
        ApiError.notFound(isCampaignExist,"No Such Campaign Exist!!")

        //if found now lets get the data from the request body
        let{
            campaignName,
            campaignDescription,
            campaignGoalAmount,
            startDate,
            endDate,
            campaignStatus,
        } = req.body
        const start = isCampaignExist.startDate
        
        //lets check weather the entered name is now duplicate or not, not including the selected campaign
        if(campaignName){
            const duplicateCampaign = await Campaign.findOne({
                campaignName,
                createdBy:adminId,
                _id:{$ne:campaignId}
            })

            ApiError.assert(!duplicateCampaign,"There exist a camapign with this name! Duplicate")
        }

       let end;

       if (endDate !== undefined) {
            end = new Date(endDate);
            ApiError.assert(
                !isNaN(end.getTime()) &&
                end.getTime() > start.getTime(),
                "Please enter a valid end date"
            );
        }
        if (campaignName !== undefined) {
            campaignName = campaignName.trim();
            ApiError.assert(
                campaignName.length >= 3,
                "Campaign name should be at least 3 characters"
            );
        }

        if (campaignDescription !== undefined) {
            campaignDescription = campaignDescription.trim();
            ApiError.assert(
                campaignDescription.length >= 20,
                "Campaign description should be at least 20 characters"
            );
        }

        if (campaignStatus !== undefined) {
            ApiError.assert(
                allowedStatus.includes(campaignStatus),
                "Invalid campaign status"
            );
        }

        //now lets validate if the entered field is not null or undefined
        if(campaignGoalAmount!==undefined){
            ApiError.assert(!isNaN(Number(campaignGoalAmount)) && Number(campaignGoalAmount) > 0,"Please enter a vlid goal amount")
        }
        //here, we will check if the status is active then start date can not be changed or updated
        if(startDate!==undefined){
            if(isCampaignExist.campaignStatus==="Active"){
                ApiError.forbidden("Can Not Change the start Date of Active Campaign")
            }
        }
        if(endDate!==undefined){
            ApiError.assert(!isNaN(end.getTime()) && end.getTime() > start.getTime(),"Please enter a valid endDate")
        }

        //now lets save the updated data to the collection
        if(campaignName!==undefined) isCampaignExist.campaignName=campaignName
        if(campaignDescription!==undefined) isCampaignExist.campaignDescription=campaignDescription
        if(campaignGoalAmount!==undefined) isCampaignExist.campaignGoalAmt=campaignGoalAmount
        if(startDate!==undefined) isCampaignExist.startDate=startDate
        if(endDate!==undefined) isCampaignExist.endDate=endDate
        if (campaignStatus !== undefined) {
        isCampaignExist.campaignStatus = campaignStatus;
        }

        await isCampaignExist.save() //here we have saved the changed we made in the collection

        return res.status(201).json(
                    new ApiResponse(
                    201,
                    {
                        campaignId: isCampaignExist._id,
                        campaignName: isCampaignExist.campaignName
                    },
                    "Campaign Updated Successfully"
                    )
                );

        //HERE, IF WE WANTS TO SEND MAIL TO THE OFFICIAL BODY REGARDING NEW CREATION WE CAN SEND 
        //------------------------------MAIL CODE GOES HERE ------------------------------------
    } catch (error) {
        return res.status(error.statusCode || 500).json(
        new ApiError(
            error.statusCode || 500,
            error.message
            )
        )

    }
}



//-----------------------------------------------THIS FUNCTION IS FOR THE REMOVAL OF THE COVER IMAGES---------------------------------------
//-----------------------------------------------CURRENTLY WE ARE NOT USING THIS FUNCTION -----------------------------------------------
// export const removeCoverImage = async (req,res) =>{
//     try {
//         const adminId = req.admin.adminId
//         const {campaignId} = req.params
//         ApiError.assert(campaignId,"CampaignId Missing!")

//         //lets find the campaign 
//         const campaign = await Campaign.findOne({
//             createdBy:adminId,
//             _id:campaignId
//         })

//         ApiError.notFound(campaign,"Campaign Didn't found!!")

//         //now lets delete the image using the utility function we created
//         //usually this destroyer return the result in "ok" or in case of image already deleted or not found result "not found"
//         await deleteFromCloudinary(campaign.campaignBanner.publicId)

//         campaign.campaignBanner = {
//         url:"",
//         publicId:""
//         }

//         await campaign.save()

//         return res.status(201).json(
//                     new ApiResponse(
//                     201,
//                     null,
//                     "Image Removed Successfully"
//                     )
//                 );
//     } catch (error) {
//         return res.status(error.statusCode || 500).json(
//         new ApiError(
//             error.statusCode || 500,
//             error.message
//             )
//         )
//     }
// }


//---------------------------------------------------------THIS FUNCTION IS FOR THE UPDATION OF THE COVERIMAGE------------------------------

export const updateCoverImage = async (req,res) =>{
    try {
        //The approach we will follow for this functionality 
        //1. Upload the new image on the cloudinary server 
        //2. update the public id and url in the collection 
        //3. then we will destroy the existing image from the server.

        //first find the required id's
        const adminId = req.admin.adminId
        const {campaignId} = req.params
        //just for debugging, remove later
        console.log("updateCoverImage called for campaignId:", campaignId, "adminId:", adminId)

        ApiError.assert(campaignId,"Campaign Id not found")

        //lets get the campaign from the campaign id 
        const campaign = await Campaign.findOne({
            _id:campaignId,
            createdBy:adminId
        })

        ApiError.notFound(campaign,"Campaign Didnt exist!!")

        //now lets get the public id from the existing collection which will leter used to delete the old image
        const currentPublicId = campaign.campaignBanner.publicId

        //lets upload the new image on multer
        //first check weather user has given the image or not
        ApiError.assert(req.file?.buffer,"Campaign banner image is required");

        let uploadResult;

        try {
                uploadResult = await uploadBufferToCloudinary(
                req.file.buffer,
                "campaign-poster"
                );
            } catch (error) {
                //just for debugging, remove later
                console.log("updateCoverImage Cloudinary Error:", error)
                throw new ApiError(500, "Failed to upload campaign banner");
            }
        
        //lets upload the new results in the collection
        campaign.campaignBanner.url = uploadResult.secure_url
        campaign.campaignBanner.publicId = uploadResult.public_id
        await campaign.save()

        //till here new photo is updated now we will delete the old photo
        try{
            await deleteFromCloudinary(currentPublicId)
        }
        catch(err){
            console.error(err)
        }

        return res.status(201).json(
                    new ApiResponse(
                    201,
                    null,
                    "Image Updated Successfully"
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