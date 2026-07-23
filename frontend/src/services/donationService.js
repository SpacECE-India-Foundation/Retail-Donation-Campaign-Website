import api from "./api";

/**
 * Public donation routes — mounted at /api/public/donation
 * @see Donation_Drive_Backennd/routes/publicOperationRoutes/donations.routes.js
 */
const PUBLIC_DONATION_BASE = "/public/donation";
const SUBMIT_DONATION_ENDPOINT = `${PUBLIC_DONATION_BASE}/new-donation`;

function buildDonationFormData(frontendPayload) {
  const formData = new FormData();

  formData.append("donorName", frontendPayload.name);
  formData.append("donorEmail", frontendPayload.email);
  if (frontendPayload.phone) {
    formData.append("donorPhone", frontendPayload.phone);
  }
  if (frontendPayload.address) {
    formData.append("address", frontendPayload.address);
  }
  formData.append("donorMessage", frontendPayload.message || "");
  formData.append("amount", String(frontendPayload.amount));
  formData.append("paymentMode", frontendPayload.paymentMode);
  formData.append("transactionId", frontendPayload.transactionId);
  formData.append("campaign", frontendPayload.campaignId);

  if (frontendPayload.paymentScreenshot instanceof File) {
    formData.append("paymentscreenshot", frontendPayload.paymentScreenshot);
  }

  return formData;
}

export const submitPublicDonation = (frontendPayload) =>
  api.post(SUBMIT_DONATION_ENDPOINT, buildDonationFormData(frontendPayload));

export const fetchAdminPendingDonations = () =>
  api.get("/donations/pending-donation");

export const verifyDonationRequest = (donationId) =>
  api.post(`/donations/verify-donation/${donationId}`);

export const rejectDonationRequest = (donationId, verificationRemarks) =>
  api.post(`/donations/reject-donation/${donationId}`, { verificationRemarks });

export const fetchDonations = (params) => api.get("/donations/fetch-donations", { params });

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