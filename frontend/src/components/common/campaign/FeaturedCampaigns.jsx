import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Inbox, Loader2, Sparkles } from "lucide-react";
import { fetchCampaigns } from "../../../services/campaignService";
import { CampaignListingCard } from "./CampaignListingCard";
import { cn } from "../../../utils/cn";

const FEATURED_COUNT = 3;

// Real campaigns only — there's no "featured" flag on the campaign model yet,
// so "featured" here means the most recent Active campaigns (falling back to
// any campaign if none are Active), taken straight from fetchCampaigns().
export default function FeaturedCampaigns() {
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

  return (
    <section className="relative px-4 py-20 sm:px-8 sm:py-24">
      <div className="relative mx-auto mb-12 max-w-2xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md"
          style={{ background: "rgba(255,255,255,0.55)", color: "var(--color-brand-teal)", border: "1px solid rgba(255,255,255,0.6)" }}
        >
          <Sparkles size={14} aria-hidden="true" />
          Where Your Support Goes
        </div>

        <h2
          className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
          style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
        >
          Featured{" "}
          <span
            className="italic"
            style={{
              backgroundImage: "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Campaigns
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-gray-600 sm:text-lg">
          Real campaigns, real progress — see exactly where your contribution goes.
        </p>
      </div>

      {isLoading ? (
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 rounded-[28px] border border-brand-border/60 bg-white/60 py-16">
          <Loader2 className="animate-spin text-brand-orange" size={22} aria-hidden="true" />
          <span className="text-sm font-semibold text-brand-muted">Loading campaigns…</span>
        </div>
      ) : error ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[28px] border border-dashed border-brand-border bg-white/60 py-14 text-center">
          <AlertCircle className="mb-3 text-brand-danger" size={22} aria-hidden="true" />
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      ) : featured.length === 0 ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[28px] border border-dashed border-brand-border bg-white/60 py-14 text-center">
          <Inbox className="mb-3 text-brand-orange" size={22} aria-hidden="true" />
          <p className="text-sm text-brand-muted">No campaigns are open for support right now.</p>
        </div>
      ) : (
        <>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((campaign, index) => (
              <div
                key={campaign.campaignId}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <CampaignListingCard campaign={campaign} onNavigate={navigate} />
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate("/campaign")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-brand-dark",
                "transition-all duration-300 hover:-translate-y-0.5 hover:text-brand-orange"
              )}
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(26,26,26,0.08)" }}
            >
              View all campaigns
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
