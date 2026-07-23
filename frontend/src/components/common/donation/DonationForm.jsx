import { useState } from "react";
import {
  AlertCircle,
  Upload,
  X,
  IndianRupee,
  ImagePlus,
  Wallet,
  ShieldCheck,
  Smartphone,
  User,
  Landmark,
  Hash,
  KeyRound,
  Info,
  Copy,
} from "lucide-react";
import { Button } from "../Button";
import FormField, { inputClass } from "./FormField";
import FormSection from "./FormSection";
import { AMOUNT_PRESETS, PAYMENT_MODES } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const applyFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    onFieldChange("paymentScreenshot", file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event) => {
    applyFile(event.target.files?.[0] ?? null);
  };

  const clearFile = () => {
    onFieldChange("paymentScreenshot", null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleCampaignChange = (event) => {
    const selectedId = event.target.value;
    const selected = campaigns.find((c) => c.campaignId === selectedId);
    onFieldChange("campaignId", selectedId);
    onFieldChange("campaignName", selected?.campaignName ?? "");
  };

  const selectAmount = (amount) => {
    onFieldChange("amount", String(amount));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <section
      ref={formRef}
      className="animate-fade-in-up scroll-mt-28 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(26,26,26,0.12)] sm:p-8 lg:p-10"
    >
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
          Donation Details
        </h2>
        <p className="mt-2 text-sm text-brand-muted sm:text-base">
          All fields marked with * are required.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-xl border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 transition-all duration-300"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-brand-danger"
            aria-hidden="true"
          />
          <p className="text-sm text-brand-danger">{submitError}</p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6 sm:space-y-8">
        <FormSection
          title="Campaign"
          description="Choose the campaign you want to support."
        >
          <FormField
            id="campaign"
            label="Campaign"
            required
            error={errors.campaignId}
          >
            {({ id, errorId, hasError }) => (
              <select
                id={id}
                value={formData.campaignId}
                onChange={handleCampaignChange}
                aria-invalid={hasError}
                aria-describedby={errorId}
                className={inputClass(hasError)}
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
              Campaign pre-selected from your link — you can change it below if needed.
            </p>
          )}
        </FormSection>

        <FormSection
          title="Donor Information"
          description="Tell us who is making this contribution."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField id="name" label="Full Name" required error={errors.name}>
              {({ id, errorId, hasError }) => (
                <input
                  id={id}
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  placeholder="Your full name"
                  aria-invalid={hasError}
                  aria-describedby={errorId}
                  className={inputClass(hasError)}
                />
              )}
            </FormField>

            <FormField id="email" label="Email" required error={errors.email}>
              {({ id, errorId, hasError }) => (
                <input
                  id={id}
                  type="email"
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

          <div className="grid gap-5 lg:grid-cols-2">
            <FormField id="phone" label="Phone Number (Optional)" error={errors.phone}>
              {({ id, errorId, hasError }) => (
                <input
                  id={id}
                  type="tel"
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

            <FormField id="address" label="Address (Optional)" error={errors.address}>
              {({ id, errorId, hasError }) => (
                <textarea
                  id={id}
                  rows={2}
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
        </FormSection>

        <FormSection
          title="Payment Details"
          description="Enter your payment information and upload proof of transfer."
        >
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <FormField id="amount" label="Donation Amount (INR)" required error={errors.amount}>
              {({ id, errorId, hasError }) => (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {AMOUNT_PRESETS.map((preset) => {
                      const isSelected = String(formData.amount) === String(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => selectAmount(preset)}
                          className={cn(
                            "rounded-xl border-2 py-3 text-sm font-bold transition-all duration-300",
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
                      placeholder="Or enter a custom amount"
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      className={cn(inputClass(hasError), "pl-10")}
                    />
                  </div>
                </div>
              )}
            </FormField>

            <FormField id="paymentMode" label="Payment Mode" required error={errors.paymentMode}>
              {({ id, errorId, hasError }) => (
                <select
                  id={id}
                  value={formData.paymentMode}
                  onChange={(e) => onFieldChange("paymentMode", e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={errorId}
                  className={inputClass(hasError)}
                >
                  <option value="">Select payment mode</option>
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>

          {/* Organisation Payment Details */}
          <div className="rounded-2xl border border-brand-border/60 bg-brand-cream/40 p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Wallet size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-brand-dark sm:text-lg">
                    Organisation Payment Details
                  </h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Complete your payment using the QR code or bank details
                    below.
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-brand-teal/20 bg-brand-teal/5 px-3 py-1.5 text-xs font-semibold text-brand-teal">
                <ShieldCheck size={14} aria-hidden="true" />
                Secure Payment
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
              {/* QR Card */}
              <div className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col items-center gap-3 p-6">
                  <div className="overflow-hidden rounded-xl border border-brand-border bg-white p-3 transition-colors duration-300 group-hover:border-brand-orange/40">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SpaceECE%20Foundation%20Donation%20Demo"
                      alt="Demo QR code for organisation payment"
                      className="h-40 w-40 rounded-md object-contain sm:h-48 sm:w-48"
                    />
                  </div>
                  <p className="text-center text-base font-bold uppercase tracking-wide text-brand-orange">
                    Scan &amp; Pay
                  </p>
                  <p className="text-center text-xs text-brand-muted">
                    Demo QR (Will be replaced with organisation QR)
                  </p>
                </div>
                <div className="flex items-start gap-2.5 border-t border-brand-border/60 bg-brand-cream/40 px-5 py-4">
                  <Smartphone
                    size={16}
                    className="mt-0.5 shrink-0 text-brand-orange"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-brand-dark">
                    Scan this QR code using any UPI app to make the payment.
                  </span>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
                <dl className="divide-y divide-brand-border/60">
                  {[
                    { label: "Account Holder", value: "SpaceECE Foundation", icon: User },
                    { label: "Bank Name", value: "State Bank of India", icon: Landmark },
                    { label: "Account Number", value: "1234567890123456", icon: Hash },
                    { label: "IFSC", value: "SBIN0001234", icon: KeyRound },
                    { label: "UPI ID", value: "spaceece@sbi", icon: Smartphone },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                          <row.icon size={15} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <dt className="text-xs text-brand-muted">{row.label}</dt>
                          <dd className="truncate text-sm font-semibold text-brand-dark">
                            {row.value}
                          </dd>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 text-brand-muted transition-colors duration-200 hover:bg-brand-orange/10 hover:text-brand-orange"
                        aria-label={`Copy ${row.label}`}
                      >
                        <Copy size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Info banner */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3.5">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-brand-orange"
                aria-hidden="true"
              />
              <p className="text-sm text-brand-dark">
                This is a temporary payment section for frontend development.
                Actual organisation payment details and QR code will be
                connected later.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <FormField
              id="transactionId"
              label="Transaction ID"
              required
              error={errors.transactionId}
            >
              {({ id, errorId, hasError }) => (
                <input
                  id={id}
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => onFieldChange("transactionId", e.target.value)}
                  placeholder="UPI / bank reference number"
                  aria-invalid={hasError}
                  aria-describedby={errorId}
                  className={inputClass(hasError)}
                />
              )}
            </FormField>

            <FormField
              id="screenshot"
              label="Payment Screenshot Upload"
              required
              error={errors.paymentScreenshot}
            >
              {({ id, errorId, hasError }) => (
                <div className="h-full">
                  {!previewUrl ? (
                    <label
                      htmlFor={id}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "group flex h-full min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition-all duration-300 lg:min-h-[132px]",
                        "hover:border-brand-orange hover:bg-brand-orange/5",
                        isDragging
                          ? "scale-[1.01] border-brand-orange bg-brand-orange/10 shadow-inner"
                          : "bg-white",
                        hasError ? "border-brand-danger bg-brand-danger/5" : "border-brand-border",
                      )}
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                    >
                      <div
                        className={cn(
                          "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                          "bg-brand-orange/10 text-brand-orange group-hover:scale-110 group-hover:bg-brand-orange/15",
                          isDragging && "scale-110 bg-brand-orange/20",
                        )}
                      >
                        {isDragging ? (
                          <ImagePlus size={24} aria-hidden="true" />
                        ) : (
                          <Upload size={24} aria-hidden="true" />
                        )}
                      </div>
                      <span className="text-center text-sm font-semibold text-brand-dark">
                        {isDragging ? "Drop your screenshot here" : "Drag & drop or click to upload"}
                      </span>
                      <span className="mt-1.5 text-center text-xs text-brand-muted">
                        PNG, JPG or WEBP · up to 5 MB
                      </span>
                      <input
                        id={id}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="group relative h-full min-h-[132px] overflow-hidden rounded-2xl border border-brand-border shadow-md transition-all duration-300 hover:shadow-lg">
                      <img
                        src={previewUrl}
                        alt="Payment screenshot preview"
                        className="h-full min-h-[132px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute right-3 top-3 rounded-full bg-brand-dark/80 p-2 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-brand-dark"
                        aria-label="Remove screenshot"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Additional Information"
          description="Share an optional message of support with the team."
        >
          <FormField id="message" label="Message (Optional)">
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
        </FormSection>

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full rounded-xl py-4 text-base shadow-lg shadow-brand-orange/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-brand-orange/30"
        >
          Submit Donation
        </Button>
      </form>
    </section>
  );
}
