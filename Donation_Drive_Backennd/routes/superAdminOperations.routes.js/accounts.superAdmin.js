import express from "express"
import { addNewAdmin } from "../../controllers/superAdminOperations/manageAdmins.superAdminOperations.controller.js"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { authorize } from "../../middelwares/RBAC.middelware.js"
import { deleteAdminAccount } from "../../controllers/superAdminOperations/manageAdmins.superAdminOperations.controller.js"

const superAdminOperations = express.Router()

superAdminOperations.post('/add-admin',adminAuth,authorize("SUPER_ADMIN"),addNewAdmin)
superAdminOperations.post('/delete/:adminId',adminAuth,authorize("SUPER_ADMIN"),deleteAdminAccount)

export default superAdminOperations