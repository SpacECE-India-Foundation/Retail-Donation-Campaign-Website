import React, { useCallback, useEffect, useState } from "react";

// Home page section: a slow, continuously-moving band of the latest
// donations — no clicking through pages, it just keeps drifting and
// refreshes itself in the background.
//
// Card styling matches the site's established solid-card language (see
// VisionMission.jsx / StatsStrip.jsx): white cards, thin gray-100 border,
// soft shadow that lifts on hover, tinted rounded-2xl icon badge, Playfair
// Display for the headline figure — no glassmorphism or blurred glow blobs.
const ENDPOINT = `${import.meta.env.VITE_API_URL}/public/donation/fetch-donationwall`;
const POLL_INTERVAL_MS = 30000; // re-check for new donations every 30s
const TICKER_LIMIT = 15;

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

async function fetchLatestDonations(limit) {
  const params = new URLSearchParams({ page: 1, limit });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Donation ticker request failed (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

// Horizontal chip layout instead of the earlier tall stat-card — reads
// better as a moving strip. Icon badge is a solid gradient fill (the same
// treatment as the numbered step icons in HowItWorks.jsx), not a flat
// tinted circle, so it has a bit more visual weight while still sitting on
// the established rounded-3xl/border-gray-100/shadow-sm card base.
function TickerItem({ donation, index }) {
  const isTeal = index % 2 === 1;
  const gradient = isTeal
    ? "linear-gradient(135deg, var(--color-brand-teal), #0d3f3b)"
    : "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))";
  const glow = isTeal ? "rgba(20,148,140,0.35)" : "rgba(230,126,34,0.35)";
  const name = donation.donorName?.trim() || "A generous donor";

  return (
    <div className="group mx-3 flex w-[300px] shrink-0 items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[340px]">
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ring-2 ring-white transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundImage: gradient,
          fontFamily: "'Playfair Display', serif",
          boxShadow: `0 8px 18px -6px ${glow}`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
        <p
          className="mt-0.5 truncate text-xl font-bold leading-tight"
          style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
        >
          {formatINR(donation.amount)}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {donation.campaign?.campaignName ? `to ${donation.campaign.campaignName}` : "General donation"}
        </p>
      </div>
    </div>
  );
}

export default function DonationTicker({ setStatistics }) {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchLatestDonations(TICKER_LIMIT)
      .then((data) => {
        setDonations(data.donations);
        setError(null);
        if (setStatistics) setStatistics(data.statistics);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [setStatistics]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return null;

  if (error) {
    return (
      <div className="py-6 text-center text-sm text-red-500" style={{ background: "#FFF8F2" }}>
        Couldn&apos;t load recent donations: {error}
      </div>
    );
  }

  if (!donations.length) return null;

  // Split the latest donations across two lanes (alternating) so the two
  // rows don't just show identical copies of each other — top lane drifts
  // left, bottom lane drifts right, each looped independently.
  const rowTop = donations.filter((_, i) => i % 2 === 0);
  const rowBottom = donations.filter((_, i) => i % 2 === 1);
  const loopTop = rowTop.length ? [...rowTop, ...rowTop] : [];
  const loopBottom = rowBottom.length ? [...rowBottom, ...rowBottom] : [];

  return (
    <section className="w-full px-6 py-16 lg:py-20" style={{ background: "#FFF8F2" }}>
      <div className="mx-auto max-w-[1200px]">
        {/* Eyebrow + heading, matching CampaignProgress.jsx / HowItWorks.jsx exactly
            (small bold uppercase orange label, then the big Playfair heading) —
            not the centered-with-subtitle pattern used elsewhere on the site. */}
        <div className="mb-14 text-center">
          <p
            className="mb-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--color-brand-orange)" }}
          >
            Live impact
          </p>
          <h2
            className="text-3xl font-bold lg:text-4xl"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            Donations, as they happen
          </h2>
        </div>

        <div className="relative -mx-6 px-6">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28"
            style={{ backgroundImage: "linear-gradient(to right, #FFF8F2, transparent)" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28"
            style={{ backgroundImage: "linear-gradient(to left, #FFF8F2, transparent)" }}
            aria-hidden="true"
          />

          <div className="space-y-5">
            {loopTop.length > 0 && (
              <div className="donation-ticker-mask">
                <div className="donation-ticker-track donation-ticker-track--left flex w-max items-stretch py-1">
                  {loopTop.map((d, i) => (
                    <TickerItem key={`top-${d._id}-${i}`} donation={d} index={i} />
                  ))}
                </div>
              </div>
            )}

            {loopBottom.length > 0 && (
              <div className="donation-ticker-mask">
                <div className="donation-ticker-track donation-ticker-track--right flex w-max items-stretch py-1">
                  {loopBottom.map((d, i) => (
                    <TickerItem key={`bottom-${d._id}-${i}`} donation={d} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .donation-ticker-mask {
          overflow: hidden;
        }
        .donation-ticker-track {
          animation-duration: 100s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .donation-ticker-track--left {
          animation-name: donation-ticker-scroll-left;
        }
        .donation-ticker-track--right {
          animation-name: donation-ticker-scroll-right;
        }
        .donation-ticker-mask:hover .donation-ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .donation-ticker-track {
            animation: none;
          }
        }
        @keyframes donation-ticker-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes donation-ticker-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}