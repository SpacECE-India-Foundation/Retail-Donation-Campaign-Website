import api from "./api";

export const getCampaignProgress = () => api.get("/campaigns/progress");
