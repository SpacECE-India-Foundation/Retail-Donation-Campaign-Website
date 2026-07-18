import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { newCampaign } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { updateCampaignDetails } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { updateCoverImage } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { upload } from "../../utils/upload.utils.js"
import { fetchAdminCampaigns } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"
import { getCampaignDetail } from "../../controllers/adminOpeartions/campaign.adminOperations.controller.js"

const campaignAdminOperationsRoutes = express.Router()

campaignAdminOperationsRoutes.post('/new-campaign',adminAuth,upload.single("campaignBanner"),newCampaign)
campaignAdminOperationsRoutes.patch('/update-campaign/:campaignId',adminAuth,updateCampaignDetails)
campaignAdminOperationsRoutes.patch('/update-image/:campaignId',upload.single("campaignBanner"),adminAuth,updateCoverImage)
campaignAdminOperationsRoutes.get('/admin-campaigns',adminAuth,fetchAdminCampaigns)
campaignAdminOperationsRoutes.get('/campaign-details/:campaignId',adminAuth,getCampaignDetail)


export default campaignAdminOperationsRoutes