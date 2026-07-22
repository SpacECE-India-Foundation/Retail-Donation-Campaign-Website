import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { calculateCampaignStats, fetchCampaigns } from "../../services/campaignService";

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

  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto max-w-[800px] text-center">
        <p
          className="text-sm font-bold tracking-wide uppercase mb-2"
          style={{ color: "var(--color-brand-orange)" }}
        >
          Campaign Progress
        </p>
        <h2
          className="text-2xl lg:text-3xl font-bold mb-8"
          style={{
            color: "var(--color-brand-dark)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Help Us Reach Our Goal
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-600">
            <Loader2 size={18} className="animate-spin" style={{ color: "var(--color-brand-orange)" }} aria-hidden="true" />
            Loading campaign progress...
          </div>
        ) : error ? (
          <p className="py-6 text-sm text-gray-600">{error}</p>
        ) : !hasCampaigns ? (
          <p className="py-6 text-sm text-gray-600">
            No active campaigns to show progress for right now.
          </p>
        ) : (
          <>
            <div
              className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall fundraising progress"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percentage}%`,
                  background: "var(--color-brand-orange)",
                }}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-8">
              <span className="font-semibold" style={{ color: "var(--color-brand-dark)" }}>
                {`₹${stats.raised.toLocaleString("en-IN")} raised`}
              </span>
              <span>{`Goal: ₹${stats.goal.toLocaleString("en-IN")}`}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};