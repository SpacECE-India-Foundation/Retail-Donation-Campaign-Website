import Admin from "../../models/admin.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import { generateAccessToken } from "../../utils/tokenGenerator.utils.js"
import { generateRefreshToken } from "../../utils/tokenGenerator.utils.js"
import { uploadBufferToCloudinary } from "../../utils/cloudinary.utils.js"
import { createUpdateOtp } from "../../utils/otp.utils.js"
import { verifyOtpHandler } from "../../utils/otp.utils.js"
import otpModel from "../../models/otp.modals.js"
import bcrypt from "bcryptjs";

/*
=========================================================================================
                                COOKIE SECURITY GUIDE
=========================================================================================

Cookies browser me store hoti hain aur har request ke saath backend ko automatically
bheji ja sakti hain. Lekin browser kuch security rules follow karta hai.

Humare liye sabse important 3 options hain:

1. httpOnly
2. secure
3. sameSite

-----------------------------------------------------------------------------------------
1. httpOnly
-----------------------------------------------------------------------------------------

httpOnly: true

Meaning:
---------
Browser ki JavaScript (document.cookie) is cookie ko access nahi kar sakti.

Why?
----
Agar website me kabhi XSS (Cross Site Scripting) attack ho jaye,
to attacker JavaScript ke through authentication cookie chura nahi payega.

Industry Practice:
------------------
Authentication cookies (JWT, Session ID, Refresh Token) ke liye hamesha
httpOnly:true use karna chahiye.

-----------------------------------------------------------------------------------------
2. secure
-----------------------------------------------------------------------------------------

secure: true

Meaning:
---------
Cookie sirf HTTPS connection par hi browser se backend ko bheji jayegi.

secure: false

Meaning:
---------
Cookie HTTP aur HTTPS dono par kaam karegi.

When to use?
------------
Local Development:
Frontend  -> http://localhost:5173
Backend   -> http://localhost:3002

Yaha HTTPS nahi hota.
Isliye:

secure:false

Production:
Frontend  -> https://xxxxx.vercel.app
Backend   -> https://xxxxx.onrender.com

Production me HTTPS hota hai.
Isliye:

secure:true

Note:
-----
Agar localhost par secure:true kar diya,
to browser cookie send hi nahi karega.

-----------------------------------------------------------------------------------------
3. sameSite
-----------------------------------------------------------------------------------------

sameSite browser ko batata hai ki cookie kis type ki request ke saath bhejni hai.

3 options hote hain:

----------------------------------
A) sameSite: "strict"
----------------------------------

Sabse secure option.

Browser cookie sirf same-site requests me bhejega.

Example:

Frontend
http://localhost:5173

Backend
http://localhost:3002

Ye development me generally sahi kaam karta hai.

Lekin agar frontend aur backend alag domains par ho:

Frontend
https://abc.vercel.app

Backend
https://xyz.onrender.com

To browser cookie send nahi karega.

----------------------------------
B) sameSite: "lax"
----------------------------------

Strict se thoda relaxed.

Cookie same-site requests me to jayegi hi.

Cross-site me sirf kuch safe situations me jayegi
(jaise top-level GET navigation).

Lekin cross-site fetch()/axios POST requests me generally use nahi hoti.

Authentication APIs ke liye ye usually enough nahi hoti.

----------------------------------
C) sameSite: "none"
----------------------------------

Cookie same-site aur cross-site dono requests me bheji jayegi.

Ye tab use hota hai jab frontend aur backend alag domains par deployed hon.

Example:

Frontend:
https://myapp.vercel.app

Backend:
https://myapi.onrender.com

IMPORTANT:
-----------
sameSite:"none" use karte waqt secure:true mandatory hai.

Agar secure:false hua,
to modern browsers cookie reject kar dete hain.

=========================================================================================
                    LOCALHOST vs PRODUCTION CONFIGURATION
=========================================================================================

LOCAL DEVELOPMENT

Frontend:
http://localhost:5173

Backend:
http://localhost:3002

Cookie:

httpOnly : true
secure    : false
sameSite  : "strict"

Reason:
-------
HTTP use ho raha hai aur localhost development environment hai.

-----------------------------------------------------------------------------------------

PRODUCTION

Frontend:
https://xxxxx.vercel.app

Backend:
https://xxxxx.onrender.com

Cookie:

httpOnly : true
secure    : true
sameSite  : "none"

Reason:
-------
Frontend aur backend different origins par hain.
Cross-origin authentication ke liye browser cookie tabhi bhejega.

=========================================================================================
                    BEST PRACTICE
=========================================================================================

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",

    // Production:
    // Frontend & Backend different domains
    // -> SameSite=None

    // Development:
    // Localhost
    // -> SameSite=Strict

    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "strict",
};

Production Environment Variable:

NODE_ENV=production

Local Environment Variable:

NODE_ENV=development
(or simply don't set NODE_ENV)

=========================================================================================
Remember:

✔ httpOnly  -> Protects cookie from JavaScript (XSS protection)

✔ secure    -> Cookie works only on HTTPS

✔ sameSite=strict -> Best for same-site/local development

✔ sameSite=none   -> Required when frontend and backend are on different domains

✔ sameSite=none always requires secure:true

✔ Never use secure:true on localhost (HTTP), otherwise cookies won't work.

=========================================================================================
*/

// Used only at registration, where there's no crop/adjust step yet — a
// square, subject-aware crop is still far better than the default 1200x675
// landscape crop used for campaign banners.
const AVATAR_TRANSFORMATION = [
  {
    width: 500,
    height: 500,
    crop: "fill",
    gravity: "auto",
  },
  {
    quality: "auto",
  },
  {
    fetch_format: "auto",
  },
]

// Used when an admin updates their own profile photo — by the time it gets
// here, the frontend's Adjust tool has already composed it into an exact
// 500x500 square (drag + zoom, with a circular preview guide so the admin
// sees exactly what they're saving). Re-cropping it again here with
// gravity:"auto" would silently re-guess a different framing than the one
// the admin actually picked, which is exactly the "looked fine before Save,
// zoomed in after Save" bug this replaces. Just optimize, don't crop.
const AVATAR_PRECROPPED_TRANSFORMATION = [
  {
    quality: "auto",
  },
  {
    fetch_format: "auto",
  },
]


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
        } = req.body

        //just for debugging, remove later
        // console.log("registerAdmin called for email:", email, "fullName:", fullName, "phone:", phone)

        //lets check for the validation
        ApiError.assert(fullName,"Full Name of the Admin is Required")
        ApiError.assert(email?.trim(),"Valid Email is Required")
        ApiError.assert(password && password.length>=8,"Password is required and should be 8 digits longer")

        //we will now find whether there a admin exist with the given credentials
        const isAdminExist = await Admin.findOne({ email })

        ApiError.assert(!isAdminExist,"Admin already Registered with the given Email, Please Sign In!")

        //hashing the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)

        let profileImageUrl = ""
        if (req.file?.buffer) {
          const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "admin-profile-images", "image", AVATAR_TRANSFORMATION)
          profileImageUrl = uploadResult.secure_url
          //just for debugging, remove later
          // console.log("registerAdmin uploaded profile image", profileImageUrl)
        } else if (req.body.profileImage) {
          profileImageUrl = req.body.profileImage
          //just for debugging, remove later
          // console.log("registerAdmin using profileImage from body")
        }

        const newAdmin = new Admin ({
            fullName,
            password:hashedPassword,
            email,
            phone: phone || "",
            profileImage: profileImageUrl,
        })

        //now we will generate the access and refresh token
        const accessToken = generateAccessToken({
            adminId: newAdmin._id
        })

        //generating the refresh token
        const refreshToken = generateRefreshToken({ adminId: newAdmin._id })

        //for the security purposes we will storing the refreshtoken in hashed form in our admin collection
        newAdmin.refreshToken = await bcrypt.hash(refreshToken, 12)

        await newAdmin.save()

      //now till here the account creation is completed, we will now send our tokens using the cookies to the browser
        res.cookie(
            "accessToken",
            accessToken,
            {
            httpOnly: true,

            // Localhost -> false
            // Production -> true
            //if we were in localhot then it will always be false because we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the secure cookie can be sent to the browser
            secure: process.env.NODE_ENV === "production",

            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 5 * 24 * 60 * 60 * 1000,
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
            httpOnly: true,
            // Localhost -> false
            // Production -> true
            //if we were in localhot then it will always be false because we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the secure cookie can be sent to the browser
            secure: process.env.NODE_ENV === "production",

            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
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
         return res.status(error.statusCode || 500).json(
    new ApiError(
        error.statusCode || 500,
        error.message
    )
)

    }
}

//-----------------------------------------------------------NOW THIS CONTROLLER WILL DEAL WITH THE ADMIN LOGIN-----------------------------------
export const adminLogin = async (req,res) =>{
    try {
        const {email,password} = req.body
        //just for debugging, remove later
        // console.log("adminLogin called for email:", email)
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
        admin.lastLogin = new Date();
        await admin.save()

        //now we will send the access token and refresh token using cookies
        res.cookie(
            "accessToken",
            accessToken,
            {
            httpOnly: true,
            // Localhost -> false
            // Production -> true
            //if we were in localhot then it will always be false because we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the secure cookie can be sent to the browser
            secure: process.env.NODE_ENV === "production",

            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 5 * 24 * 60 * 60 * 1000,
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
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
        return res.status(error.statusCode || 500).json(
    new ApiError(
        error.statusCode || 500,
        error.message
    )
)
    }
}



//------------------------------------------------------------------------NOW WE WILL IMPLEMENT THE FORGOT PASSWORD FUNCTIONALITY--------------------------------------
export const forgotPassword = async (req,res) =>{
    try {
        const {email} = req.body
        //just for debugging, remove later
        // console.log("forgotPassword called for email:", email)

        ApiError.assert(email,"Email is required to reset the password")

        //checking weather there is any account with the recieved email address
        const isEmailExists = await Admin.findOne({email})

        ApiError.notFound(isEmailExists,"No account found with this email")

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
        return res.status(error.statusCode || 500).json(
    new ApiError(
        error.statusCode || 500,
        error.message
    )
)
    }
}



//-----------------------------------------------------A CONTROLLER TO GET THE ENTERED OTP FROM THE USER AND VERIFY IT------------------------------------------------------------
export const verifyOtp = async (req,res) =>{
    try {
        const {otp,email} = req.body
        //just for debugging, remove later
        // console.log("verifyOtp called for email:", email, "otp:", otp)
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
        //just for debugging, remove later
        // console.log("resetPassword called for email:", email)
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
        admin.passwordChangedAt = new Date();
        //here we will be deleting the old refrsh token from the collection
        admin.refreshToken = null
        await admin.save()

        //now we will delete this otp from the collection
        await otpModel.deleteOne({
            email,
            purpose:"forgot_password"
        })

        //clearing the cookies from the browser
        res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

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

export const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            // Localhost -> false
            // Production -> true
            //if we were in localhot then it will always be false because we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the secure cookie can be sent to the browser
            secure: process.env.NODE_ENV === "production",

            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 5 * 24 * 60 * 60 * 1000,
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            // Localhost -> false
            // Production -> true
            //if we were in localhot then it will always be false because we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the secure cookie can be sent to the browser
            secure: process.env.NODE_ENV === "production",

            //now for same site in local development we will set it to strict because the frontend and backend are on the same domain but in production we will set it to none because the frontend and backend are on different domains
            // sameSite: "strict",
            //here, the same reason goes in the localhost we are not storing NODE_ENV in our local .env file but in production we will set it to production so that the same site cookie can be sent to the browser
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 14 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json(
            new ApiResponse(200, null, "Logged out successfully")
        );
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error.message)
        );
    }
};


//---------------------------------------------------------THIS FUNCTION LETS A LOGGED-IN ADMIN UPDATE THEIR OWN PROFILE----------------------------------------
export const updateAdminProfile = async (req,res) =>{
    try {
        //this is a protected route so we will get the adminId from the adminAuth middleware
        const adminId = req.admin.adminId

        const { fullName, phone, removeProfileImage } = req.body
        //just for debugging, remove later
        // console.log("updateAdminProfile called for adminId:", adminId)

        const admin = await Admin.findById(adminId)
        ApiError.notFound(admin,"Admin not found")

        if(fullName !== undefined){
            const trimmedName = fullName.trim()
            ApiError.assert(trimmedName.length >= 3,"Full name should be at least 3 characters")
            admin.fullName = trimmedName
        }

        if(phone !== undefined){
            if(phone === ""){
                admin.phone = ""
            }else{
                ApiError.assert(/^[6-9]\d{9}$/.test(phone),"Please enter a valid phone number")
                admin.phone = phone
            }
        }

        //if a new profile image file was uploaded, push it to cloudinary and update the url
        //(already composed to an exact square by the frontend's Adjust tool —
        //see AVATAR_PRECROPPED_TRANSFORMATION above, don't re-crop it here)
        if(req.file?.buffer){
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "admin-profile-images", "image", AVATAR_PRECROPPED_TRANSFORMATION)
            admin.profileImage = uploadResult.secure_url
        } else if(removeProfileImage === true || removeProfileImage === "true"){
            //admin explicitly removed their photo — no new file was sent, just clear it
            admin.profileImage = ""
        }

        await admin.save()

        return res.status(200).json(
            new ApiResponse(
            200,
            {
                adminId: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                phone: admin.phone,
                profileImage: admin.profileImage
            },
            "Profile updated successfully"
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


//---------------------------------------------------------THIS FUNCTION LETS A LOGGED-IN ADMIN CHANGE THEIR OWN PASSWORD----------------------------------------
export const changePassword = async (req,res) =>{
    try {
        const adminId = req.admin.adminId
        const { currentPassword, newPassword } = req.body
        //just for debugging, remove later
        // console.log("changePassword called for adminId:", adminId)

        ApiError.assert(currentPassword,"Current password is required")
        ApiError.assert(newPassword && newPassword.length >= 8,"New password is required and should be 8 characters or longer")

        //need the actual password hash back, since the schema hides it with select:false by default
        const admin = await Admin.findById(adminId).select("+password")
        ApiError.notFound(admin,"Admin not found")

        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, admin.password)
        ApiError.assert(isCurrentPasswordCorrect,"Current password is incorrect")

        admin.password = await bcrypt.hash(newPassword, 12)
        admin.passwordChangedAt = new Date()
        //invalidating the existing refresh token forces a fresh login on other sessions too
        admin.refreshToken = null
        await admin.save()

        //clear this session's cookies as well, so the admin has to log back in with the new password
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json(
            new ApiResponse(
            200,
            null,
            "Password changed successfully! Please log in again."
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