export const MAX_DONATION_AMOUNT = 10000000;
export const AMOUNT_PRESETS = [500, 1000, 2500, 5000];
export const PAYMENT_MODES = ["UPI", "Bank Transfer"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const TRANSACTION_ID_REGEX = /^[A-Za-z0-9_-]{6,50}$/;

export const INITIAL_FORM_STATE = {
  campaignId: "",
  campaignName: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  amount: "",
  paymentMode: "",
  transactionId: "",
  paymentScreenshot: null,
  message: "",
};

export function createInitialFormState() {
  return { ...INITIAL_FORM_STATE };
}

export const validateDonationForm = validateForm;

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validateForm(formData, campaigns = []) {
  const errors = {};
  const trimmedName = formData.name.trim();
  const trimmedEmail = formData.email.trim();
  const trimmedPhone = formData.phone.trim();
  const trimmedAddress = formData.address.trim();
  const trimmedTransactionId = formData.transactionId.trim();
  const numericAmount = Number(formData.amount);

  if (!formData.campaignId) {
    errors.campaignId = "Please select a campaign to donate to.";
  } else if (
    campaigns.length > 0 &&
    !campaigns.some((c) => c.campaignId === formData.campaignId)
  ) {
    errors.campaignId = "Please select a valid campaign.";
  }

  if (!trimmedName || trimmedName.length < 2) {
    errors.name = "Enter your full name (min 2 characters).";
  }

  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone.replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (trimmedAddress && trimmedAddress.length < 5) {
    errors.address = "If provided, address must be at least 5 characters.";
  }

  if (formData.amount === "" || formData.amount === null) {
    errors.amount = "Donation amount is required.";
  } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  } else if (numericAmount > MAX_DONATION_AMOUNT) {
    errors.amount = `Amount cannot exceed ${formatINR(MAX_DONATION_AMOUNT)}.`;
  }

  if (!formData.paymentMode) {
    errors.paymentMode = "Select a payment mode.";
  } else if (!PAYMENT_MODES.includes(formData.paymentMode)) {
    errors.paymentMode = "Select a valid payment mode.";
  }

  if (!trimmedTransactionId) {
    errors.transactionId = "Transaction ID is required.";
  } else if (!TRANSACTION_ID_REGEX.test(trimmedTransactionId)) {
    errors.transactionId =
      "Transaction ID must be 6–50 characters (letters, numbers, - or _).";
  }

  if (!formData.paymentScreenshot) {
    errors.paymentScreenshot = "Payment screenshot is required.";
  }

  return errors;
}

export function preparePayload(formData) {
  return {
    campaignId: formData.campaignId,
    campaignName: formData.campaignName,
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim().replace(/\s/g, ""),
    address: formData.address.trim(),
    amount: Number(formData.amount),
    paymentMode: formData.paymentMode,
    transactionId: formData.transactionId.trim(),
    paymentScreenshot: formData.paymentScreenshot,
    message: formData.message.trim(),
  };
}

/**
 * Maps frontend payload to backend API shape when submitting.
 */
export function toApiPayload(payload) {
  return {
    donorName: payload.name,
    donorEmail: payload.email,
    donorPhone: payload.phone,
    address: payload.address,
    donorMessage: payload.message,
    amount: payload.amount,
    paymentMode: payload.paymentMode,
    transactionId: payload.transactionId,
    paymentDate: new Date().toISOString(),
    campaign: payload.campaignId,
    screenshot: payload.paymentScreenshot,
  };
}

export function parseBackendError(error) {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const message = responseData?.message || responseData?.error || "";
  const normalized = String(message).toLowerCase();

  const isDuplicateTransaction =
    status === 409 ||
    normalized.includes("transactionid") ||
    normalized.includes("transaction id") ||
    normalized.includes("duplicate") ||
    normalized.includes("already been used") ||
    normalized.includes("already exists");

  if (isDuplicateTransaction) {
    return "This Transaction ID has already been used.";
  }

  const isCooldown =
    status === 429 ||
    normalized.includes("cooldown") ||
    normalized.includes("5 minute") ||
    normalized.includes("five minute") ||
    normalized.includes("wait before donating");

  if (isCooldown) {
    return "You can donate again to this campaign after 5 minutes.";
  }

  if (status === 400) {
    return "Please check your donation details and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on our end. Please try again shortly.";
  }

  if (!error?.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  return "Unable to submit your donation. Please try again.";
}

export async function handleSubmit(formData, submitFn, campaigns = []) {
  const validationErrors = validateForm(formData, campaigns);

  if (Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors, error: null };
  }

  const payload = preparePayload(formData);

  try {
    await submitFn(payload);
    return { success: true, payload, errors: {}, error: null };
  } catch (err) {
    return {
      success: false,
      errors: {},
      error: parseBackendError(err),
    };
  }
}
