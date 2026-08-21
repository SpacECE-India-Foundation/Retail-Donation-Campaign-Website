import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, IndianRupee, Target, ArrowRight } from "lucide-react";
import { calculateCampaignStats, fetchCampaigns } from "../../services/campaignService";

const RADIUS = 85;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CampaignProgress = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCampaigns = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchCampaigns();
        if (isMounted) setCampaigns(data);
      } catch (err) {
        if (isMounted) {
          setCampaigns([]);
          setError(err?.response?.data?.message || "Unable to load campaign progress right now.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = calculateCampaignStats(campaigns);
  const percentage = Math.min(stats.progressPercent, 100);
  const hasCampaigns = !isLoading && !error && campaigns.length > 0;
  const dashOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <section className="w-full px-6 py-16 lg:py-24" style={{ background: "#FFF8F2" }}>
      <div
        className="relative mx-auto flex min-h-[380px] items-center overflow-hidden rounded-[2.5rem] p-8 shadow-2xl lg:min-h-[460px] lg:p-16"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-dark), #1f3d3a)" }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--color-brand-orange)", opacity: 0.25 }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "var(--color-brand-teal)", opacity: 0.3 }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-[960px] flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="text-center lg:text-left">
            <p
              className="mb-3 text-base font-bold uppercase tracking-wide"
              style={{ color: "var(--color-brand-orange)" }}
            >
              Campaign progress
            </p>
            <h2
              className="mb-6 text-3xl font-bold text-white lg:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Help us reach our goal
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-white/80 lg:justify-start">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Loading campaign progress...
              </div>
            ) : error ? (
              <p className="py-6 text-sm text-white/80">{error}</p>
            ) : !hasCampaigns ? (
              <p className="py-6 text-sm text-white/80">
                No active campaigns to show progress for right now.
              </p>
            ) : (
              <>
                <div className="mb-10 flex justify-center gap-4 lg:justify-start">
                  <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                      <IndianRupee size={20} aria-hidden="true" />
                    </span>
                    <div className="text-left">
                      <p className="text-xs text-white/60">Raised</p>
                      <p className="text-lg font-bold text-white lg:text-xl">₹{stats.raised.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                      <Target size={20} aria-hidden="true" />
                    </span>
                    <div className="text-left">
                      <p className="text-xs text-white/60">Goal</p>
                      <p className="text-lg font-bold text-white lg:text-xl">₹{stats.goal.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/campaign"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-lg font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{ color: "var(--color-brand-dark)" }}
                >
                  View all campaigns
                  <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          {hasCampaigns && (
            <div className="relative flex h-52 w-52 shrink-0 items-center justify-center lg:h-60 lg:w-60">
              <svg width="100%" height="100%" viewBox="0 0 208 208" className="-rotate-90">
                <circle cx="104" cy="104" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
                <circle
                  cx="104"
                  cy="104"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--color-brand-orange)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 700ms ease" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="text-5xl font-bold text-white lg:text-6xl"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {percentage}%
                </span>
                <span className="mt-1.5 text-sm text-white/60">funded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};