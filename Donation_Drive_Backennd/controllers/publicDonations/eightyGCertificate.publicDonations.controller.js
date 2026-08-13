//This are the controllers for the 80 g certificate related functionalities 
import mongoose from "mongoose";
import Donation from "../../models/donation.modals.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import EightyGCertificate from "../../models/EightyGCertificate.modals.js";
import eightyGCertificateService from "../../services/eightyGCertificate.services.js";
import emailService from "../../services/email.services.js";


//---------------------------------------------CONTROLLER TO HANDLE THE REQUEST FOR THE 80G CERTIFICATE GENERATION---------------------------------------------
export const request80GCertificate = async (req,res) =>{
    //The procedure behind the certificate genration functionality 
    //first we will get the pan id from the frontend request 
    //then we will check if the pan number is valid or not
    //then we will check if the g0g certificate is alredy generated or not if it is already generated then we will send the certificate url to the frontend
    //if certificate is not generated for that donation then we will generate the 80g certificate and send them via email to the donor

    const session = await mongoose.startSession();

    try{

        const {panNumber} = req.body
        const {donationId} = req.params

        // Diagnostic logging only — never logs the PAN value itself.
        console.log("request80GCertificate donationId:", donationId, "panProvided:", Boolean(panNumber))

        //firstly we will check if the Pan number is available or not or is it valid or not
        ApiError.assert(
            panNumber,
            400,
            "PAN number is required."
        );

        const normalizedPAN = panNumber.trim().toUpperCase();

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/

        ApiError.assert(
            panRegex.test(normalizedPAN),
            400,
            "Invalid PAN number format. Please provide a valid PAN number."
        );


        //now we will check for the donation is this donation valid or not or with the same we will try to find out weather is there any 80g certificate already available for this donation
        //we are maintaining the flag that the 80gcertificate genrated in the donation but that flag can be modified from the fronted request so for better practive we are checking the eaxct backend data for this 
        const donation = await Donation.findById(
            donationId
        )

        ApiError.assert(
            donation,
            404,
            "No donation found in the Database!!"
        )


        //now we will check the status of the donation ony the verifed donations are eligible for 80g certificate generation
        ApiError.assert(
            donation.status === "Verified",
            400,
            "The Donation is Not Verified Yet!!"
        )


        //now we will move forwards now we will look into the is the 80g ertificate genrated for this donation or not
        const eightyGCertificateExist =
            await EightyGCertificate.exists({
                donation: donation._id
            })

        ApiError.assert(
            !eightyGCertificateExist,
            409,
            "The certificate is already Generated!!"
        )


        //now we will call the 80G certification service
        const certificate =
            await eightyGCertificateService.generateAndUploadCertificate({
                donorName: donation.donorName,
                panNumber: normalizedPAN,
                donationAmount: donation.amount,
                donationDate:
                    donation.paymentDate ||
                    donation.createdAt
            });


        //now we will save our this generated certificate data into our centralized collection
        session.startTransaction();

        try {

            const [eightyGCertificate] =
                await EightyGCertificate.create(
                    [
                        {
                            donation: donation._id,

                            panNumber: normalizedPAN,

                            donorName: donation.donorName,

                            donorEmail: donation.donorEmail,

                            donationAmount: donation.amount,

                            donationDate:
                                donation.paymentDate ||
                                donation.createdAt,

                            certificateNumber:
                                certificate.certificateNumber,

                            certificateUrl:
                                certificate.certificateUrl,

                            publicId:
                                certificate.publicId,

                            generatedAt: new Date(),

                            status: "GENERATED",

                            generationError: ""
                        }
                    ],
                    {
                        session
                    }
                );


            // If you have is80GCertificateGenerated in Donation model,
            // update it here.

            donation.panNumber = normalizedPAN;

if (
    Object.prototype.hasOwnProperty.call(
        donation.toObject(),
        "is80GCertificateGenerated"
    )
) {
    donation.is80GCertificateGenerated = true;
}

await donation.save({
    session
});


            await session.commitTransaction();


            //now we will send the response to the frontend before sending the email
            //because certificate generation is already completed successfully and email failure should not affect the certificate generation
            res.status(201).json(
                new ApiResponse(
                    201,
                    {
                        certificateId:
                            eightyGCertificate._id,

                        certificateNumber:
                            certificate.certificateNumber,

                        certificateUrl:
                            certificate.certificateUrl
                    },
                    "80G certificate generated successfully."
                )
            );


            //now we will send the certificate email in the background
            //we are not waiting for the email response because the certificate is already generated successfully
            // Diagnostic logging only — never logs the donor's actual email address here, just whether one exists.
            console.log(
                "request80GCertificate donationId:", donation._id,
                "donorEmailPresent:", Boolean(donation.donorEmail),
                "emailSendAttempted:", true
            )
            emailService.send80GCertificateEmail({
                donorName: donation.donorName,
                donorEmail: donation.donorEmail,
                donationAmount: donation.amount,
                donationDate:
                    (
                        donation.paymentDate ||
                        donation.createdAt
                    ).toLocaleDateString("en-IN"),
                certificateNumber:
                    certificate.certificateNumber,
                certificateUrl:
                    certificate.certificateUrl
            })
            .then(() => {

                console.log(
                    `80G certificate email sent successfully to ${donation.donorEmail}`
                );

            })
            .catch((emailError) => {

                console.error(
                    "80G certificate email failed:",
                    emailError.message
                );

            });


        } catch (dbError) {

            await session.abortTransaction();

            //certificate has already been uploaded to Cloudinary but database operation failed
            //so we will delete the uploaded certificate from Cloudinary to prevent orphan files
            try {

                if (certificate?.publicId) {

                    await eightyGCertificateService.deleteCertificate(
                        certificate.publicId
                    );

                }

            } catch (cleanupError) {

                console.error(
                    "Failed to cleanup 80G certificate from Cloudinary:",
                    cleanupError.message
                );

            }

            throw dbError;
        }

    } catch(error){

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error(
            "80G certificate generation failed:",
            error.message
        );

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Failed to generate 80G certificate: " +
            error.message
        );

    } finally {

        await session.endSession();

    }
}