export const normalizeTransactionId = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

// Store and compare INR values as paise so that reconciliation never depends
// on JavaScript floating-point equality.
export const amountToPaise = (value) => {
  const numeric = typeof value === "number"
    ? value
    : Number(String(value ?? "").replace(/[,\s₹]/g, ""));

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.round((numeric + Number.EPSILON) * 100);
};
