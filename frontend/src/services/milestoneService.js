import api from "./api";
import { getMilestonesByCampaignId } from "../data/donation.mock";

/**
 * Public campaign milestones (replace with live API when available).
 * Admin reference: GET /api/admin/milestone/:campaignId/milestones
 */
export const getCampaignMilestones = async (campaignId) => {
  if (!campaignId) {
    return [];
  }

  try {
    const { data } = await api.get(`/public/campaign/${campaignId}/milestones`);
    const milestones = data?.data ?? data;
    return Array.isArray(milestones) ? milestones : [];
  } catch {
    return getMilestonesByCampaignId(campaignId);
  }
};

export const getMilestones = () => api.get("/milestones");
