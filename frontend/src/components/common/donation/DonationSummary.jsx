import { Shield, Receipt, Lock, User, Mail, Phone, MapPin, Hash, Image } from "lucide-react";
import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

function SummaryRow({ icon: Icon, label, value, highlight, filled }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition-all duration-300",
        filled ? "bg-brand-cream/80" : "bg-transparent",
      )}
    >
      <dt className="flex items-center gap-2 text-sm text-brand-muted">
        {Icon && <Icon size={14} className="shrink-0" aria-hidden="true" />}
        {label}
      </dt>
      <dd
        className={cn(
          "max-w-[55%] text-right text-sm font-semibold transition-colors duration-300",
          highlight ? "text-brand-orange" : "text-brand-dark",
          !filled && "text-brand-muted/70",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export default function DonationSummary({ formData, campaign, stats, className }) {
  const {
    campaignName = "",
    name = "",
    email = "",
    phone = "",
    address = "",
    amount = "",
    paymentMode = "",
    transactionId = "",
    paymentScreenshot = null,
    message = "",
  } = formData ?? {};

  const displayAmount =
    amount && Number(amount) > 0 ? formatINR(Number(amount)) : "—";

  const filledFields = [
    campaignName,
    name,
    email,
    amount,
    paymentMode,
    transactionId,
    paymentScreenshot,
  ].filter(Boolean).length;

  const progressPercent = Math.round((filledFields / 7) * 100);

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-brand-border/80 bg-white shadow-[0_8px_30px_-12px_rgba(26,26,26,0.12)]",
        "transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(26,26,26,0.18)] lg:sticky lg:top-24",
        className,
      )}
    >
      {campaign && stats && (
        <div className="relative flex items-center gap-3 border-b border-brand-border/70 bg-brand-cream/50 p-4 sm:p-5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm">
            <img
              src={campaign.banner}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-brand-orange">
              {campaign.category}
            </p>
            <h4 className="truncate font-display text-base font-bold leading-snug text-brand-dark">
              {campaign.campaignName}
            </h4>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-border/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-hover transition-all duration-700"
                  style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-bold text-brand-orange">
                {stats.progressPercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-display text-xl font-bold tracking-tight text-brand-dark">
          Donation Summary
        </h3>
        <p className="mt-1 text-sm text-brand-muted">
          Updates live as you fill the form
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium">
          <span className="text-brand-muted">Form completion</span>
          <span className="text-brand-orange">{progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-hover transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <dl className="space-y-1 divide-y divide-brand-border/50">
        <SummaryRow
          icon={null}
          label="Campaign"
          value={campaignName || "Not selected"}
          filled={Boolean(campaignName)}
        />
        <SummaryRow
          icon={User}
          label="Donor"
          value={name || "—"}
          filled={Boolean(name)}
        />
        <SummaryRow
          icon={Mail}
          label="Email"
          value={email || "—"}
          filled={Boolean(email)}
        />
        {phone && (
          <SummaryRow icon={Phone} label="Phone" value={phone} filled />
        )}
        {address && (
          <SummaryRow icon={MapPin} label="Address" value={address} filled />
        )}
        <SummaryRow
          icon={null}
          label="Amount"
          value={displayAmount}
          highlight
          filled={Boolean(amount && Number(amount) > 0)}
        />
        <SummaryRow
          icon={null}
          label="Payment Mode"
          value={paymentMode || "Not selected"}
          filled={Boolean(paymentMode)}
        />
        <SummaryRow
          icon={Hash}
          label="Transaction ID"
          value={transactionId || "—"}
          filled={Boolean(transactionId)}
        />
        <SummaryRow
          icon={Image}
          label="Screenshot"
          value={paymentScreenshot ? "Uploaded" : "Pending"}
          filled={Boolean(paymentScreenshot)}
        />
        {message && (
          <SummaryRow icon={null} label="Message" value={message} filled />
        )}
      </dl>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-brand-success/10 px-4 py-3 transition-all duration-300 hover:bg-brand-success/15">
          <Shield size={18} className="shrink-0 text-brand-success" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-brand-dark">Secure Payment</p>
            <p className="text-xs text-brand-muted">Your data is encrypted & protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-brand-teal/10 px-4 py-3 transition-all duration-300 hover:bg-brand-teal/15">
          <Receipt size={18} className="shrink-0 text-brand-teal" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-brand-dark">80G Tax Benefit</p>
            <p className="text-xs text-brand-muted">Eligible for tax exemption certificate</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-1 text-xs text-brand-muted">
          <Lock size={12} aria-hidden="true" />
          <span>Verified within 48 hours of submission</span>
        </div>
      </div>
      </div>
    </aside>
  );
}
