import { useState, useRef } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Info,
  IndianRupee,
  Smartphone,
} from "lucide-react";
import { Button } from "../Button";
import FormField, { inputClass } from "./FormField";
import FormSection from "./FormSection";
import { AMOUNT_PRESETS } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

const STEPS = [
  { key: "amount", label: "Amount" },
  { key: "details", label: "Details" },
  { key: "submit", label: "Submit" },
];

const UPI_ID = import.meta.env.VITE_UPI_ID || "demo@upi";
const UPI_NAME = import.meta.env.VITE_UPI_NAME || "Demo Organisation";

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
  const [paymentPhase, setPaymentPhase] = useState("idle");
  const [copied, setCopied] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const campaignFieldRef = useRef(null);
  const amountFieldRef = useRef(null);

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

  const validateDetailsStep = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedTxn = formData.transactionId.trim();
    if (!trimmedName || trimmedName.length < 2) {
      nextErrors.name = "Enter your full name (min 2 characters).";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!trimmedTxn) {
      nextErrors.transactionId = "Enter the UTR / transaction ID from your UPI app.";
    } else if (!/^[A-Za-z0-9_-]{6,50}$/.test(trimmedTxn)) {
      nextErrors.transactionId = "Transaction ID must be 6–50 characters (letters, numbers, - or _).";
    }
    if (formData.phone.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    return nextErrors;
  };

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
    }
    setPaymentPhase("active");
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

  const confirmPaymentDone = () => {
    setStep(2);
    scrollToTop();
  };

  const goBackToAmount = () => {
    setStepErrors({});
    setStep(1);
    scrollToTop();
  };

  const goFromDetailsToSubmit = () => {
    const nextErrors = validateDetailsStep();
    if (Object.keys(nextErrors).length > 0) {
      setStepErrors(nextErrors);
      return;
    }
    setStepErrors({});
    setStep(3);
    scrollToTop();
  };

  const goBackFromSubmit = () => {
    setStep(2);
    scrollToTop();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    buildUpiLink(formData.amount),
  )}`;

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

              {paymentPhase === "active" && !isMobile && (
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

                  {/* Fix #3 placeholder: bank transfer fallback for donors
                      without UPI access. Replace with real account details
                      before launch. */}
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

                  <Button
                    type="button"
                    size="lg"
                    onClick={confirmPaymentDone}
                    className="mt-6 w-full gap-2 rounded-xl shadow-md shadow-brand-orange/20 sm:w-auto sm:px-12"
                  >
                    I Have Completed Payment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <FormSection title="Your Details" description="Tell us who is making this contribution.">
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
                onClick={goFromDetailsToSubmit}
                className="gap-2 rounded-xl px-8 shadow-md shadow-brand-orange/20 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/30"
              >
                Continue
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up space-y-6">
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
                onClick={goBackFromSubmit}
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
    </section>
  );
}