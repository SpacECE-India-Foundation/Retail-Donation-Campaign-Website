import express from "express"
import { fetchPublicCampaigns, fetchPublicCampaignDetail } from "../../controllers/publicCampaigns/campaign.public.controller.js"
import { fetchPublicMilestones } from "../../controllers/publicCampaigns/milestone.public.controller.js"

const publicCampaignRoutes = express.Router()

publicCampaignRoutes.get("/", fetchPublicCampaigns)
publicCampaignRoutes.get("/:id", fetchPublicCampaignDetail)
publicCampaignRoutes.get("/:id/milestones", fetchPublicMilestones)

export default publicCampaignRoutes
