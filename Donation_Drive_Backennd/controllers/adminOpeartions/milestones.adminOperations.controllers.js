//THIS CONTROLLERS ARE FOR THE CAMAPIGN MILESTONE MANAGEMENT AND ALL THE FUNCTIONALITY REGARDING THAT

import Milestone from "../../models/milestone.modals.js";
import Campaign from "../../models/campaign.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.utils.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.utils.js";
import mongoose from "mongoose";



//--------------------------------------------------FUNCTION TO ADD MILESTONE--------------------------------------
export const addMilestone = async (req,res) =>{
    try {
        //milestones are completely dependent on the campaigns so we need a campaign id for this and that will be find in params
        const adminId = req.admin.adminId
        const {campaignId} = req.params
        
        //now lets check weather this camapign exist ot not
        const camapign = await Campaign.findOne({
            _id:campaignId,
            createdBy:adminId
        })

        ApiError.notFound(camapign,"Campaign Didn't exist!!")

        //now lets get the details of milestone from the admin
        const{
            milestoneTitle,
            description,
            targetAmount,
            displayOrder,
        } = req.body

        //now lets validate the things
        //we can not keep the milestone title the primary key as there can be many similar milestone name for other campaigns aslo butt we have to find that already same title for the sameid did not exist
        ApiError.assert(milestoneTitle,"Milestone is requred")
        const isMilestoneExist = await Milestone.findOne({
            campaign:campaignId,
            milestoneTitle:milestoneTitle.trim()
        })

        //lets for ahead validation we should also have the data of the milestone created under this campaign
        const milestones = await Milestone.find({
            campaign: campaignId
        })

        ApiError.assert(!isMilestoneExist,"Milestone already created with the same name!")

        ApiError.assert(description,"Description is required!")

        ApiError.assert(!isNaN(Number(displayOrder)) && Number(displayOrder) > 0,"Invalid display order")

        const orderExist = milestones.some( //.some returns true or false
            milestone => milestone.displayOrder === Number(displayOrder)
        );

        ApiError.assert(
            !orderExist,
            "Display order already exists."
        );

        //we have to monitor that all the milestone target amount should not exceed the overall camapign goal Amount
        const totalAllocated = milestones.reduce((sum,item)=>sum+item.targetAmount,0)
        ApiError.assert(
        totalAllocated + Number(targetAmount) <= camapign.campaignGoalAmt,
        "Total milestone amount exceeds campaign goal."
        );

        ApiError.assert(
            !isNaN(Number(targetAmount)) &&
            Number(targetAmount) > 0 &&
            Number(targetAmount) <= camapign.campaignGoalAmt,
            "Invalid target amount"
        )
        
        let uploadResult;
        
        if(req.file?.buffer){
            try {
                uploadResult = await uploadBufferToCloudinary(
                        req.file.buffer,
                        `campaigns/${campaignId}/milestones`
                        );
            } catch (error) {
                throw new ApiError(500, "Failed to upload campaign banner");
            }
        }

        //now lets save it to the collection
        const newMilestone = new Milestone({
            campaign:campaignId,
            milestoneTitle,
            description,
            targetAmount,
            displayOrder,
            milestoneImage: {
                url: uploadResult?.secure_url||"",
                publicId: uploadResult?.public_id||"",
            },
        })

        await newMilestone.save() //Till here creation is completed

        return res.status(201).json(
                        new ApiResponse(
                        201,
                        {
                            milestoneId:newMilestone._id,
                            campaignId:newMilestone.campaign,
                            title:newMilestone.milestoneTitle
                        },
                        "Milestone created successfully"
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


//-------------------------------------------------THIS IS THE FUNCTION TO UPDATE THE MILESTONE DETAILS--------------------------------------------------------------
export const updateMilestone = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const adminId = req.admin.adminId;
        const { campaignId, milestoneId } = req.params;

        let {
            milestoneTitle,
            description,
            targetAmount,
            displayOrder
        } = req.body;

        // Fetch campaign and milestones simultaneously, here we are using promise.all as all this db calls will be made paralloly unlike the first call will wait for another call's completion
        const [campaign, milestones] = await Promise.all([

            Campaign.findOne({
                _id: campaignId,
                createdBy: adminId
            }).session(session),

            Milestone.find({
                campaign: campaignId
            }).session(session)

        ]);

        ApiError.notFound(
            campaign,
            "Campaign Didn't exist!!"
        );

        ApiError.assert(
            milestones.length > 0,
            "No milestone found!!"
        );

        // Find milestone from fetched array (No extra DB call)
        const milestone = milestones.find(
            item => item._id.toString() === milestoneId
        );

        ApiError.assert(
            milestone,
            "No such milestone exists."
        );

                //------------------------------------------------ VALIDATIONS ------------------------------------------------

        // Milestone title validation
        if (milestoneTitle !== undefined) {

            milestoneTitle = milestoneTitle.trim();

            ApiError.assert(
                milestoneTitle.length >= 3,
                "Title should be at least 3 characters."
            );

            const duplicateMilestone = await Milestone.findOne({
                campaign: campaignId,
                milestoneTitle,
                _id: { $ne: milestoneId }
            }).session(session);

            ApiError.assert(
                !duplicateMilestone,
                "A milestone with this title already exists."
            );
        }

        // Description validation
        if (description !== undefined) {

            description = description.trim();

            ApiError.assert(
                description.length >= 10,
                "Description should be at least 10 characters."
            );
        }

        // Target amount validation
        if (targetAmount !== undefined) {

            targetAmount = Number(targetAmount);

            ApiError.assert(
                !isNaN(targetAmount) && targetAmount > 0,
                "Invalid target amount."
            );

            // Existing total excluding current milestone
            const totalAllocated =
                milestones.reduce(
                    (sum, item) => sum + item.targetAmount,
                    0
                ) - milestone.targetAmount;

            ApiError.assert(
                totalAllocated + targetAmount <= campaign.campaignGoalAmt,
                "Total milestone amount exceeds campaign goal."
            );
        }

        // Display Order Validation
        if (displayOrder !== undefined) {

            displayOrder = Number(displayOrder);

            ApiError.assert(
                !isNaN(displayOrder) &&
                displayOrder > 0,
                "Invalid display order."
            );

            const maxOrder = milestones.length;

            ApiError.assert(
                displayOrder <= maxOrder,
                `Display order cannot exceed ${maxOrder}.`
            );

        }

                //------------------------------------------------ DISPLAY ORDER REORDERING ------------------------------------------------

        if (displayOrder !== undefined) {

            const oldOrder = milestone.displayOrder;
            const newOrder = displayOrder;

            // Agar admin ne same order diya hai to kuch nahi karna
            if (oldOrder !== newOrder) {

                // Milestone ko upar move kiya
                if (newOrder < oldOrder) {

                    await Milestone.updateMany(
                        {
                            campaign: campaignId,
                            _id: { $ne: milestoneId },
                            displayOrder: {
                                $gte: newOrder,
                                $lt: oldOrder
                            }
                        },
                        {
                            $inc: {
                                displayOrder: 1
                            }
                        },
                        {
                            session
                        }
                    );

                }

                // Milestone ko niche move kiya
                else {

                    await Milestone.updateMany(
                        {
                            campaign: campaignId,
                            _id: { $ne: milestoneId },
                            displayOrder: {
                                $gt: oldOrder,
                                $lte: newOrder
                            }
                        },
                        {
                            $inc: {
                                displayOrder: -1
                            }
                        },
                        {
                            session
                        }
                    );

                }

                milestone.displayOrder = newOrder;

            }

        }

        //------------------------------------------------ UPDATE MILESTONE FIELDS ------------------------------------------------

        if (milestoneTitle !== undefined) {
            milestone.milestoneTitle = milestoneTitle;
        }

        if (description !== undefined) {
            milestone.description = description;
        }

        if (targetAmount !== undefined) {
            milestone.targetAmount = targetAmount;
        }

        await milestone.save({
            session
        });
                //------------------------------------------------ COMMIT TRANSACTION ------------------------------------------------

        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    milestoneId: milestone._id,
                    campaignId: campaignId,
                    displayOrder: milestone.displayOrder
                },
                "Milestone updated successfully."
            )
        );

    } catch (error) {

        //------------------------------------------------ ROLLBACK ------------------------------------------------

        await session.abortTransaction();

        return res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        );

    } finally {

        //------------------------------------------------ CLOSE SESSION ------------------------------------------------

        session.endSession();

    }
}



//----------------------------------------------------THIS FUNCTION IS TO DELETE THE MILESTONE---------------------------------------------------------------
export const deleteMilestone = async (req,res) =>{
    try {
        const adminId = req.admin.adminId
        const {campaignId,milestoneId} = req.params

        //here first we will find the milestone they wants to delete and extract public_id of image as we have to delete those images also
        //here we dont want full data of camapign s we will use just .exist query which is slightly leightweight
        const campaign= await Campaign.exists({
        _id: campaignId,
        createdBy: adminId
        });
        
        ApiError.notFound(campaign, "Campaign not found");

        const milestone = await Milestone.findOneAndDelete({
            _id: milestoneId,
            campaign: campaignId
            })
        
        ApiError.notFound(milestone,"Milestone not found");
        
        await Milestone.updateMany(
            {
                campaign: campaignId,
                displayOrder: {
                    $gt: milestone.displayOrder
                }
            },
            {
                $inc: {
                    displayOrder: -1
                }
             }
        );
        //till here the deletion is done now we have to delete the cloudinary image for this milestone
        if(milestone.milestoneImage?.publicId){
            try {
                await deleteFromCloudinary(milestone.milestoneImage.publicId)
            } catch (error) {
                console.log(error)
            }
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    milestoneId: milestone._id,
                    campaignId: campaignId,
                    displayOrder: milestone.displayOrder
                },
                "Milestone deleted successfully."
            )
        );
    } catch (error) {
        res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        );
    }
}



//-------------------------------------------------THIS IS THE FUNCTION TO FETCH MILESTONES--------------------------------------
export const fetchAdminMilestones = async (req,res) =>{
    try {
        //we have to show only only those milestones which are associated with the opened campaign section
        const adminId = req.admin.adminId
        const {campaignId} = req.params

        //lets check weather campaign exist or not
        const campaign = await Campaign.exists({
            _id:campaignId,
            createdBy:adminId
        })

        ApiError.notFound(campaign,"No such campaign Found!!")

        //now lets fetch the milestones for this 
        const milestones = await Milestone.find({
            campaign:campaignId
        }).sort({ displayOrder: 1 })

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    milestones
                },
                "Milestone fetched successfully."
            )
        );

    } catch (error) {
        res.status(error.statusCode || 500).json(
            new ApiError(
                error.statusCode || 500,
                error.message
            )
        );
    }
}