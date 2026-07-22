import { useState } from "react";
import {
  AlertCircle,
  Upload,
  X,
  IndianRupee,
  ImagePlus,
} from "lucide-react";
import { Button } from "../Button";
import FormField, { inputClass } from "./FormField";
import FormSection from "./FormSection";
import { AMOUNT_PRESETS, PAYMENT_MODES } from "../../../data/donation.mock";
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
                disabled={lockCampaign}
                aria-invalid={hasError}
                aria-describedby={errorId}
                className={cn(
                  inputClass(hasError),
                  lockCampaign && "cursor-not-allowed bg-brand-cream/50 opacity-80",
                )}
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
              Campaign pre-selected from your link — no need to choose again.
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
