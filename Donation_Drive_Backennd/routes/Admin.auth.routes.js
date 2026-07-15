import express from "express"
import { registerAdmin } from "../controllers/authControllers/admin.auth.controller.js"
import { adminLogin } from "../controllers/authControllers/admin.auth.controller.js"
import { forgotPassword } from "../controllers/authControllers/admin.auth.controller.js"
import { verifyOtp } from "../controllers/authControllers/admin.auth.controller.js"
import { resetPassword } from "../controllers/authControllers/admin.auth.controller.js"
//THIS ROUTES FILE IS FOR ALL THE OPERATION REGARDING THE ADMIN AUTHENTICATION FUNCTIONALITITES
const adminAuthRoutes = express.Router()

adminAuthRoutes.post('/register-admin',registerAdmin)
adminAuthRoutes.post('/login-admin',adminLogin)
adminAuthRoutes.post('/forgot-password',forgotPassword)
adminAuthRoutes.post('/verify-otp',verifyOtp)
adminAuthRoutes.post('/reset-password',resetPassword)


export default adminAuthRoutes