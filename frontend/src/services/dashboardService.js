import api from "./api";

export const getDashboardStats = () => api.get("/analytics/dashboard");
export const getDonationTrends = () => api.get("/analytics/donation-trends");
export const getLocationAnalysis = () => api.get("/analytics/location-analysis");
