import express from "express"
import { addNewAdmin, deleteAdminAccount, transferCampaignManagement, getAllAdmins, getAllCampaignsForTransfer, fetchAllAdmins } from "../../controllers/superAdminOperations/manageAdmins.superAdminOperations.controller.js"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { authorize } from "../../middelwares/RBAC.middelware.js"

const superAdminOperations = express.Router()
superAdminOperations.post('/add-admin',adminAuth,authorize("SUPER_ADMIN"),addNewAdmin)
superAdminOperations.post('/delete/:adminId',adminAuth,authorize("SUPER_ADMIN"),deleteAdminAccount)
superAdminOperations.post('/transfer-management',adminAuth,authorize("SUPER_ADMIN"),transferCampaignManagement)
superAdminOperations.get('/admins',adminAuth,authorize("SUPER_ADMIN"),getAllAdmins)
superAdminOperations.get('/all-admins',adminAuth,authorize("SUPER_ADMIN"),fetchAllAdmins)
superAdminOperations.get('/campaigns-overview',adminAuth,authorize("SUPER_ADMIN"),getAllCampaignsForTransfer)

export default superAdminOperations