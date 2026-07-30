import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { fetchCampaigns } from "../../services/campaignService";
import { formatINR } from "../../utils/donationForm";
import { Button } from "../common/Button";
import { cn } from "../../utils/cn";

const FEATURED_COUNT = 3;

function CampaignShowcaseRow({ campaign, reversed, onDonate }) {
  const progress = Math.min(campaign.progressPercent ?? 0, 100);

  return (
    <article
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24",
        reversed && "lg:[&>*:first-child]:order-2",
      )}
    >
      <div className="overflow-hidden rounded-[22px] shadow-[0_20px_60px_-24px_rgba(31,41,55,0.18)]">
        {campaign.banner ? (
          <img
            src={campaign.banner}
            alt=""
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#F8F4EE] text-[#6B7280]">
            No image available
          </div>
        )}
      </div>

      <div className="max-w-xl">
        {campaign.category && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
            {campaign.category}
          </p>
        )}

        <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#1F2937] sm:text-4xl">
          {campaign.campaignName}
        </h3>

        <p className="mt-5 text-base leading-relaxed text-[#6B7280] sm:text-lg">
          {campaign.shortDescription || campaign.description}
        </p>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Raised
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#1F2937]">
              {formatINR(campaign.raised)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              Goal
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1F2937]">
              {formatINR(campaign.goal)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Progress</span>
            <span className="font-semibold text-[#E8741A]">{progress}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#ECE6DD]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${campaign.campaignName} fundraising progress`}
          >
            <div
              className="h-full rounded-full bg-[#E8741A] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          className="mt-8 rounded-full px-8 shadow-[0_8px_24px_-8px_rgba(232,116,26,0.45)] transition-all duration-300 hover:-translate-y-0.5"
          onClick={() => onDonate(campaign.campaignId)}
        >
          Donate Now
          <ArrowRight size={16} className="ml-2" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

export default function SolutionCampaignShowcase() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchCampaigns()
      .then((data) => {
        if (!cancelled) setCampaigns(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Unable to load campaigns right now.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const active = campaigns.filter((c) => c.status === "Active");
  const featured = (active.length ? active : campaigns).slice(0, FEATURED_COUNT);

  const handleDonate = (campaignId) => {
    navigate(`/donate/${campaignId}`);
  };

  return (
    <section className="bg-[#F8F4EE] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
            Where Your Support Goes
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#1F2937] sm:text-5xl">
            Featured Campaigns
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#6B7280] sm:text-lg">
            Real campaigns, real progress — see exactly where your contribution goes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <Loader2 className="animate-spin text-[#E8741A]" size={22} aria-hidden="true" />
            <span className="text-sm font-medium text-[#6B7280]">Loading campaigns…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <AlertCircle className="mb-3 text-red-500" size={22} aria-hidden="true" />
            <p className="text-sm text-[#6B7280]">{error}</p>
          </div>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Inbox className="mb-3 text-[#E8741A]" size={22} aria-hidden="true" />
            <p className="text-sm text-[#6B7280]">
              No campaigns are open for support right now.
            </p>
          </div>
        ) : (
          <div className="space-y-24 sm:space-y-32">
            {featured.map((campaign, index) => (
              <CampaignShowcaseRow
                key={campaign.campaignId}
                campaign={campaign}
                reversed={index % 2 === 1}
                onDonate={handleDonate}
              />
            ))}

            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/campaign")}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:text-[#E8741A]"
              >
                View all campaigns
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
