import api from "./api";

export const submitDonation = (data) => api.post("/donations", data);
export const getDonationStatus = (transactionId) => api.get(`/donations/track/${transactionId}`);
export const getDonations = (params) => api.get("/donations", { params }); // admin

export const fetchAdminPendingDonations = () => api.get("/donations/pending-donation");
 
export const verifyDonationRequest = (donationId) =>
  api.post(`/donations/verify-donation/${donationId}`);
 
export const rejectDonationRequest = (donationId, verificationRemarks) =>
  api.post(`/donations/reject-donation/${donationId}`, { verificationRemarks });