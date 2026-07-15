//THIS UTILITIES ARE CREATED TO GENERATE SEND AND VERIFY OTP
import emailService from "../services/email.services.js";
import { ApiError } from "./apiError.utils.js";
import bcrypt from "bcryptjs"
import otpModel from "../models/otp.modals.js";

//--------------------------------------------------FUNCTION TO GENERATE OTP'S------------------------------------
//here, we have used special crypto based approach for the unpredictive otp 
export const generateOtp = async () =>{
    return crypto.randomInt(100000,1000000).toString()
}

//-------------------------------------------------FUNCTION TO INSERT OR UPDATE NEW OTP IN THE OTP MODEL-------------------------------
export const createUpdateOtp = async ({email,purpose}) =>{

        const otpExpiryTimeMinutes = process.env.OTP_EXPIRY_MINUTES
        const generatedOtp = await generateOtp()
        const otpExpireAt = new Date(Date.now()+otpExpiryTimeMinutes*60*1000)
        const hashedOtp = await bcrypt.hash(generatedOtp,12)

        //now we will update the otp if it exist or we will create a new otp
        await otpModel.findOneAndUpdate(
            {email,purpose},
            {
            otp:hashedOtp,
            expiresAt:otpExpireAt,
            verified:false,
            attempts:0
        },{
            upsert:true, //this means update+insert if the document found update it otherwise insert a new document
            new:true
        }
    )

    await emailService.sendOtpEmail(email,generatedOtp)
}



//------------------------------------------------------------FUNCTION TO VERIFY OTP ------------------------------------
export const verifyOtpHandler = async ({email,purpose,otp}) =>{
    const otp_entry = await otpModel.findOne({email, purpose});
    ApiError.notFound(otp_entry, "OTP not found !!!");
    ApiError.assert(otp_entry.expiresAt.getTime() > Date.now(), "OTP expired. Resend to continue.");

    if (otp_entry.attempts >= 3) {
        await otpModel.deleteOne({ _id: otp_entry._id});
        throw new ApiError(429,"Maximum OTP attempts exceeded");
    }

    const otpMatched = await bcrypt.compare(otp,otp_entry.otp)
    if (!otpMatched) {
        otp_entry.attempts += 1;
        await otp_entry.save();
        throw new ApiError(400,"Invalid OTP");
    }

    otp_entry.verified = true;
    await otp_entry.save();
    return otp_entry;
}