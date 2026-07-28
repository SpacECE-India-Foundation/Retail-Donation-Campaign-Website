import express from "express"
import { addNewAdmin } from "../../controllers/superAdminOperations/registerNewAdmin.superAdminOperations.controller.js"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { authorize } from "../../middelwares/RBAC.middelware.js"

const superAdminOperations = express.Router()

superAdminOperations.post('/add-admin',adminAuth,authorize("SUPER_ADMIN"),addNewAdmin)

export default superAdminOperations