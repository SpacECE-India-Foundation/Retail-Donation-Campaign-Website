import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js";
import { authorize } from "../../middelwares/RBAC.middelware.js";
import { searchSubscribers } from "../../controllers/adminOpeartions/searchSubscribers.AdminOperations.controllers.js"
import { commitSubscriberImport, previewSubscriberImport } from "../../controllers/superAdminOperations/subscriberImport.superAdminOperations.controller.js";
import { subscriberImportUpload } from "../../utils/subscriberImportUpload.utils.js";

const subscribersSuperAdminOperations = express.Router()

subscribersSuperAdminOperations.get('/search-subscribers', adminAuth, authorize("SUPER_ADMIN"), searchSubscribers)
subscribersSuperAdminOperations.post('/import/preview', adminAuth, authorize("SUPER_ADMIN"), subscriberImportUpload.single("file"), previewSubscriberImport)
subscribersSuperAdminOperations.post('/import/commit', adminAuth, authorize("SUPER_ADMIN"), commitSubscriberImport)

export default subscribersSuperAdminOperations
