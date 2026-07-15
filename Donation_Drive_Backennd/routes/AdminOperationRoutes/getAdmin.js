import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { getCurrentAdmin } from "../../controllers/getAdmin/getAdmin.controller.js"
const getAdminRoute = express.Router()

getAdminRoute.get('/admin-me',adminAuth,getCurrentAdmin)


export default getAdminRoute