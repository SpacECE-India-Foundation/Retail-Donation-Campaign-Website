export const normalizeTransactionId = (value) =>
    String(value ?? "")
        .normalize("NFKC")
        .replace(/\s+/g, "")
        .toUpperCase();

export const amountToPaise = (value) => {
    const numeric = typeof value === "number"
        ? value
        : Number(String(value ?? "").replace(/[\s,₹]/g, ""));

    if (!Number.isFinite(numeric) || numeric <= 0) {
        return null;
    }

    return Math.round((numeric + Number.EPSILON) * 100);
};

export const paiseToAmount = (paise) => paise / 100;
