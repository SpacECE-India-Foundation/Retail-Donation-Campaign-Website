import bcrypt from "bcrypt"
import Admin from "../../models/admin.modals.js"
import { ApiError } from "../../utils/apiError.utils.js"
import { ApiResponse } from "../../utils/apiResponse.utils.js"
import { generateAccessToken } from "../../utils/tokenGenerator.utils.js"
import { generateRefreshToken } from "../../utils/tokenGenerator.utils.js"
import { uploadBufferToCloudinary } from "../../utils/cloudinary.utils.js"




//---------------------------------------------------THE ADMIN REGISTRATION CONTROLLER---------------------------------------------------
//STEP1 : WE WILL TAKE THE BASIC DETAILS FROM THE REQUEST BODY FOR THE ADMIN PROFILE 
//STEP2 : WE WILL APPLY VALIDATION CHECK ON ALL THE FIELDS
// STEP3 : CHECK WEATHER THE PROVIDED EMAIL/ID ALREADY REGISTERED AS AN ADMIN OR NOT
//STEP 4: IF WE FOUND THE SAME CREDENTIALS WE  WILL RETURN THE RESPONSE WITH THE USER ALREADY EXIST WITH THE GIVEN CREDENTIALS
//STEP 5: ELSE WE WILL GENERATE THE ACCES TOKEN AND REFRSH TOKEN
//STEP 6: SAVE THE ADMIN PROFILE IN THE DB COLLECTION 
//STEP 7: WE WILL SEND COOKIES TO BROWSER

export const registerAdmin = async (req, res, next) => {
  try {
        //just for debugging, remove later
        console.log("registerAdmin called", {
          method: req.method,
          url: req.url,
          body: req.body,
          hasFile: Boolean(req.file),
          fileName: req.file?.originalname,
        })

        //getting all the required info from the request body 
        const {
            fullName,
            email,
            password,
            phone,
        } = req.body

        //lets check for the validation
        ApiError.assert(fullName,"Full Name of the Admin is Required")
        ApiError.assert(email?.trim(),"Valid Email is Required")
        ApiError.assert(password && password.length>=8,"Password is required and should be 8 digits longer")

        //we will now find whether there a admin exist with the given credentials
        const isAdminExist = await Admin.findOne({ email })    
        ApiError.assert(!isAdminExist,"Admin already Registered with the given Email, Please Sign In!")

        //just for debugging, remove later
        console.log("registerAdmin email check passed")

        //hashing the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 12)

        let profileImageUrl = ""
        if (req.file?.buffer) {
            //just for debugging, remove later
          console.log("registerAdmin uploading profile image", req.file.originalname)
          const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "admin-profile-images")
          profileImageUrl = uploadResult.secure_url
          //just for debugging, remove later
          console.log("registerAdmin uploaded profile image", profileImageUrl)
        } else if (req.body.profileImage) {
          profileImageUrl = req.body.profileImage
          //just for debugging, remove later
          console.log("registerAdmin using profileImage from body")
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

        res.status(201).json(
          new ApiResponse(201, {
            adminId: newAdmin._id,
            email: newAdmin.email,
            profileImage: profileImageUrl,
            accessToken,
            refreshToken,
          }, "Admin registered successfully")
        )





    } catch (error) {
      //just for debugging, remove later
      console.error("registerAdmin error", error)
    }
}