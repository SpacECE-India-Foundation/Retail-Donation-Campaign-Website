import express from "express"
import { fetchPublicCampaigns, fetchPublicCampaignDetail } from "../../controllers/publicCampaigns/campaign.public.controller.js"

const publicCampaignRoutes = express.Router()

publicCampaignRoutes.get("/", fetchPublicCampaigns)
publicCampaignRoutes.get("/:id", fetchPublicCampaignDetail)

export default publicCampaignRoutes
