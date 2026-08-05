import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Info,
  IndianRupee,
  Smartphone,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "../Button";
import FormField, { inputClass } from "./FormField";
import FormSection from "./FormSection";
import { AMOUNT_PRESETS } from "../../../utils/donationForm";
import { scanPaymentScreenshot } from "../../../services/donationService";
import { cn } from "../../../utils/cn";

/**
 * DonationForm — V2 self-service UPI flow + OCR screenshot scan.
 *
 * There's still no payment gateway integration. The donor pays the
 * organisation's UPI ID directly (real `upi://pay` deep link on mobile, or
 * QR/UPI ID/bank details on desktop), then uploads a screenshot of that
 * payment. `scanPaymentScreenshot` (services/donationService.js) calls the
 * real backend OCR endpoint (`POST /public/donation/scan-payment-screenshot`)
 * — no mock, no fallback.
 *
 * Current backend OCR contract (controllers/publicDonations/donation.public.controller.js:25-67,
 * services/paymentScreenshotOcr.service.js), re-verified against the latest
 * backend code:
 *   - Success (200) response shape:
 *       { fields: { transactionId, amount, paymentDate, senderName } | null,
 *         ocr: { attempted, confidence, canAutoVerify, senderName, isOutgoingTransfer, reason },
 *         requiresManualEntry: boolean }
 *     `fields` is null when OCR couldn't reliably read the screenshot — that's
 *     still a 200, not an error; `requiresManualEntry` tells the caller to
 *     fall back to manual entry instead of treating it as a failure.
 *   - There is NO `donorName` field anywhere in this response. The OCR
 *     service only ever extracts transactionId, amount, paymentDate, and
 *     `senderName` (read from a "From:" / "Paid by:" line on the screenshot,
 *     when present) — it never reads the donor's email at all.
 *   - Per Juhi's latest update: Transaction ID stays editable even when OCR
 *     reads it confidently — nothing on Step 3 is locked/read-only anymore.
 *     `senderName`, when present, is used only as a helpful starting value
 *     for Full Name; the donor can freely change it. Email always stays a
 *     normal editable input, since the backend has no email field to return.
 *   - `ocr.isOutgoingTransfer` (new boolean, services/paymentScreenshotOcr.service.js)
 *     is a read-only, server-computed signal — not a field the frontend ever
 *     sends, and not required by either /scan-payment-screenshot or
 *     /new-donation. It's not rendered or edited on Step 3; it only affects
 *     whether the backend's own `canAutoVerify`/auto-verification logic
 *     trusts the screenshot.
 *   - Failure responses (400/500) come back as
 *       { statusCode, message, data: null, success: false, errors: [] }
 *     via ApiError — e.g. 400 "A payment screenshot is required for OCR
 *     scanning." or "OCR scanning is available only for UPI payments."
 *
 * Step flow:
 *  1. Amount + Payment — mobile fires the real UPI intent and waits for
 *     "I Have Completed the Payment". Desktop has no confirmation click —
 *     "Donate Now" goes straight to step 2, which already contains the
 *     QR/bank details. Includes scroll-to-first-error on invalid submit and
 *     a disabled state on "Donate Now" until the amount step is valid.
 *  2. Verification — desktop shows the same QR/UPI ID/bank details card
 *     (plus a collapsible bank-transfer fallback) plus the screenshot
 *     upload area. Mobile shows just the upload area (payment was already
 *     confirmed in step 1). "Continue" calls the OCR scan, then opens a
 *     "Continue with Extracted Details?" confirmation dialog before
 *     advancing — Cancel keeps the donor on this step with nothing applied.
 *  3. Details + Submit — an AI-assisted-verification notice sits above the
 *     details form. Full Name, Email, and Transaction ID are all editable
 *     inputs. Transaction ID (and, when found, Full Name) get pre-filled
 *     from the OCR scan as a convenience, but the donor can edit any of them
 *     before submitting. Merged with the existing review + submit button.
 */

const STEPS = [
  { key: "amount", label: "Amount" },
  { key: "verify", label: "Verify" },
  { key: "details", label: "Details" },
];

const UPI_ID = import.meta.env.VITE_UPI_ID || "demo@upi";
const UPI_NAME = import.meta.env.VITE_UPI_NAME || "Demo Organisation";

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const ACCEPTED_SCREENSHOT_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function buildUpiLink(amount) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: String(amount || ""),
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}

function StepIndicator({ current }) {
  return (
    <div className="mb-8 flex items-center" aria-label={`Step ${current} of ${STEPS.length}`}>
      {STEPS.map((s, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={s.key} className={cn("flex items-center", stepNum < STEPS.length && "flex-1")}>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 sm:h-10 sm:w-10",
                  isDone
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                    : isActive
                      ? "bg-brand-orange text-white ring-4 ring-brand-orange/25 shadow-md shadow-brand-orange/30"
                      : "border-2 border-brand-border bg-white text-brand-muted",
                )}
              >
                {isDone ? <Check size={16} aria-hidden="true" /> : stepNum}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-bold uppercase tracking-wide sm:block",
                  isActive ? "text-brand-orange" : isDone ? "text-brand-dark" : "text-brand-muted",
                )}
              >
                {s.label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <span
                className={cn(
                  "mx-2 h-1 flex-1 rounded-full transition-colors duration-500 sm:mx-3",
                  isDone ? "bg-brand-orange" : "bg-brand-border",
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DonationForm({
  campaigns,
  formData,
  errors,
  submitError,
  isSubmitting,
  lockCampaign,
  onFieldChange,
  onSubmit,
  formRef,
}) {
  const [step, setStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  const [paymentPhase, setPaymentPhase] = useState("idle"); // 'idle' | 'active' — mobile only
  const [copied, setCopied] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const campaignFieldRef = useRef(null);
  const amountFieldRef = useRef(null);

  // ---- Screenshot OCR scan (Step 2) ----
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  // True until OCR confidently reads a Transaction ID. This no longer locks
  // any input — Transaction ID (and every other Step 3 field) stays
  // editable regardless — it only drives the helper copy shown above the
  // form so donors know whether to double-check a pre-filled value or type
  // it in from scratch.
  const [manualEntryRequired, setManualEntryRequired] = useState(true);

  // ---- "Continue with Extracted Details?" confirmation (Step 2 → Step 3) ----
  // The OCR result is held here, unapplied, until the donor explicitly
  // confirms — Cancel leaves Step 2 untouched (screenshot stays, nothing is
  // written to formData) so they can re-upload or just try Continue again.
  const [pendingOcrResult, setPendingOcrResult] = useState(null);
  const [showContinueConfirm, setShowContinueConfirm] = useState(false);

  // ---- "Stay Connected" opt-in prompt (auto-shown once on Step 3) ----
  // `notifyPromptShown` guards against re-showing it if the donor goes Back
  // to Step 2 and forward again — it's a one-time ask per form session, not
  // a gate on the flow (Step 3 renders normally underneath it either way).
  const [showNotifyPrompt, setShowNotifyPrompt] = useState(false);
  const [notifyPromptShown, setNotifyPromptShown] = useState(false);

  useEffect(() => {
    // Revoke the object URL when the file changes or the form unmounts.
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  useEffect(() => {
    if (!showContinueConfirm) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowContinueConfirm(false);
        setPendingOcrResult(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showContinueConfirm]);

  useEffect(() => {
    if (step === 3 && !notifyPromptShown) {
      setShowNotifyPrompt(true);
      setNotifyPromptShown(true);
    }
  }, [step, notifyPromptShown]);

  // Records the donor's choice (true = Yes, false = No) and closes the
  // popup — does not block or alter Step 3 in any other way. Field name
  // matches the backend's `notifyMe` (donation.public.controller.js:91).
  const handleNotifyChoice = (choice) => {
    onFieldChange("notifyMe", choice);
    setShowNotifyPrompt(false);
  };

  const fieldError = (name) => errors[name] || stepErrors[name];

  const handleCampaignChange = (event) => {
    const selectedId = event.target.value;
    const selected = campaigns.find((c) => c.campaignId === selectedId);
    onFieldChange("campaignId", selectedId);
    onFieldChange("campaignName", selected?.campaignName ?? "");
  };

  const selectAmount = (amount) => {
    onFieldChange("amount", String(amount));
  };

  const scrollToTop = () => {
    formRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Fix #2: scroll to the first invalid field instead of leaving the
  // error silently above/below the fold.
  const scrollToFirstError = (nextErrors) => {
    if (nextErrors.campaignId && campaignFieldRef.current) {
      campaignFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (nextErrors.amount && amountFieldRef.current) {
      amountFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const isCustomAmount =
    formData.amount !== "" && !AMOUNT_PRESETS.map(String).includes(String(formData.amount));

  const isAmountStepValid = Boolean(formData.campaignId) && Number(formData.amount) > 0;

  const validateAmountStep = () => {
    const nextErrors = {};
    if (!formData.campaignId) nextErrors.campaignId = "Please select a campaign to donate to.";
    const numericAmount = Number(formData.amount);
    if (!formData.amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }
    return nextErrors;
  };

  // Step 1: amount/campaign validated inline, then straight into payment —
  // mobile fires the UPI intent and waits for confirmation (unchanged);
  // desktop has no extra confirmation click, it goes directly to Step 2
  // where the QR/bank details card already lives.
  const handleDonateNow = () => {
    const nextErrors = validateAmountStep();
    if (Object.keys(nextErrors).length > 0) {
      setStepErrors(nextErrors);
      scrollToFirstError(nextErrors); // Fix #2
      return;
    }
    setStepErrors({});

    if (isMobile) {
      window.location.href = buildUpiLink(formData.amount);
      setPaymentPhase("active");
      return;
    }

    setStep(2);
    scrollToTop();
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Mobile-only: "I Have Completed the Payment" → advance to the
  // Verification step (screenshot upload only, no QR card needed here).
  const confirmPaymentDone = () => {
    setStep(2);
    scrollToTop();
  };

  const goBackToAmount = () => {
    setStepErrors({});
    setStep(1);
    scrollToTop();
  };

  const goBackToVerification = () => {
    setStep(2);
    scrollToTop();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    buildUpiLink(formData.amount),
  )}`;

  // ---- Screenshot upload handlers ----
  // Object URL revocation lives solely in the useEffect above (keyed off
  // screenshotPreview) — it fires on every change, including to null, so
  // there's no need to also revoke manually here.
  const applyScreenshotFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_SCREENSHOT_TYPES.includes(file.type)) {
      setVerifyError("Please upload a JPG, JPEG, or PNG file.");
      return;
    }
    setVerifyError("");
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (event) => {
    applyScreenshotFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    applyScreenshotFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Removing the screenshot resets the full verification state — not just
  // the file — so a stale error from a previous attempt doesn't linger.
  const clearScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setVerifyError("");
  };

  // Continue (Step 2) — calls the real OCR scan API only (no mock, no
  // fallback). On success, the result is held in `pendingOcrResult` and a
  // confirmation dialog opens ("Continue with Extracted Details?") — nothing
  // is written to formData and Step doesn't advance until the donor
  // explicitly confirms via `applyOcrResultAndContinue`.
  // Guarded against re-entrancy: `disabled={verifying}` on the button covers
  // the common case, but that's async (waits on a re-render), so a fast
  // double-click could otherwise slip a second request through — this
  // synchronous check closes that gap.
  const handleScanScreenshot = async () => {
    if (verifying) return;
    if (!screenshotFile) {
      setVerifyError("Please upload your payment screenshot to continue.");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    try {
      const result = await scanPaymentScreenshot({ screenshot: screenshotFile });
      setPendingOcrResult(result);
      setShowContinueConfirm(true);
    } catch (err) {
      setVerifyError(
        err?.response?.data?.message ||
          "We couldn't scan your payment screenshot. Please check the image and try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // Confirm-dialog "Continue": applies the OCR result to the editable Step 3
  // fields and advances. Pre-fills Step 3's Transaction ID from the response
  // when OCR read it confidently, and pre-fills Full Name from `senderName`
  // when the screenshot's "From/Paid by" line was readable — both stay
  // fully editable afterwards (Step 3 has no read-only fields). When OCR
  // can't read the screenshot confidently, `fields` is null (a valid 200,
  // not an error) and Step 3 starts blank for manual entry. Email is never
  // touched here — the backend has no field for it.
  const applyOcrResultAndContinue = () => {
    const extractedTransactionId = pendingOcrResult?.fields?.transactionId || "";
    const extractedSenderName =
      pendingOcrResult?.fields?.senderName || pendingOcrResult?.ocr?.senderName || "";

    onFieldChange("transactionId", extractedTransactionId);
    setManualEntryRequired(!extractedTransactionId);

    // Helpful starting value only — not authoritative, not locked. The
    // donor can change it on Step 3 like any other field.
    if (extractedSenderName) {
      onFieldChange("name", extractedSenderName);
    }

    onFieldChange("paymentScreenshot", screenshotFile);

    setShowContinueConfirm(false);
    setPendingOcrResult(null);
    setStep(3);
    scrollToTop();
  };

  // Confirm-dialog "Cancel": discard the OCR result and stay on Step 2 —
  // the screenshot is untouched so the donor can retry Continue, or remove
  // and re-upload a different screenshot.
  const cancelContinueConfirm = () => {
    setShowContinueConfirm(false);
    setPendingOcrResult(null);
  };

  return (
    <section
      ref={formRef}
      className="animate-fade-in-up scroll-mt-28 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(26,26,26,0.12)] sm:p-8 lg:p-10"
    >
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
          Donation Details
        </h2>
        <p className="mt-2 text-sm text-brand-muted sm:text-base">
          A few quick steps — all fields marked with * are required.
        </p>
      </div>

      <StepIndicator current={step} />

      {submitError && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 transition-all duration-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-brand-danger" aria-hidden="true" />
          <p className="text-sm text-brand-danger">{submitError}</p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6 sm:space-y-8">
        {/* ============ Step 1 — Amount + Payment ============ */}
        {step === 1 && (
          <div className="animate-fade-in-up space-y-6 sm:space-y-8">
            <div ref={campaignFieldRef}>
              <FormSection title="Campaign" description="Choose the campaign you want to support.">
                <FormField id="campaign" label="Campaign" required error={fieldError("campaignId")}>
                  {({ id, errorId, hasError }) => (
                    <select
                      id={id}
                      value={formData.campaignId}
                      onChange={handleCampaignChange}
                      disabled={lockCampaign}
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      className={cn(inputClass(hasError), lockCampaign && "opacity-70")}
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.campaignId} value={campaign.campaignId}>
                          {campaign.campaignName}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
                {lockCampaign && formData.campaignName && (
                  <p className="-mt-2 rounded-lg bg-brand-teal/5 px-3 py-2 text-xs text-brand-teal">
                    Campaign pre-selected from your link.
                  </p>
                )}
              </FormSection>
            </div>

            <div ref={amountFieldRef}>
              <FormSection title="Donation Amount" description="Pick a suggested amount or enter your own.">
                <FormField id="amount" label="Amount (INR)" required error={fieldError("amount")}>
                  {({ id, errorId, hasError }) => (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {AMOUNT_PRESETS.map((preset) => {
                          const isSelected = String(formData.amount) === String(preset);
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => selectAmount(preset)}
                              className={cn(
                                "rounded-2xl border-2 py-4 text-center text-base font-extrabold transition-all duration-300",
                                "hover:-translate-y-0.5 hover:border-brand-orange hover:bg-brand-orange/5 hover:shadow-md",
                                "active:scale-[0.98]",
                                isSelected
                                  ? "border-brand-orange bg-brand-orange text-white shadow-lg shadow-brand-orange/25 ring-2 ring-brand-orange/20"
                                  : "border-brand-border bg-white text-brand-dark",
                              )}
                            >
                              ₹{preset.toLocaleString("en-IN")}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3" aria-hidden="true">
                        <span className="h-px flex-1 bg-brand-border" />
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                          Or enter a custom amount
                        </span>
                        <span className="h-px flex-1 bg-brand-border" />
                      </div>

                      <div className="relative">
                        <IndianRupee
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                          aria-hidden="true"
                        />
                        <input
                          id={id}
                          type="number"
                          min="1"
                          value={formData.amount}
                          onChange={(e) => onFieldChange("amount", e.target.value)}
                          placeholder="Enter amount"
                          aria-invalid={hasError}
                          aria-describedby={errorId}
                          className={cn(
                            inputClass(hasError),
                            "pl-10",
                            isCustomAmount && "border-brand-orange ring-2 ring-brand-orange/20",
                          )}
                        />
                      </div>
                    </div>
                  )}
                </FormField>
              </FormSection>
            </div>

            {/* Fix #5: Amount to Pay card now visually highlighted */}
            <div className="overflow-hidden rounded-2xl border-2 border-brand-orange/25 bg-gradient-to-br from-brand-orange/[0.06] via-brand-cream/40 to-brand-orange/[0.03] p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange/80">
                  Amount to pay
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold text-brand-dark">
                  ₹{formData.amount ? Number(formData.amount).toLocaleString("en-IN") : "0"}
                </p>
              </div>

              {paymentPhase === "idle" && (
                <div className="animate-fade-in-up mt-6 flex flex-col items-center">
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleDonateNow}
                    disabled={!isAmountStepValid}
                    className={cn(
                      "w-full gap-2 rounded-xl shadow-md sm:w-auto sm:px-12",
                      isAmountStepValid
                        ? "shadow-brand-orange/20"
                        : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-70 shadow-none hover:translate-y-0 hover:shadow-none",
                    )}
                  >
                    Donate Now
                  </Button>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-brand-muted">
                    <Info size={13} aria-hidden="true" />
                    Demo UPI details — production account connects in the next phase.
                  </p>
                </div>
              )}

              {/* Mobile-only: fires the UPI intent, then waits for explicit
                  confirmation before moving on. */}
              {paymentPhase === "active" && isMobile && (
                <div className="animate-fade-in-up mt-6 flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <Smartphone size={26} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-brand-dark">
                    Opening your UPI app…
                  </p>
                  <button
                    type="button"
                    onClick={handleDonateNow}
                    className="mt-2 text-xs font-semibold text-brand-orange underline-offset-2 hover:underline"
                  >
                    App didn't open? Tap to try again
                  </button>

                  <Button
                    type="button"
                    size="lg"
                    onClick={confirmPaymentDone}
                    className="mt-6 w-full gap-2 rounded-xl shadow-md shadow-brand-orange/20 sm:w-auto sm:px-12"
                  >
                    I Have Completed the Payment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ Step 2 — Verification ============ */}
        {step === 2 && (
          <div className="animate-fade-in-up space-y-6">
            {/* Desktop-only: the same QR + UPI ID + bank details card,
                opens directly (no extra confirmation click) instead of
                gating behind one. */}
            {!isMobile && (
              <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-cream/40 p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                    Amount to pay
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-brand-dark">
                    ₹{formData.amount ? Number(formData.amount).toLocaleString("en-IN") : "0"}
                  </p>
                </div>

                <div className="animate-fade-in-up mt-6 flex flex-col items-center">
                  <div className="overflow-hidden rounded-xl border border-brand-border bg-white p-3">
                    <img
                      src={qrImageUrl}
                      alt="Scan to pay via UPI (demo)"
                      className="h-44 w-44 rounded-md object-contain sm:h-48 sm:w-48"
                    />
                  </div>
                  <p className="mt-3 text-xs text-brand-muted">Scan with any UPI app</p>

                  <div className="mt-5 flex w-full max-w-xs items-center justify-between gap-3 rounded-xl border border-brand-border bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                        UPI ID
                      </p>
                      <p className="truncate text-sm font-bold text-brand-dark">{UPI_ID}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-orange/10 px-3 py-2 text-xs font-semibold text-brand-orange transition-colors duration-200 hover:bg-brand-orange/15"
                    >
                      {copied ? (
                        <>
                          <CheckCheck size={13} aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Fix #3: bank transfer fallback for donors without UPI
                      access. Replace with real account details before launch. */}
                  <details className="mt-4 w-full max-w-xs rounded-xl border border-brand-border bg-white px-4 py-3 text-left">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-dark">
                      Prefer a bank transfer instead?
                    </summary>
                    <div className="mt-3 space-y-1 text-xs text-brand-muted">
                      <p>Account Name: {UPI_NAME}</p>
                      <p>Account Number: XXXXXXXXXX (add real value)</p>
                      <p>IFSC: XXXXXXXX (add real value)</p>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* ---------------- Payment Screenshot Verification ---------------- */}
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
                Payment Verification
              </h3>
              <p className="mt-2 text-sm text-brand-muted sm:text-base">
                Upload your payment screenshot to verify your transaction before submitting your donation.
              </p>
            </div>

            {verifyError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-brand-danger/30 bg-brand-danger/5 px-4 py-3"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-brand-danger" aria-hidden="true" />
                <p className="text-sm text-brand-danger">{verifyError}</p>
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-300",
                isDragging ? "border-brand-orange bg-brand-orange/5" : "border-brand-border bg-brand-cream/30",
              )}
            >
              {screenshotPreview ? (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot preview"
                    className="max-h-48 rounded-xl border border-brand-border object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearScreenshot}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-brand-border bg-white text-brand-dark shadow-md transition-colors duration-200 hover:border-brand-danger hover:text-brand-danger"
                    aria-label="Remove screenshot"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <UploadCloud size={22} aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-brand-dark">Drag &amp; drop your screenshot here</p>
                  <p className="text-xs text-brand-muted">Supported formats: JPG, JPEG, PNG</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:border-brand-orange hover:text-brand-orange">
                    Choose File
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-brand-border/60 pt-6">
              <button
                type="button"
                onClick={goBackToAmount}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:text-brand-orange"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
              <Button
                type="button"
                size="lg"
                isLoading={verifying}
                disabled={!screenshotFile || verifying}
                onClick={handleScanScreenshot}
                className="gap-2 rounded-xl px-8 shadow-md shadow-brand-orange/20 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/30"
              >
                Continue
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* ============ Step 3 — Details + Submit ============ */}
        {step === 3 && (
          <div className="animate-fade-in-up space-y-6">
            {/* AI/OCR notice — sits above the OCR result/details section so
                donors know to double-check anything that was auto-filled. */}
            <div className="flex items-start gap-3 rounded-xl border border-brand-teal/25 bg-brand-teal/5 px-4 py-3.5">
              <Info size={18} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-brand-teal">AI-assisted Payment Verification</p>
                <p className="mt-1 text-sm text-brand-dark/80">
                  Our OCR system automatically extracts payment details from your uploaded screenshot to
                  speed up the donation process. Since this feature is still being improved, OCR results
                  may occasionally be inaccurate. Please carefully review and edit all extracted
                  information before submitting your donation.
                </p>
              </div>
            </div>

            <FormSection
              title="Your Details"
              description={
                manualEntryRequired
                  ? "We couldn't automatically read your Transaction ID — please enter your details below."
                  : "We've pre-filled some details from your screenshot — feel free to edit anything before submitting."
              }
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField id="name" label="Full Name" required error={fieldError("name")}>
                  {({ id, errorId, hasError }) => (
                    <input
                      id={id}
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => onFieldChange("name", e.target.value)}
                      placeholder="Your full name"
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      className={inputClass(hasError)}
                    />
                  )}
                </FormField>

                <FormField id="email" label="Email Address" required error={fieldError("email")}>
                  {({ id, errorId, hasError }) => (
                    <input
                      id={id}
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => onFieldChange("email", e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      className={inputClass(hasError)}
                    />
                  )}
                </FormField>
              </div>

              <FormField
                id="transactionId"
                label="Transaction ID (UTR)"
                required
                error={fieldError("transactionId")}
              >
                {({ id, errorId, hasError }) => (
                  <input
                    id={id}
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => onFieldChange("transactionId", e.target.value)}
                    placeholder="From your UPI app's payment confirmation"
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                    className={inputClass(hasError)}
                  />
                )}
              </FormField>

              <div className="border-t border-brand-border/60 pt-5">
                <button
                  type="button"
                  onClick={() => setShowOptional((v) => !v)}
                  aria-expanded={showOptional}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-brand-dark"
                >
                  Add phone, address or a message (optional)
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-300", showOptional && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>

                {showOptional && (
                  <div className="animate-fade-in-up mt-5 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <FormField id="phone" label="Phone Number" error={fieldError("phone")}>
                        {({ id, errorId, hasError }) => (
                          <input
                            id={id}
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              onFieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                            placeholder="10-digit mobile number"
                            aria-invalid={hasError}
                            aria-describedby={errorId}
                            className={inputClass(hasError)}
                          />
                        )}
                      </FormField>

                      <FormField id="address" label="Address" error={fieldError("address")}>
                        {({ id, errorId, hasError }) => (
                          <textarea
                            id={id}
                            rows={2}
                            autoComplete="street-address"
                            value={formData.address}
                            onChange={(e) => onFieldChange("address", e.target.value)}
                            placeholder="Street, city, state, PIN code"
                            aria-invalid={hasError}
                            aria-describedby={errorId}
                            className={cn(inputClass(hasError), "resize-none")}
                          />
                        )}
                      </FormField>
                    </div>

                    <FormField id="message" label="Message">
                      {({ id }) => (
                        <textarea
                          id={id}
                          rows={3}
                          value={formData.message}
                          onChange={(e) => onFieldChange("message", e.target.value)}
                          placeholder="Share a message of support (optional)"
                          maxLength={500}
                          className={cn(inputClass(false), "resize-none")}
                        />
                      )}
                    </FormField>
                  </div>
                )}
              </div>
            </FormSection>

            <div className="rounded-2xl border border-brand-border/70 bg-brand-cream/30 p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-muted">
                Review your donation
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-brand-muted">Campaign</dt>
                  <dd className="text-right font-semibold text-brand-dark">{formData.campaignName || "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-brand-muted">Amount</dt>
                  <dd className="text-right font-bold text-brand-orange">
                    {formData.amount ? `₹${Number(formData.amount).toLocaleString("en-IN")}` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-brand-muted">Donor</dt>
                  <dd className="text-right font-semibold text-brand-dark">{formData.name || "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-brand-muted">Transaction ID</dt>
                  <dd className="text-right font-mono font-semibold text-brand-dark">
                    {formData.transactionId || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center justify-between border-t border-brand-border/60 pt-6">
              <button
                type="button"
                onClick={goBackToVerification}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:text-brand-orange"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="flex-1 rounded-xl py-4 text-base shadow-lg shadow-brand-orange/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-brand-orange/30 sm:flex-none sm:px-12"
              >
                Submit Donation
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* "Continue with Extracted Details?" confirmation — gates Step 2 → 3.
          Cancel keeps the donor on Step 2 with nothing applied; Continue
          hands off to applyOcrResultAndContinue. */}
      {showContinueConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancelContinueConfirm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="continue-confirm-title"
            aria-describedby="continue-confirm-desc"
            className="w-full max-w-md rounded-2xl border border-brand-border/60 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <Info size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 id="continue-confirm-title" className="font-display text-lg font-bold text-brand-dark">
                  Continue with Extracted Details?
                </h3>
                <p id="continue-confirm-desc" className="mt-2 text-sm text-brand-muted">
                  Our AI system has extracted payment details from your screenshot. Please note that OCR
                  is still under improvement and may occasionally produce incorrect information. You will
                  be able to review and edit all details before submitting your donation.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelContinueConfirm}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:text-brand-orange"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={applyOcrResultAndContinue}
                className="rounded-xl px-6 shadow-md shadow-brand-orange/20"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* "Stay Connected" opt-in — auto-shown once on reaching Step 3.
          Purely informational/preference collection: Step 3 renders normally
          underneath it, and either button just records the choice and
          closes the popup — nothing else in the flow is gated on it. */}
      {showNotifyPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stay-connected-title"
            aria-describedby="stay-connected-desc"
            className="w-full max-w-md rounded-2xl border border-brand-border/60 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Bell size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 id="stay-connected-title" className="font-display text-lg font-bold text-brand-dark">
                  Stay Connected
                </h3>
                <p id="stay-connected-desc" className="mt-2 text-sm text-brand-muted">
                  Would you like to be notified about our future campaigns and learn about the impact
                  your donation has made?
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => handleNotifyChoice(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:text-brand-orange"
              >
                No, Thanks
              </button>
              <Button
                type="button"
                onClick={() => handleNotifyChoice(true)}
                className="rounded-xl px-6 shadow-md shadow-brand-orange/20"
              >
                Yes, Notify Me
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
