import api from "./api";

export const getDashboardStats = () => api.get("/analytics/dashboard");
export const getDonationTrends = () => api.get("/analytics/donation-trends");
export const getLocationAnalysis = () => api.get("/analytics/location-analysis");

export const fetchAdminPendingDonations = () => api.get("/donations/pending-donation");
 
export const verifyDonationRequest = (donationId) =>
  api.post(`/donations/verify-donation/${donationId}`);
 
export const rejectDonationRequest = (donationId, verificationRemarks) =>
  api.post(`/donations/reject-donation/${donationId}`, { verificationRemarks });
 
// full paginated/filterable donation history — params: { page, limit, search, campaign, status, paymentMode, fromDate, toDate }
export const fetchDonations = (params) => api.get("/donations", { params });

