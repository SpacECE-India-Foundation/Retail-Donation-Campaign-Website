import api from "./api";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getDaysLeft = (endDate) => {
  if (!endDate) return 0;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return 0;

  const diff = end.getTime() - Date.now();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
};

const getBannerUrl = (campaign) =>
  campaign?.campaignBanner?.url ||
  campaign?.bannerImage ||
  campaign?.banner ||
  campaign?.imageUrl ||
  "";

export const calculateCampaignStats = (campaignsOrCampaign) => {
  const campaigns = Array.isArray(campaignsOrCampaign)
    ? campaignsOrCampaign
    : campaignsOrCampaign
      ? [campaignsOrCampaign]
      : [];

  const totals = campaigns.reduce(
    (sum, campaign) => ({
      raised: sum.raised + toNumber(campaign.raised),
      goal: sum.goal + toNumber(campaign.goal),
      contributors: sum.contributors + toNumber(campaign.contributors),
      daysLeft: Math.max(sum.daysLeft, toNumber(campaign.daysLeft)),
    }),
    { raised: 0, goal: 0, contributors: 0, daysLeft: 0 },
  );

  const remaining = Math.max(totals.goal - totals.raised, 0);
  const progressPercent =
    totals.goal > 0 ? Math.min(Math.round((totals.raised / totals.goal) * 100), 100) : 0;

  return {
    ...totals,
    remaining,
    progressPercent,
  };
};

export const normalizeMilestone = (milestone = {}) => ({
  ...milestone,
  id: milestone._id || milestone.id || "",
  milestoneId: milestone._id || milestone.id || "",
  milestoneTitle: milestone.milestoneTitle || milestone.title || "Milestone",
  description: milestone.description || "",
  targetAmount: toNumber(milestone.targetAmount),
  raisedAmount: toNumber(milestone.raisedAmount),
  displayOrder: toNumber(milestone.displayOrder),
  image: milestone.milestoneImage?.url || milestone.image || "",
  isCompleted: Boolean(milestone.isCompleted),
  completedAt: milestone.completedAt || null,
});

export const normalizeCampaign = (campaign = {}) => {
  const campaignId = campaign._id || campaign.campaignId || campaign.id || "";
  const campaignName = campaign.campaignName || campaign.name || campaign.title || "Untitled Campaign";
  const description =
    campaign.campaignDescription ||
    campaign.description ||
    campaign.descriptionText ||
    "";
  const goal = toNumber(
    campaign.campaignGoalAmt ?? campaign.campaignGoalAmount ?? campaign.goalAmount ?? campaign.goal,
  );
  const raised = toNumber(
    campaign.campaignRaisedAmt ?? campaign.raisedAmount ?? campaign.amountRaised ?? campaign.raised,
  );
  const contributors = toNumber(campaign.contributors ?? campaign.supporters);
  const daysLeft = getDaysLeft(campaign.endDate);
  const progressPercent = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  return {
    ...campaign,
    campaignId,
    campaignName,
    title: campaignName,
    description,
    shortDescription: campaign.shortDescription || description.slice(0, 180),
    banner: getBannerUrl(campaign),
    category: campaign.category || campaign.campaignCategory || "Community Campaign",
    status: campaign.campaignStatus || campaign.status || "",
    startDate: campaign.startDate || "",
    endDate: campaign.endDate || "",
    goal,
    raised,
    contributors,
    daysLeft,
    remaining: Math.max(goal - raised, 0),
    progressPercent,
  };
};

const unwrapCampaigns = (data) => data?.data?.campaigns ?? data?.campaigns ?? data ?? [];

export const fetchCampaigns = async () => {
  const { data } = await api.get("/campaigns");
  const campaigns = unwrapCampaigns(data);
  return Array.isArray(campaigns) ? campaigns.map(normalizeCampaign) : [];
};

export const getCampaignDetails = async (campaignId) => {
  if (!campaignId) return null;

  const { data } = await api.get(`/campaigns/${campaignId}`);
  const payload = data?.data ?? data;
  const campaign = payload?.campaign ?? payload;
  const milestones = Array.isArray(payload?.milestones)
    ? payload.milestones.map(normalizeMilestone)
    : [];

  if (!campaign) return null;

  return {
    ...normalizeCampaign(campaign),
    milestones,
  };
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