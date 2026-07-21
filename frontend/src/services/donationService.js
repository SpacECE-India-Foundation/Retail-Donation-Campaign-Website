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

export const getDonationStatus = (transactionId) =>
  api.get(`${PUBLIC_DONATION_BASE}/track/${transactionId}`);

/** Admin-only — do not use on the public donate page */
export const getDonations = (params) =>
  api.get("/admin/donations", { params });
