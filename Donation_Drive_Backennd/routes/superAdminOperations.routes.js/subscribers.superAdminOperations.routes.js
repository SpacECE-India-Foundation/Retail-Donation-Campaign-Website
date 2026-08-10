import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js";
import { authorize } from "../../middelwares/RBAC.middelware.js";
import { searchSubscribers } from "../../controllers/adminOpeartions/searchSubscribers.AdminOperations.controllers.js"

const subscribersSuperAdminOperations = express.Router()

subscribersSuperAdminOperations.get('/search-subscribers', adminAuth, authorize("SUPER_ADMIN"), searchSubscribers)

export default subscribersSuperAdminOperations