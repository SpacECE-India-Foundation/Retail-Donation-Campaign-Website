import api from "./api";

export const submitDonation = (data) => api.post("/donations", data);
export const getDonationStatus = (transactionId) => api.get(`/donations/track/${transactionId}`);
export const getDonations = (params) => api.get("/donations", { params }); // admin

// ---- Track Your Donations page ----

// POST /api/public/donation/donation-details
export const findDonationsByEmail = async (email) => {
  const response = await api.post("/public/donation/donation-details", {
    donorEmail: email,
  });
  return response.data.data.donations;
};

// PATCH /api/public/donation/re-donation/:donationId
// NOTE: backend route currently missing ":donationId" segment — confirm with Aditya
export const updateDonation = async (donationId, { transactionId, screenshotFile }) => {
  const formData = new FormData();
  formData.append("transactionId", transactionId);
  if (screenshotFile) {
    formData.append("paymentscreenshotEdited", screenshotFile);
  }

  const response = await api.patch(
    `/public/donation/re-donation/${donationId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.data;
};