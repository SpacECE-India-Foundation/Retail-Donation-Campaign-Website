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

export const fetchCampaignDetail = (campaignId) =>
  api.get(`/admin/campaign/campaign-details/${campaignId}`);

function buildCampaignFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
}

// fields: { campaignName, campaignDescription, startDate, endDate, campaignGoalAmount, campaignBanner (File) }
// note: no explicit Content-Type header here — axios/the browser auto-sets
// "multipart/form-data" WITH the correct boundary when the body is a FormData
// instance; setting it manually strips the boundary and the server can't parse the file out.
export const createCampaign = (fields) =>
  api.post("/admin/campaign/new-campaign", buildCampaignFormData(fields));

// payload: any subset of { campaignName, campaignDescription, campaignGoalAmount, startDate, endDate, campaignStatus }
export const updateCampaign = (campaignId, payload) =>
  api.patch(`/admin/campaign/update-campaign/${campaignId}`, payload);

// campaignBannerFile: a File object
export const updateCampaignImage = (campaignId, campaignBannerFile) => {
  const formData = new FormData();
  formData.append("campaignBanner", campaignBannerFile);
  return api.patch(`/admin/campaign/update-image/${campaignId}`, formData);
};