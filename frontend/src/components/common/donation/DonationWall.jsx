import React, { useEffect, useRef, useState } from "react";
import { Heart, Trophy, Sparkles, ChevronDown } from "lucide-react";

const ENDPOINT = `${import.meta.env.VITE_API_URL}/public/donation/fetch-donationwall`;

const BADGE_STYLES = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-sky-100", text: "text-sky-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
];

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatINR(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
}

async function fetchDonations({ lastDays, page = 1, limit = 12 }) {
  const params = new URLSearchParams({ page, limit });
  if (lastDays && lastDays !== "all") params.set("lastDays", lastDays);

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Donation wall request failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

const RANGE_OPTIONS = [
  { value: "all", label: "All Donations" },
  { value: "3", label: "Last 3 Days" },
  { value: "5", label: "Last 5 Days" },
  { value: "7", label: "Last 7 Days" },
];

function RangeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = RANGE_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
      >
        {current?.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-violet-50 ${
                opt.value === value ? "text-violet-700 font-medium" : "text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DonationWall() {
  const [range, setRange] = useState("all");
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [topOverallId, setTopOverallId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [range]);

  // Determine the true highest-amount donation across the WHOLE current
  // range (not just the visible page), since the backend doesn't expose
  // a dedicated "top contribution" flag or sort-by-amount option.
  useEffect(() => {
    let cancelled = false;
    fetchDonations({ lastDays: range, page: 1, limit: 1000 })
      .then((data) => {
        if (cancelled || !data.donations.length) return;
        const top = data.donations.reduce(
          (best, d) => (d.amount > (best?.amount || 0) ? d : best),
          data.donations[0]
        );
        setTopOverallId(top._id);
      })
      .catch(() => {
        if (!cancelled) setTopOverallId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDonations({ lastDays: range, page })
      .then((data) => {
        if (cancelled) return;
        setDonations(data.donations);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, page]);

  const topContributionId = topOverallId;

  return (
    <section className="w-full py-14 px-4 sm:px-8" style={{ backgroundColor: "#FFF6ED" }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-serif font-semibold flex items-center justify-center gap-2 text-gray-900">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
          Our Donation Wall
          <Heart className="w-6 h-6 text-rose-400 fill-rose-200" />
        </h2>
        <p className="text-sm text-gray-500 mt-2">Every contribution creates a ripple of change</p>
      </div>

      <div className="flex items-center justify-center mb-10">
        <RangeDropdown value={range} onChange={setRange} />
      </div>

      {error ? (
        <div className="text-center text-red-500 py-16">Couldn't load donations: {error}</div>
      ) : loading && page === 1 ? (
        <div className="text-center text-gray-400 py-16">Loading donations…</div>
      ) : donations.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No donations in this range yet — be the first to make a difference.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {donations.map((d, i) => {
              const style = BADGE_STYLES[i % BADGE_STYLES.length];
              const isTop = d._id === topContributionId;
              return (
                <div
                  key={d._id}
                  className={`relative bg-white rounded-2xl p-5 shadow-sm border ${
                    isTop ? "border-amber-300" : "border-gray-100"
                  }`}
                >
                  {isTop && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                      <Trophy className="w-3 h-3" /> Top Contribution
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${style.bg} ${style.text}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{d.donorName || "Anonymous"}</h3>
                  <p className={`text-lg font-bold mt-1 ${isTop ? "text-violet-600" : style.text}`}>
                    {formatINR(d.amount)}
                  </p>
                  {d.campaign?.campaignName && (
                    <p className="text-xs text-gray-400 mt-1">for {d.campaign.campaignName}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2 leading-snug">{d.donorMessage}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">{relativeTime(d.verifiedAt)}</span>
                    <Heart className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-violet-50"
              >
                Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-medium ${
                    p === pagination.page
                      ? "bg-violet-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-violet-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-violet-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}