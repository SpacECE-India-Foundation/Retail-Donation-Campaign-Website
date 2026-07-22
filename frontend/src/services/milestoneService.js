import api from "./api";
import { normalizeMilestone } from "./campaignService";

export const getCampaignMilestones = async (campaignId) => {
  if (!campaignId) return [];

  const { data } = await api.get(`/campaigns/${campaignId}`);
  const milestones = data?.data?.milestones ?? data?.milestones ?? [];

  return Array.isArray(milestones) ? milestones.map(normalizeMilestone) : [];
};
