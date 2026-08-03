import { createWorker } from "tesseract.js";
import { amountToPaise, normalizeTransactionId } from "../utils/bankTransaction.utils.js";

const MINIMUM_CONFIDENCE = 60;

const normalizeText = (text) =>
    text
        .replace(/\r/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
const firstMatch = (text, patterns) => {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) return match[1].trim();
    }
    return "";
};

const extractTransactionId = (text) => {

    const normalized = normalizeText(text);

    const patterns = [

        // PhonePe / GPay / Paytm / BHIM
        /(?:TRANSACTION\s*ID|TRANSACTION|TXN\s*ID|TXN|UTR(?:\s*(?:NO|NUMBER))?|UPI\s*REF(?:ERENCE)?(?:\s*(?:NO|NUMBER))?|REFERENCE(?:\s*(?:NO|NUMBER))?|RRN)\s*[:#-]?\s*([A-Z0-9_-]{6,50})/i,

        // Label on one line, value on next
        /(?:TRANSACTION\s*ID|UTR|UPI\s*REF(?:\s*NO)?)\s+([A-Z0-9_-]{6,50})/i,

    ];

    for (const pattern of patterns) {

        const match = normalized.match(pattern);

        if (match?.[1]) {

            const id = normalizeTransactionId(match[1]);

            if (/^[A-Z0-9_-]{6,50}$/.test(id)) {
                return id;
            }

        }

    }

    return "";
};

const extractAmount = (text) => {

    const normalized = normalizeText(text);

    const patterns = [

        // Amount label
        /(?:AMOUNT|AMOUNT\s*PAID|TOTAL\s*AMOUNT|PAID|TRANSFERRED|DEBITED)\s*(?:[:=-])?\s*(?:₹|RS\.?|INR|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,

        // Currency first
        /(?:₹|RS\.?|INR|\$)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,

        // PhonePe "Paid to Retail Donation Campaign 500.00"
        /PAID\s+TO.*?(?:₹|RS\.?|INR|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,

    ];

    for (const pattern of patterns) {

        const match = normalized.match(pattern);

        if (match?.[1]) {

            const paise = amountToPaise(match[1]);

            if (paise > 0) {
                return paise / 100;
            }

        }

    }

    // ---------- Fallback ----------
    // Find all decimal numbers and return the first reasonable payment amount.

    const candidates = normalized.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{2})\b/g);

    if (candidates) {

        for (const value of candidates) {

            const amount = Number(value.replace(/,/g, ""));

            if (amount > 0 && amount <= 10000000) {
                return amount;
            }

        }

    }

    return null;
};

const extractDate = (text) => {

    const normalized = normalizeText(text);

    const patterns = [

        /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,

        /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/,

    ];

    for (const pattern of patterns) {

        const match = normalized.match(pattern);

        if (!match) continue;

        const date = new Date(match[1]);

        if (!Number.isNaN(date.getTime())) {
            return date;
        }

    }

    return null;
};

class PaymentScreenshotOcrService {
    async scan(imageBuffer) {
        let worker;
        try {
            worker = await createWorker("eng", 1);
            const { data } = await worker.recognize(imageBuffer);
            const text = data.text || "";
            const transactionId = extractTransactionId(text);
            const amount = extractAmount(text);

            // just for debugging, remove later
            console.log("OCR Confidence:", data.confidence);
            console.log("Extracted Transaction ID:", transactionId);
            console.log("Extracted Amount:", amount);
            console.log("OCR Text:\n", text);

            return {
                performed: true,
                confidence: Math.round(data.confidence || 0),
                transactionId,
                amount,
                paymentDate: extractDate(text),
                canAutoVerify: Boolean(
                    transactionId && amount && (data.confidence || 0) >= MINIMUM_CONFIDENCE
                ),
                reason: transactionId && amount
                    ? ""
                    : "OCR could not reliably find both a transaction ID and amount.",
            };
        } catch (error) {
            return {
                performed: false,
                confidence: 0,
                transactionId: "",
                amount: null,
                paymentDate: null,
                canAutoVerify: false,
                reason: `OCR unavailable: ${String(error?.message || "unknown error").slice(0, 300)}`,
            };
        } finally {
            await worker?.terminate();
        }
    }

    evaluate({ extraction, transactionId, amount }) {
        if (!extraction.canAutoVerify) {
            return { verified: false, reason: extraction.reason };
        }

        const transactionMatches = normalizeTransactionId(extraction.transactionId)
            === normalizeTransactionId(transactionId);
        const amountMatches = amountToPaise(extraction.amount) === amountToPaise(amount);

        if (!transactionMatches || !amountMatches) {
            return {
                verified: false,
                reason: "OCR values do not match the submitted transaction ID and amount.",
            };
        }

        return { verified: true, reason: "OCR transaction ID and amount matched the donation." };
    }
}

export default new PaymentScreenshotOcrService();
