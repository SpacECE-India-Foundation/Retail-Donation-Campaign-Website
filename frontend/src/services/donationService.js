import api from "./api";

export const submitDonation = (data) => api.post("/donations", data);
export const getDonationStatus = (transactionId) => api.get(`/donations/track/${transactionId}`);
export const getDonations = (params) => api.get("/donations", { params }); // admin
