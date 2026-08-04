import api from "./api";

/**
 * Public donation routes — mounted at /api/public/donation
 * @see Donation_Drive_Backennd/routes/publicOperationRoutes/donations.routes.js
 */
const PUBLIC_DONATION_BASE = "/public/donation";
const SUBMIT_DONATION_ENDPOINT = `${PUBLIC_DONATION_BASE}/new-donation`;
// Real endpoint, confirmed against the current backend:
// routes/publicOperationRoutes/donations.routes.js:8 —
//   donationPublicRoutes.post('/scan-payment-screenshot', upload.single("paymentscreenshot"), scanPaymentScreenshot)
// Controller: controllers/publicDonations/donation.public.controller.js:25 (scanPaymentScreenshot).
const SCAN_SCREENSHOT_ENDPOINT = `${PUBLIC_DONATION_BASE}/scan-payment-screenshot`;

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
  formData.append("transactionId", frontendPayload.transactionId);
  formData.append("campaign", frontendPayload.campaignId);

  if (frontendPayload.paymentScreenshot instanceof File) {
    formData.append("paymentscreenshot", frontendPayload.paymentScreenshot);
    // registerDonation only re-runs its own OCR pass / auto-verification
    // (controllers/publicDonations/donation.public.controller.js:93,110,250-256)
    // when paymentMode === "UPI". Every screenshot that reaches this point
    // came through the V2 UPI self-service flow, so this is accurate, not
    // assumed — and without it, a donation that already passed OCR at Step 2
    // would silently never get auto-verified on submission.
    formData.append("paymentMode", "UPI");
  }

  return formData;
}

export const submitPublicDonation = (frontendPayload) =>
  api.post(SUBMIT_DONATION_ENDPOINT, buildDonationFormData(frontendPayload));

// ---- Payment Screenshot OCR scan (V2 donation flow, Step 2) ----
// Real request/response contract, confirmed against
// controllers/publicDonations/donation.public.controller.js:25-61:
//   - multipart/form-data, field name "paymentscreenshot" (matches the
//     route's multer config), plus a "paymentMode" field that must equal
//     "UPI" (case-insensitive) or the backend rejects with 400.
//   - Success (200) response shape:
//       { fields: { transactionId, amount, paymentDate } | null,
//         ocr: { attempted, confidence, canAutoVerify, reason },
//         requiresManualEntry: boolean }
//     `fields` is null when OCR couldn't reliably read the screenshot —
//     that's still a 200, not an error; requiresManualEntry tells the
//     caller to fall back to manual entry instead of treating it as a
//     failure.
//   - IMPORTANT: the backend does NOT return donorName or donorEmail —
//     the OCR service (services/paymentScreenshotOcr.service.js) only ever
//     extracts transactionId, amount, and paymentDate from the image. A UPI
//     screenshot has no reliable way to reveal the donor's own name/email,
//     so DonationForm keeps those two fields as normal editable inputs and
//     only ever auto-fills Transaction ID from this response.
//   - Failure responses (400/500) come back as
//       { statusCode, message, data: null, success: false, errors: [] }
//     via ApiError — e.g. 400 "A payment screenshot is required for OCR
//     scanning." or "OCR scanning is available only for UPI payments."
export const scanPaymentScreenshot = async ({ screenshot }) => {
  const formData = new FormData();
  if (screenshot instanceof File) {
    formData.append("paymentscreenshot", screenshot);
  }
  formData.append("paymentMode", "UPI");

  const response = await api.post(SCAN_SCREENSHOT_ENDPOINT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// params: optional { campaign, viewAll } — only meaningful for a Super Admin (viewAll=true
// to see every campaign's queue, or campaign=<id> to see one specific other admin's queue).
// Regular admins should keep calling this with no args, same as always.
export const fetchAdminPendingDonations = (params) =>
  api.get("/donations/pending-donation", { params });

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

// merged timeline of recent donation verifications/rejections + milestone completions,
// used by the admin dashboard's "Recent Activity" card
export const fetchRecentActivity = (limit = 8, extraParams = {}) =>
  api.get("/donations/recent-activity", { params: { limit, ...extraParams } });