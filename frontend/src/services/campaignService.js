import api from "./api";
import { getCampaignById } from "../data/donation.mock";

export const getCampaignProgress = () => api.get("/campaigns/progress");

const normalizeCampaign = (campaign, fallbackCampaign) => {
  const source = campaign && typeof campaign === "object" ? campaign : {};

  return {
    ...fallbackCampaign,
    ...source,
    campaignId:
      source.campaignId ||
      source._id ||
      source.id ||
      fallbackCampaign?.campaignId ||
      "",
    campaignName:
      source.campaignName ||
      source.name ||
      source.title ||
      fallbackCampaign?.campaignName ||
      "",
    description:
      source.description ||
      source.descriptionText ||
      source.summary ||
      fallbackCampaign?.description ||
      "",
    shortDescription:
      source.shortDescription ||
      source.summary ||
      source.description ||
      fallbackCampaign?.shortDescription ||
      "",
    banner:
      source.banner ||
      source.bannerImage ||
      source.imageUrl ||
      fallbackCampaign?.banner ||
      "",
    goal:
      Number(
        source.goal ?? source.goalAmount ?? source.campaignGoal ?? fallbackCampaign?.goal,
      ) || fallbackCampaign?.goal || 0,
    raised:
      Number(
        source.raised ?? source.raisedAmount ?? source.amountRaised ?? fallbackCampaign?.raised,
      ) || fallbackCampaign?.raised || 0,
    contributors:
      Number(source.contributors ?? source.supporters ?? fallbackCampaign?.contributors) ||
      fallbackCampaign?.contributors ||
      0,
    daysLeft:
      Number(source.daysLeft ?? source.daysRemaining ?? fallbackCampaign?.daysLeft) ||
      fallbackCampaign?.daysLeft ||
      0,
    category: source.category || fallbackCampaign?.category || "Community Campaign",
  };
};

export const getCampaignDetails = async (campaignId) => {
  if (!campaignId) {
    return null;
  }

  try {
    const { data } = await api.get(`/public/campaign/${campaignId}`);
    const payload = data?.data ?? data;

    if (payload) {
      return normalizeCampaign(payload, getCampaignById(campaignId));
    }
  } catch {
    // Fall back to the local campaign catalogue when the public route is unavailable.
  }

  return getCampaignById(campaignId);
};

export const fetchAdminCampaigns = () => api.get("/admin/campaign/admin-campaigns");
