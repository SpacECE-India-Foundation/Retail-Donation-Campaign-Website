//------------------------------------------------THIS CONTROLLER FILE WILL HANDLE THE DONATION FORM FUNCTIONALITY AS WELL AS SHOWING THE DETAILS OF RECENT DONORS FOR DONOR WALL 

import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import emailService from "../../services/email.services.js";
import Campaign from "../../models/campaign.modals.js";
import Donation from "../../models/donation.modals.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.utils.js";


//----------------------------------------------------------THIS FUNCTION IS FOR THE DONATION FORM COLLECTION---------------------------------------------------------------------------
export const registerDonation = async (req,res) =>{
    
    try {
        //This will be a publicly available form so there no authentication needed we can directly start by taking the input from the body
        let {
            donorName,
            donorEmail,
            donorPhone,  //optional
            address, //optional
            donorMessage, //optional
            amount,
            paymentMode, 
            transactionId,
            campaign  //need campaign id from the frontend not the name, you can show the camapign name on the frontend but we need id as a response 
        } = req.body

        const paymentMethods = ["UPI", "Bank Transfer"]

        //first of all we have to find that weather the selected campaign id exists or not and aslo we will check the duplicacy here 


        //now we will implement the validation for this
        
        //validation for fullName
        ApiError.assert(donorName, "Full name is required");

        ApiError.assert(
            donorName?.trim().length >= 3 && donorName.length <= 50,
            "Full name must be between 3 and 50 characters."
        );

        const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

        ApiError.assert(
            fullNameRegex.test(donorName),
            "Full name must contain only alphabets and single spaces."
        );

        //validations for donor email
        //it is requested with the frontend team to have a strict eye on the user email nudge them to only enter correct email id
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        ApiError.assert(
            emailRegex.test(donorEmail),
            "Invalid email address."
        );

        //donor message validation
        if(donorMessage!==undefined){
            donorMessage = donorMessage.trim();
            ApiError.assert(
                donorMessage.length<=500,
                "Message too long."
            )
        }

        //validation for donorPhone
        if(donorPhone!==undefined){
            const phoneRegex = /^[6-9]\d{9}$/;
            ApiError.assert(
                phoneRegex.test(donorPhone),
                "Please enter a valid 10-digit mobile number."
            );
        }

        //validation for amount
        const donationAmount = Number(amount)
        console.log(donationAmount)
        ApiError.assert(Number.isFinite(donationAmount) && donationAmount>0, "Invalid donation amount")

        //validation for the payment mode
        ApiError.assert(paymentMode && paymentMethods.includes(paymentMode),"Please select a valid and allowed payment mode")

        //validation fr the transaction id, this is one of the most major primary key 
        if (transactionId !== undefined) {
            transactionId = transactionId.trim();
            ApiError.assert(
                transactionId.length >= 6 && transactionId.length <= 50,
                "Transaction ID must be between 6 and 50 characters."
            );

            const transactionRegex = /^[A-Za-z0-9_-]+$/;

            ApiError.assert(
                transactionRegex.test(transactionId),
                "Transaction ID contains invalid characters."
            );
        }


        //now we have to do validation alltogether first we have to check weather this campaign id exists or not then we have to check for duplication entries of same transaction id
        //for this we are also implementing if someone presses donate button with the same credentials many time then we have to check before saving it to the db
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); 
        const [campaignExists,donorValid,isTransactionIdExist] = await Promise.all([
            Campaign.exists({
                _id:campaign
            }),
            Donation.exists({
                campaign,
                donorEmail,
                createdAt: {
                    $gte:fiveMinutesAgo
                }
            }),
            Donation.exists({
                transactionId
            })
        ])

        //now we will check weather the booleans are false then we will return the not conitunous message
        ApiError.assert(campaignExists,"Campaign Associated with this donation is Invalid")
        ApiError.assert(!donorValid,"We have already received your donation request. Please wait a few minutes before trying again.")
        ApiError.assert(!isTransactionIdExist,"Transaction Id Already exist")
        //till here validation are completed now we will just do the screenshot upload task
        ApiError.assert(req.file?.buffer,"Donation Payment screenshot is required");

        let uploadResult;
        
        try {
            uploadResult = await uploadBufferToCloudinary(
            req.file.buffer,
            "donation-screenshots"
            );
        } catch (error) {
            //just for debugging, remove later
            console.log("Cloudinary Error:", error)
            throw new ApiError(500, "Failed to upload campaign banner");
        }

        //now we will save this to the collection 
        const newDonation = new Donation({
            donorName,
            donorEmail,
            donorPhone,
            transactionId,
            address,
            donorMessage,
            paymentMode,
            amount:donationAmount,
            campaign,
            screenshot: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
            },
            paymentDate : new Date()
        })

        await newDonation.save()

        //here we will send successfull donationr esponse to the frontend
        res.status(201).json(
            new ApiResponse(
                201,
                {
                    donationId: newDonation._id,
                    donationStatus: newDonation.status
                },
                "New donation registered Successfully!!"
                )
        );

        //now here, we will send mail message to the donor regardiing the successfully registration of donation 

        emailService.sendDonationConfirmationEmail({
            donorName,
            donorEmail,
            campaignName: "Early Childhood Education",
            donationAmount,
            transactionId,
            trackingLink: `${process.env.FRONTEND_URL}/track-donation/${newDonation._id}`
            }).catch(err => {
            console.error("Email sending failed:", err);
        });

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
