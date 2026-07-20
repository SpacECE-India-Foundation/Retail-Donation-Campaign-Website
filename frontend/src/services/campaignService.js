import api from "./api";

export const getCampaignProgress = () => api.get("/campaigns/progress");

export const fetchAdminCampaigns = () => api.get("/admin/campaign/admin-campaigns");