import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Loader2,
  Share2,
  Target,
} from "lucide-react";
import { Button } from "../components/common/Button";
import CampaignOverview from "../components/common/donation/CampaignOverview";
import CampaignMilestones from "../components/common/donation/CampaignMilestones";
import DonationHeroBanner from "../components/common/donation/DonationHeroBanner";
import { calculateCampaignStats, getCampaignDetails } from "../services/campaignService";
import { formatINR } from "../utils/donationForm";

function formatDate(date) {
  if (!date) return "Not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function PageState({ type, title, message, onRetry }) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : Loader2;

  return (
    <div className="mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className={isError ? "mb-4 text-brand-danger" : "mb-4 text-brand-orange"}>
        <Icon size={32} className={isError ? "" : "animate-spin"} aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-bold text-brand-dark">{title}</h1>
      <p className="mt-2 text-sm text-brand-muted">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={onRetry}>
          Try Again
        </Button>
      )}
      {isError && (
        <Link to="/campaign" className="mt-4 text-sm font-semibold text-brand-orange hover:underline">
          Back to campaigns
        </Link>
      )}
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaign = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getCampaignDetails(id);
      setCampaign(data);
      if (!data) {
        setError("Campaign not found.");
      }
    } catch (err) {
      setCampaign(null);
      setError(err?.response?.data?.message || "Unable to load this campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const stats = useMemo(
    () => (campaign ? calculateCampaignStats(campaign) : null),
    [campaign],
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign?.campaignName || "Campaign",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      /* user cancelled share */
    }
  };

  if (isLoading) {
    return (
      <PageState
        title="Loading campaign"
        message="Fetching the latest campaign details."
      />
    );
  }

  if (error || !campaign) {
    return (
      <PageState
        type="error"
        title="Campaign unavailable"
        message={error || "This campaign could not be found."}
        onRetry={loadCampaign}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-16 sm:pb-20">
      <DonationHeroBanner
        campaign={campaign}
        stats={stats}
        onDonateClick={() => navigate(`/donate/${campaign.campaignId}`)}
        onShare={handleShare}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-10 sm:space-y-12 sm:px-6 lg:px-8">
        <nav
          aria-label="Campaign detail breadcrumb"
          className="flex flex-wrap items-center gap-1 text-sm text-brand-muted"
        >
          <Link to="/" className="transition-colors hover:text-brand-orange">
            Home
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/campaign" className="transition-colors hover:text-brand-orange">
            Campaigns
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="font-medium text-brand-dark">{campaign.campaignName}</span>
        </nav>

        <CampaignOverview stats={stats} />

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-border/70 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)] sm:p-6 lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-brand-dark">
              About This Campaign
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-muted sm:text-base">
              {campaign.description || "No description is available for this campaign."}
            </p>
          </div>

          <aside className="rounded-2xl border border-brand-border/70 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-brand-dark">
              Campaign Details
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Target size={17} className="mt-0.5 text-brand-orange" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-brand-dark">Target</dt>
                  <dd className="text-brand-muted">{formatINR(campaign.goal)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={17} className="mt-0.5 text-brand-orange" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-brand-dark">Timeline</dt>
                  <dd className="text-brand-muted">
                    {formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}
                  </dd>
                </div>
              </div>
              <div className="rounded-xl bg-brand-cream/70 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Status
                </dt>
                <dd className="mt-1 font-semibold text-brand-dark">
                  {campaign.status || "Not available"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 grid gap-3">
              <Button type="button" className="rounded-xl" onClick={() => navigate(`/donate/${campaign.campaignId}`)}>
                Donate to this campaign
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={handleShare}>
                <Share2 size={16} className="mr-2" aria-hidden="true" />
                Share
              </Button>
            </div>
          </aside>
        </section>

        <CampaignMilestones milestones={campaign.milestones ?? []} />
      </div>
    </div>
  );
}
