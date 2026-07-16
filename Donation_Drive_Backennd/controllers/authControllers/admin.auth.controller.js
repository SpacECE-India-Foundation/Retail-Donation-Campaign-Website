import Admin from "../../models/admin.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import { generateAccessToken } from "../../utils/tokenGenerator.utils.js"
import { generateRefreshToken } from "../../utils/tokenGenerator.utils.js"
import { createUpdateOtp } from "../../utils/otp.utils.js"
import { verifyOtpHandler } from "../../utils/otp.utils.js"
import otpModel from "../../models/otp.modals.js"
import bcrypt from "bcryptjs"





//---------------------------------------------------THE ADMIN REGISTRATION CONTROLLER---------------------------------------------------
//STEP1 : WE WILL TAKE THE BASIC DETAILS FROM THE REQUEST BODY FOR THE ADMIN PROFILE 
//STEP2 : WE WILL APPLY VALIDATION CHECK ON ALL THE FIELDS
// STEP3 : CHECK WEATHER THE PROVIDED EMAIL/ID ALREADY REGISTERED AS AN ADMIN OR NOT
//STEP 4: IF WE FOUND THE SAME CREDENTIALS WE  WILL RETURN THE RESPONSE WITH THE USER ALREADY EXIST WITH THE GIVEN CREDENTIALS
//STEP 5: ELSE WE WILL GENERATE THE ACCES TOKEN AND REFRSH TOKEN
//STEP 6: SAVE THE ADMIN PROFILE IN THE DB COLLECTION 
//STEP 7: WE WILL SEND COOKIES TO BROWSER

export const registerAdmin = async (req,res) =>{
    try {
        //getting all the required info from the request body 
        const {
            fullName,
            email,
            password,
            phone,
            profileImage,
        } = req.body

        //lets check for the validation
        ApiError.assert(fullName,"Full Name of the Admin is Required")
        ApiError.assert(email?.trim(),"Valid Email is Required")
        ApiError.assert(password && password.length>=8,"Password is required and should be 8 digits longer")

        //we will now find weather there a admin exist with the given credentials
        const isAdminExist = await Admin.findOne({email})
        ApiError.assert(!isAdminExist,"Admin already Registered with the given Email, Please Sign In!")

        //hashing the password using bcrypt
        const hashedPassword = await bcrypt.hash(password,12)

        //here we will implement the profile picture upload functionality in the system



        const newAdmin = new Admin ({
            fullName,
            password:hashedPassword,
            email,
            phone,
            profileImage
        })

        //now we will generate the access and refresh token 
        const accessToken = generateAccessToken({
            adminId: newAdmin._id
        })

        //generating the refresh token 
        const refreshToekn = generateRefreshToken({
            adminId:newAdmin._id
        })

        //for the security purposes we will storing the refreshtoken in hashed form in our admin collection
        newAdmin.refreshToken = await bcrypt.hash(refreshToekn,12)

        await newAdmin.save()


        //now till here the account creation is completed, we will now send our tokens using the cookies to the browser
        res.cookie(
            "accessToken",
            accessToken,
            {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 5 * 24 * 60 * 60 * 1000,
            }
        );

        res.cookie(
            "refreshToken",
            refreshToekn,
            {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 14 * 24 * 60 * 60 * 1000,
            }
        );

        //here we will implement the successfull mail sending funtionality

        //now we will send success message of registration to the frontend
        return res.status(201).json(
            new ApiResponse(
            201,
            null,
            "Admin registered successfully"
            )
        );

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

//-----------------------------------------------------------NOW THIS CONTROLLER WILL DEAL WITH THE ADMIN LOGIN-----------------------------------
export const adminLogin = async (req,res) =>{
    try {
        const {email,password} = req.body
        ApiError.assert(email,"Email is Required for Login!")
        ApiError.assert(password,"Both the password and email is Required!!")

        //now lets find if the user exist in the Admin or not
        const admin = await Admin.findOne({email}).select("+password +refreshToken")

        ApiError.notFound(admin,"Admin Not Found")

        //here, we will check if the account is blocked or not due to maximum login failed number threshold reach
        if(admin.lockUntil && admin.lockUntil>Date.now()){
            throw new ApiError(
                423,
                "Account Locked, Try Again Later!"
            )
        }

        //now we will compare the password with the hashed password stored in the collection
        const isPasswordMatched = await bcrypt.compare(password,admin.password)

        if (!isPasswordMatched) {
            admin.loginAttempts++;

            if(admin.loginAttempts >= 5){
                admin.lockUntil = new Date(
                Date.now() + 30 * 60 * 1000
            );
        }

        await admin.save();

        throw new ApiError(
            401,
            "Invalid Credentials"
        );
    }

        //if the code comes here that means the login is successfull so we will reset the attempt count to 0
        admin.loginAttempts = 0
        //now we will regrenrate the access token and refresh token
        //here we will use refresh token rotation technique to enhance the token security

        const accessToken = generateAccessToken({
            adminId:admin._id
        })

        const refreshToken = generateRefreshToken({
            adminId:admin._id
        })

        //now we will update the newly generated refresh token to the collection 
        admin.refreshToken = await bcrypt.hash(refreshToken,12)

        //here we will update the other details rearding the login activities for the admin
        admin.lastLogin = Date.now()
        admin.lockUntil = null
        await admin.save()

        //now we will send the access token and refresh token using cookies
        res.cookie(
            "accessToken",
            accessToken,
            {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 5 * 24 * 60 * 60 * 1000,
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 14 * 24 * 60 * 60 * 1000,
            }
        );

        
        return res.status(200).json(
            new ApiResponse(
            200,
            {
                adminId: admin._id,
                email:admin.email,
                name:admin.fullName
            },
            "Login Succesfull!!"
            )
        );


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



//------------------------------------------------------------------------NOW WE WILL IMPLEMENT THE FORGOT PASSWORD FUNCTIONALITY--------------------------------------
export const forgotPassword = async (req,res) =>{
    try {
        const {email} = req.body

        ApiError.assert(email,"Email is required to reset the password")

        //checking weather there is any account with the recieved email address
        const isEmailExists = await Admin.findOne({email})

        ApiError.notFound(isEmailExists,"If Account exist otp has been send")

        //if it found then we will generate the otp and send it to the user
        await createUpdateOtp({
            email,
            purpose:"forgot_password"
        })

        return res.status(200).json(
            new ApiResponse(
            200,
            null,
            "OTP sent Successfully!!"
            )
        );

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



//-----------------------------------------------------A CONTROLLER TO GET THE ENTERED OTP FROM THE USER AND VERIFY IT------------------------------------------------------------
export const verifyOtp = async (req,res) =>{
    try {
        const {otp,email} = req.body
        ApiError.assert(otp,"OTP is required")

        //verification of the OTP
        const verifyOtp = await verifyOtpHandler({
            otp,
            email,
            purpose:"forgot_password"
        })

        return res.status(200).json(
            new ApiResponse(
            200,
            null,
            "OTP verified successfully Successfully!!"
            )
        );


    } catch (error) {
        return res.status(500).json(
            new ApiError(
            500,
            error.message
            )
        );
    }
}

//---------------------------------------------------------------THIS IS THE FUNCTION CONTROLLER TO RESET THE PASSWORD--------------------------------------
export const resetPassword = async (req,res) =>{
    try {
        const {email,newPassword} = req.body
        ApiError.assert(email,"email is required")
        ApiError.assert(newPassword && newPassword.length >= 8,"Valid Password is required")

        const otp = await otpModel.findOne({
            email,
            purpose:"forgot_password"
        })

        ApiError.notFound(otp,"OTP didn't found!!")

        ApiError.assert(otp.verified,"Otp is not verified, Please verify your Otp")

        const admin = await Admin.findOne({
            email,
        })

        ApiError.notFound(admin,"No Admin Found!!")

        //hashing the new password
        const hashedNewPassword = await bcrypt.hash(newPassword,12)
        admin.password = hashedNewPassword
        //here we will be deleting the old refrsh token from the collection
        admin.refreshToken = null
        await admin.save()

        //now we will delete this otp from the collection
        await otpModel.deleteOne({
            email,
            purpose:"forgot_password"
        })

        //clearing the cookies from the browser
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json(
            new ApiResponse(
            200,
            null,
            "Password Changed Successfully! Now Login"
            )
        );
    } catch (error) {
        return res.status(500).json(
            new ApiError(
            500,
            error.message
            )
        );
    }
}