import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { newCampaign } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { updateCampaignDetails } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { updateCoverImage } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { upload } from "../../utils/upload.utils.js"
const campaignAdminOperationsRoutes = express.Router()

campaignAdminOperationsRoutes.post('/new-campaign',adminAuth,upload.single("campaignBanner"),newCampaign)
campaignAdminOperationsRoutes.patch('/update-campaign/:campaignId',adminAuth,updateCampaignDetails)
campaignAdminOperationsRoutes.patch('/update-image/:campaignId',upload.single("campaignBanner"),adminAuth,updateCoverImage)


export default campaignAdminOperationsRoutes