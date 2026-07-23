import express from "express"
import { registerAdmin } from "../controllers/authControllers/admin.auth.controller.js"
import { adminLogin } from "../controllers/authControllers/admin.auth.controller.js"
import { forgotPassword } from "../controllers/authControllers/admin.auth.controller.js"
import { verifyOtp } from "../controllers/authControllers/admin.auth.controller.js"
import { resetPassword } from "../controllers/authControllers/admin.auth.controller.js"
import { logoutAdmin } from "../controllers/authControllers/admin.auth.controller.js"
import { updateAdminProfile } from "../controllers/authControllers/admin.auth.controller.js"
import { changePassword } from "../controllers/authControllers/admin.auth.controller.js"
import { upload } from "../utils/upload.utils.js"
import { adminAuth } from "../middelwares/adminAuth.middelware.js"
//THIS ROUTES FILE IS FOR ALL THE OPERATION REGARDING THE ADMIN AUTHENTICATION FUNCTIONALITITES
const adminAuthRoutes = express.Router()

adminAuthRoutes.post('/register-admin',upload.single("profileImage"),registerAdmin)
adminAuthRoutes.post('/login-admin',adminLogin)
adminAuthRoutes.post('/forgot-password',forgotPassword)
adminAuthRoutes.post('/verify-otp',verifyOtp)
adminAuthRoutes.post('/reset-password',resetPassword)
adminAuthRoutes.post('/logout',adminAuth,logoutAdmin)
adminAuthRoutes.patch('/update-profile',adminAuth,upload.single("profileImage"),updateAdminProfile)
adminAuthRoutes.patch('/change-password',adminAuth,changePassword)

export default adminAuthRoutes