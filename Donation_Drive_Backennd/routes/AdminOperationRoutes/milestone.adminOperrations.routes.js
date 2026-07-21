import express from "express"
import { upload } from "../../utils/upload.utils.js"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { addMilestone } from "../../controllers/adminOpeartions/milestones.adminOperations.controllers.js"
import { updateMilestone } from "../../controllers/adminOpeartions/milestones.adminOperations.controllers.js"
import { deleteMilestone } from "../../controllers/adminOpeartions/milestones.adminOperations.controllers.js"
import { fetchAdminMilestones } from "../../controllers/adminOpeartions/milestones.adminOperations.controllers.js"

const milestoneAdminOperationRoute = express.Router()

milestoneAdminOperationRoute.post('/:campaignId/milestone',adminAuth,upload.single("mileStoneImage"),addMilestone)
milestoneAdminOperationRoute.patch('/:campaignId/milestone/:milestoneId',adminAuth,updateMilestone)
milestoneAdminOperationRoute.delete('/:campaignId/milestone/:milestoneId',adminAuth,deleteMilestone)
milestoneAdminOperationRoute.get('/:campaignId/milestones',adminAuth,fetchAdminMilestones)


export default milestoneAdminOperationRoute