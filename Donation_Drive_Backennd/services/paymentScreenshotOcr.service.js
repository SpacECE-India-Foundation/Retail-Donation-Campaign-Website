import { createWorker } from "tesseract.js";
import { amountToPaise, normalizeTransactionId } from "../utils/bankTransaction.utils.js";

const MINIMUM_CONFIDENCE = 60;

const normalizeText = (text) =>
    text
        .replace(/\r/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const parseNumberWords = (text) => {
    const normalized = normalizeText(text).toLowerCase();
    const words = normalized.replace(/[^a-z\s]/g, " ").trim();
    const smallNumbers = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,
        hundred: 100,
        thousand: 1000,
        lakh: 100000,
        crore: 10000000,
    };

    const tokens = words.split(/\s+/).filter(Boolean);
    if (!tokens.length) return null;

    let total = 0;
    let current = 0;

    for (const token of tokens) {
        if (token === "and") continue;
        if (smallNumbers[token] !== undefined) {
            const value = smallNumbers[token];
            if (value >= 100) {
                current = current ? current * value : value;
            } else {
                current += value;
            }
        } else if (token === "point") {
            break;
        } else {
            return null;
        }
    }

    if (current) {
        total += current;
    }

    return total > 0 ? total : null;
};

const extractReferenceValue = (value) => {
    const tokens = normalizeText(value)
        .split(/\s+/)
        .map((token) => token.replace(/[^A-Z0-9_-]/gi, ""))
        .filter(Boolean);

    if (!tokens.length) {
        return "";
    }

    const stopWords = new Set(["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "AM", "PM"]);
    const collected = [];

    for (const token of tokens) {
        const upperToken = token.toUpperCase();
        if (
            stopWords.has(upperToken)
            || /^(19|20)\d{0,2}$/.test(upperToken)
            || /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i.test(upperToken)
        ) {
            break;
        }

        if (/^[A-Z0-9_-]{1,50}$/i.test(token)) {
            collected.push(token);
            continue;
        }

        break;
    }

    return collected.join("").trim();
};

const extractUtr = (text) => {
    const normalized = normalizeText(text);

    const patterns = [
        /(?:UTR(?:\s*(?:NO|NUMBER))?|UPI\s*REF(?:ERENCE)?(?:\s*\.?(?:\s*NO|\s*NUMBER|\s*ID))?|UPI\s*TRANSACTION\s*ID|UPI\s*TXN\s*ID|REFERENCE(?:\s*(?:NO|NUMBER|ID))?|REF(?:ERENCE)?(?:\s*(?:NO|NUMBER|ID))?|BANK\s*TRANSACTION\s*ID|BANK\s*REF(?:ERENCE)?(?:\s*(?:NO|NUMBER|ID))?|RRN)\s*[:#-]?\s*([A-Z0-9_-]+(?:\s+[A-Z0-9_-]+)*)/i,
        /(?:UTR|UPI\s*REF(?:ERENCE)?|REFERENCE|REF(?:ERENCE)?|BANK\s*REF(?:ERENCE)?|BANK\s*TRANSACTION\s*ID)\s+([A-Z0-9_-]+(?:\s+[A-Z0-9_-]+)*)/i,
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match?.[1]) {
            const value = extractReferenceValue(match[1]);
            if (value) {
                const id = normalizeTransactionId(value);
                if (/^[A-Z0-9_-]{3,50}$/.test(id)) {
                    return id;
                }
            }
        }
    }

    return "";
};

const cleanSenderNameCandidate = (value) => {
    const cleaned = String(value || "").trim();
    if (!cleaned) {
        return "";
    }

    const stopPatterns = [
        /\bPhonePe\b/i,
        /\bTransaction\s*ID\b/i,
        /\bUPI\b/i,
        /\bRef\b/i,
        /\bTo:\b/i,
        /\bFrom:\b/i,
    ];

    let candidate = cleaned;
    for (const pattern of stopPatterns) {
        const parts = candidate.split(pattern);
        if (parts.length > 1) {
            candidate = parts[0].trim();
            break;
        }
    }

    return candidate.replace(/[|:;]+$/g, "").trim();
};

const extractSenderName = (text) => {
    const lines = String(text || "").replace(/\r/g, "").split(/\n/);
    const patterns = [
        /^(?:FROM|SENDER|PAID\s*BY|TRANSFER\s*FROM|PAYMENT\s*FROM)\s*[:#-]?\s*(.+)$/i,
        /^(?:SENT\s*BY)\s*[:#-]?\s*(.+)$/i,
    ];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        for (const pattern of patterns) {
            const match = trimmedLine.match(pattern);
            if (match?.[1]) {
                return cleanSenderNameCandidate(match[1]);
            }
        }
    }

    const normalized = normalizeText(text);
    const fallback = normalized.match(/(?:FROM|SENDER|PAID\s*BY|TRANSFER\s*FROM|PAYMENT\s*FROM)\s*[:#-]?\s*([A-Z][A-Za-z0-9 .'-]{2,50})/i);

    return fallback?.[1] ? cleanSenderNameCandidate(fallback[1]) : "";
};

const isLikelyOutgoingTransfer = (text) => {
    const normalized = normalizeText(text).toLowerCase();

    const outgoingPatterns = [
        /\bpaid\b/i,
        /\bsent\b/i,
        /\btransfer(?:red)?\b/i,
        /\bdebited\b/i,
        /\bpay(?:ment)?\b/i,
        /\bto\b/i,
    ];
    const incomingPatterns = [
        /\breceived\b/i,
        /\bcredited\b/i,
        /\bdeposited\b/i,
        /\badded\b/i,
        /\bcash received\b/i,
        /\bmoney received\b/i,
    ];

    const hasOutgoing = outgoingPatterns.some((pattern) => pattern.test(normalized));
    const hasIncoming = incomingPatterns.some((pattern) => pattern.test(normalized));

    if (hasIncoming && !hasOutgoing) {
        return false;
    }

    return hasOutgoing;
};

const extractAmount = (text) => {
    const normalized = normalizeText(text);

    const patterns = [
        /(?:AMOUNT|AMOUNT\s*PAID|TOTAL\s*AMOUNT|PAID|TRANSFERRED|DEBITED)\s*(?:[:=-])?\s*(?:₹|RS\.?|INR|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
        /(?:₹|RS\.?|INR|\$)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
        /PAID\s+TO.*?(?:₹|RS\.?|INR|\$)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
        /(?:RUPEES?|RS\.?|INR)\s+([A-Za-z\s]+?)(?=\s+ONLY\b|$)/i,
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match?.[1]) {
            const rawValue = match[1].trim();
            const numericValue = Number(rawValue.replace(/,/g, ""));
            if (Number.isFinite(numericValue) && numericValue > 0) {
                return numericValue;
            }

            const parsedWords = parseNumberWords(rawValue);
            if (parsedWords) {
                return parsedWords;
            }

            const paise = amountToPaise(rawValue);
            if (paise > 0) {
                return paise / 100;
            }
        }
    }

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
            const passResults = [];
            const firstPass = await worker.recognize(imageBuffer, { rotateAuto: true });
            passResults.push(firstPass.data);
            const secondPass = await worker.recognize(imageBuffer);
            passResults.push(secondPass.data);

            const combinedText = passResults
                .map((result) => result.text || "")
                .filter(Boolean)
                .join("\n");
            const bestResult = passResults.reduce((best, result) => {
                const confidence = result.confidence || 0;
                return confidence > best.confidence ? { text: result.text || "", confidence } : best;
            }, { text: "", confidence: 0 });

            const utr = extractUtr(combinedText);
            const amount = extractAmount(combinedText);
            const senderName = extractSenderName(combinedText);
            const isOutgoingTransfer = isLikelyOutgoingTransfer(combinedText);
            const confidence = Math.round(bestResult.confidence || 0);

            //just for debugging, remove later
            console.log("OCR pass results:", passResults.map((result) => ({ confidence: result.confidence || 0, text: (result.text || "").slice(0, 300) })));
            console.log("OCR extracted UTR:", utr); //just for debugging, remove later
            console.log("OCR extracted sender name:", senderName); //just for debugging, remove later
            console.log("OCR extracted amount:", amount); //just for debugging, remove later
            console.log("OCR text:\n", combinedText); //just for debugging, remove later

            return {
                performed: true,
                confidence,
                transactionId: utr,
                amount,
                senderName,
                isOutgoingTransfer,
                paymentDate: extractDate(combinedText),
                canAutoVerify: Boolean(
                    utr && amount && isOutgoingTransfer && confidence >= MINIMUM_CONFIDENCE
                ),
                reason: utr && amount && isOutgoingTransfer
                    ? ""
                    : "OCR could not reliably find a valid outgoing UTR, amount, and transfer direction.",
            };
        } catch (error) {
            return {
                performed: false,
                confidence: 0,
                transactionId: "",
                amount: null,
                senderName: "",
                isOutgoingTransfer: false,
                paymentDate: null,
                canAutoVerify: false,
                reason: `OCR unavailable: ${String(error?.message || "unknown error").slice(0, 300)}`,
            };
        } finally {
            await worker?.terminate();
        }
    }

    evaluate({ extraction, transactionId, amount, senderName }) {
        if (!extraction.canAutoVerify) {
            return { verified: false, reason: extraction.reason };
        }

        const extractedUtr = normalizeTransactionId(extraction.transactionId);
        const submittedUtr = normalizeTransactionId(transactionId);
        const transactionMatches = Boolean(extractedUtr && submittedUtr && extractedUtr === submittedUtr);
        const amountMatches = amountToPaise(extraction.amount) === amountToPaise(amount);
        const senderMatches = !senderName || !extraction.senderName || normalizeText(extraction.senderName).toLowerCase() === normalizeText(senderName).toLowerCase();

        if (!transactionMatches || !amountMatches || !senderMatches || !extraction.isOutgoingTransfer) {
            return {
                verified: false,
                reason: "OCR values do not match the submitted UTR, amount, or transfer direction.",
            };
        }

        return { verified: true, reason: "OCR UTR and amount matched the donation and the screenshot looks like a genuine outgoing payment." };
    }
}

export default new PaymentScreenshotOcrService();
