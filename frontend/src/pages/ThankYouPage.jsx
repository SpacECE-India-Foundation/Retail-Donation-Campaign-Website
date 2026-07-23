import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { formatINR } from "../utils/donationForm";

export default function ThankYouPage() {
  const location = useLocation();
  const donation = location.state?.donation;

  const whatsappText = donation
    ? encodeURIComponent(
        `I just donated ${formatINR(donation.amount)} to ${donation.campaignName}! Join me in supporting this cause.`,
      )
    : encodeURIComponent("I just made a donation to SpaceECE India Foundation!");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-brand-border bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/10">
          <CheckCircle2 size={32} className="text-brand-success" aria-hidden="true" />
        </div>

        <h1 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl">
          Thank You for Your Donation!
        </h1>
        <p className="mt-2 text-base text-brand-muted">
          Your contribution has been received and is being verified. You will
          receive a confirmation email shortly.
        </p>

        {donation && (
          <div className="mt-6 rounded-xl border border-brand-border bg-brand-cream/50 p-4 text-left text-sm">
            <p className="mb-2 text-brand-dark">
              <span className="font-medium text-brand-muted">Campaign: </span>
              {donation.campaignName}
            </p>
            <p className="mb-2 text-brand-dark">
              <span className="font-medium text-brand-muted">Amount: </span>
              <span className="font-bold text-brand-orange">
                {formatINR(donation.amount)}
              </span>
            </p>
            <p className="mb-2 text-brand-dark">
              <span className="font-medium text-brand-muted">Status: </span>
              Pending verification
            </p>
            <p className="text-brand-dark">
              <span className="font-medium text-brand-muted">Transaction ID: </span>
              {donation.transactionId}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            disabled
            className="w-full rounded-xl opacity-60"
          >
            Download Certificate (available after verification)
          </Button>
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 w-full items-center justify-center rounded-xl border-2 border-brand-orange bg-transparent text-base font-bold text-brand-orange transition-all hover:scale-[1.01] hover:bg-brand-orange/5"
          >
            Share on WhatsApp
          </a>
          <Link to="/donate">
            <Button type="button" variant="ghost" className="w-full rounded-xl">
              Make Another Donation
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-brand-muted">
          Verification and certificate dispatch are usually completed within 48 hours.
        </p>
      </div>
    </div>
  );
}
