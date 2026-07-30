import React, { useEffect, useState } from "react";
import { Heart, Trophy, HandHeart, Sparkles, Link2, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../utils/cn";

const ENDPOINT = `${import.meta.env.VITE_API_URL}/public/donation/fetch-donationwall`;

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
  console.log(ENDPOINT);
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

function RangeFilters({ range, onRangeChange, variant }) {
  const isEditorial = variant === "editorial";
  const isGridGlass = variant === "gridGlass";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2.5",
        isEditorial || isGridGlass ? "mb-10" : "px-6 py-6 sm:px-10 sm:py-7",
      )}
      style={
        isEditorial || isGridGlass ? undefined : { borderBottom: "1px solid rgba(26,26,26,0.06)" }
      }
    >
      {RANGE_OPTIONS.map((opt) => {
        const active = opt.value === range;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRangeChange(opt.value)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
              active
                ? "text-white shadow-[0_6px_18px_-6px_rgba(232,116,26,0.55)]"
                : isGridGlass
                  ? "text-[#4B5563] hover:text-[#E8741A]"
                  : isEditorial
                    ? "text-[#6B7280] hover:text-[#E8741A]"
                    : "text-brand-dark/55 hover:text-brand-orange",
            )}
            style={
              isGridGlass
                ? {
                    background: active ? "#E8741A" : "#FFFFFF",
                    border: active ? "1px solid transparent" : "1px solid rgba(236,230,221,0.9)",
                    boxShadow: active
                      ? undefined
                      : "0 2px 8px -4px rgba(31,41,55,0.06)",
                  }
                : isEditorial
                  ? {
                      background: active ? "#E8741A" : "rgba(255,255,255,0.7)",
                      border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.8)",
                    }
                  : {
                      background: active ? "var(--color-brand-orange)" : "transparent",
                      border: active ? "1px solid transparent" : "1px solid rgba(26,26,26,0.08)",
                    }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PaginationControls({ pagination, page, onPageChange, variant }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const isGridGlass = variant === "gridGlass";

  return (
    <div className="relative mt-10 flex items-center justify-center sm:mt-12">
      <div
        className={cn(
          "flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full px-3 py-2",
          isGridGlass && "bg-white shadow-[0_2px_12px_-4px_rgba(31,41,55,0.08)]",
        )}
        style={
          !isGridGlass
            ? {
                background: "rgba(255,253,248,0.75)",
                border: "1px solid rgba(26,26,26,0.06)",
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!pagination.hasPreviousPage}
          className="inline-flex items-center gap-0.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#E8741A] disabled:opacity-40 disabled:hover:text-[#6B7280]"
        >
          {isGridGlass && <ChevronLeft size={14} aria-hidden="true" />}
          Prev
        </button>

        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
          const active = p === pagination.page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                active
                  ? "bg-[#E8741A] text-white shadow-[0_4px_12px_-4px_rgba(232,116,26,0.5)]"
                  : "text-[#6B7280] hover:text-[#E8741A]",
              )}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
          disabled={!pagination.hasNextPage}
          className="inline-flex items-center gap-0.5 rounded-full px-3 py-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#E8741A] disabled:opacity-40 disabled:hover:text-[#6B7280]"
        >
          Next
          {isGridGlass && <ChevronRight size={14} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function DefaultDonationRow({ donation, isTop }) {
  const initial = (donation.donorName || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-4 sm:gap-5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-11 sm:w-11"
        style={{
          background: isTop ? "rgba(217,119,6,0.12)" : "rgba(26,26,26,0.05)",
          color: isTop ? "#B45309" : "var(--color-brand-dark)",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3
            className="min-w-0 text-base font-semibold leading-tight sm:text-lg"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            {donation.donorName || "Anonymous"}
          </h3>
          <Heart
            className="h-4 w-4 shrink-0 opacity-25 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-80"
            style={{ color: "var(--color-brand-orange)" }}
            aria-hidden="true"
          />
        </div>

        {(isTop || donation.campaign?.campaignName) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {isTop && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                <Trophy className="h-3 w-3" /> Top Contribution
              </span>
            )}
            {donation.campaign?.campaignName && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ background: "rgba(26,26,26,0.05)", color: "rgba(26,26,26,0.6)" }}
              >
                <HandHeart className="h-3 w-3" />
                {donation.campaign.campaignName}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span
            className="text-xl font-bold tracking-tight sm:text-2xl"
            style={{
              color: isTop ? "#B45309" : "var(--color-brand-dark)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {formatINR(donation.amount)}
          </span>
          <span className="text-xs text-brand-dark/40">
            {relativeTime(donation.verifiedAt)}
          </span>
        </div>

        {donation.donorMessage && (
          <p className="mt-3 text-[15px] leading-relaxed text-brand-dark/55">
            {donation.donorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function EditorialDonationRow({ donation }) {
  const initial = (donation.donorName || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="group border-b border-[#ECE6DD] py-6 last:border-b-0 sm:py-7">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F4EE] font-display text-sm font-semibold text-[#1F2937]">
          {initial}
        </span>

        <div className="min-w-0">
          <p className="truncate font-medium text-[#1F2937]">
            {donation.donorName || "Anonymous"}
          </p>
          {donation.campaign?.campaignName && (
            <p className="mt-0.5 truncate text-sm text-[#6B7280]">
              {donation.campaign.campaignName}
            </p>
          )}
        </div>

        <p className="font-display text-base font-semibold text-[#1F2937] sm:text-lg">
          {formatINR(donation.amount)}
        </p>

        <p className="hidden text-sm text-[#6B7280] sm:block">
          {relativeTime(donation.verifiedAt)}
        </p>

        <Heart
          size={16}
          className="shrink-0 text-[#E8741A]/30 transition-all duration-300 group-hover:scale-110 group-hover:text-[#E8741A]"
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 pl-14 text-xs text-[#6B7280] sm:hidden">
        {relativeTime(donation.verifiedAt)}
      </p>
    </div>
  );
}

// Card layout matched to the Solution page Recent Donations mockup:
// white surface, avatar + verified row, large orange amount, campaign pill, timestamp.
function GridDonationCard({ donation }) {
  const initial = (donation.donorName || "A").trim().charAt(0).toUpperCase();

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[24px] bg-white p-6",
        "shadow-[0_2px_12px_-4px_rgba(31,41,55,0.06),0_16px_40px_-16px_rgba(31,41,55,0.1)]",
        "transition-all duration-300 ease-out hover:-translate-y-1",
        "hover:shadow-[0_4px_20px_-4px_rgba(232,116,26,0.12),0_24px_48px_-16px_rgba(31,41,55,0.14)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDE8D4] text-sm font-bold text-[#E8741A]">
            {initial}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="truncate text-[15px] font-semibold text-[#1F2937]">
              {donation.donorName || "Anonymous"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
              <CheckCircle2 size={12} strokeWidth={2.5} aria-hidden="true" />
              Verified
            </p>
          </div>
        </div>
        <Heart
          size={18}
          className="shrink-0 text-[#E8741A]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>

      <p className="mt-5 font-display text-[30px] font-bold leading-none tracking-tight text-[#E8741A]">
        {formatINR(donation.amount)}
      </p>

      {donation.campaign?.campaignName && (
        <span className="mt-3 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-[#FFF0E4] px-3 py-1.5 text-xs font-medium text-[#B45309]">
          <Link2 size={12} className="shrink-0 text-[#E8741A]" aria-hidden="true" />
          <span className="truncate">{donation.campaign.campaignName}</span>
        </span>
      )}

      {donation.donorMessage && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#6B7280]">
          {donation.donorMessage}
        </p>
      )}

      <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs text-[#9CA3AF]">
        <Clock size={12} aria-hidden="true" />
        {relativeTime(donation.verifiedAt)}
      </p>
    </article>
  );
}

export default function DonationWall({ setStatistics, variant = "default" }) {
  const [range, setRange] = useState("all");
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [topOverallId, setTopOverallId] = useState(null);

  const isEditorial = variant === "editorial";
  const isGrid = variant === "grid";

  useEffect(() => {
    setPage(1);
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    fetchDonations({ lastDays: range, page: 1, limit: 1000 })
      .then((data) => {
        if (cancelled || !data.donations.length) return;
        const top = data.donations.reduce(
          (best, d) => (d.amount > (best?.amount || 0) ? d : best),
          data.donations[0],
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

    // The grid variant (Solution page) shows 6 cards per page (2 rows of 3
    // on desktop) instead of the default 12, so the section stays light and
    // premium rather than dashboard-dense. Pagination itself is untouched —
    // it's still driven by the same server-side page/limit params.
    fetchDonations({ lastDays: range, page, limit: isGrid ? 6 : 12 })
      .then((data) => {
        if (cancelled) return;
        setDonations(data.donations);
        setPagination(data.pagination);
        if (setStatistics) {
          setStatistics(data.statistics);
        }
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

  const contentState = error ? (
    <div className="py-16 text-center text-red-500">
      Couldn&apos;t load donations: {error}
    </div>
  ) : loading && page === 1 ? (
    <div className="py-16 text-center text-[#6B7280]">Loading donations…</div>
  ) : donations.length === 0 ? (
    <div className="py-16 text-center text-[#6B7280]">
      No donations in this range yet — be the first to make a difference.
    </div>
  ) : isGrid ? (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {donations.map((d) => (
        <GridDonationCard key={d._id} donation={d} />
      ))}
    </div>
  ) : (
    <div>
      {donations.map((d, i) => {
        const isTop = d._id === topContributionId;
        const isLast = i === donations.length - 1;

        if (isEditorial) {
          return <EditorialDonationRow key={d._id} donation={d} />;
        }

        return (
          <div
            key={d._id}
            className="group relative px-6 py-7 transition-colors duration-300 hover:bg-black/[0.015] sm:px-10 sm:py-8"
            style={{ borderBottom: isLast ? "none" : "1px solid rgba(26,26,26,0.06)" }}
          >
            <DefaultDonationRow donation={d} isTop={isTop} />
          </div>
        );
      })}
    </div>
  );

  if (isGrid) {
    return (
      <section className="relative overflow-hidden bg-[#FFF8F2] py-20 sm:py-28">
        {/* Soft peach side blooms */}
        <div
          className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full opacity-70 blur-[90px]"
          style={{ background: "radial-gradient(circle, #FFD4A8 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full opacity-60 blur-[85px]"
          style={{ background: "radial-gradient(circle, #FFE4C8 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        {/* Dot pattern — top right */}
        <div
          className="pointer-events-none absolute right-8 top-12 h-40 w-40 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(#E8741A 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
          {/* Outer glow */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-[40px] opacity-50 blur-2xl"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(232,116,26,0.18), transparent 65%)" }}
            aria-hidden="true"
          />

          {/* Frosted glass panel */}
          <div
            className="relative overflow-hidden rounded-[32px] border border-white/60"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 80px -20px rgba(232,116,26,0.14), 0 8px 32px -12px rgba(31,41,55,0.08)",
            }}
          >
            <div className="px-6 py-14 sm:px-12 sm:py-16">
              {/* Section header */}
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
                <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8741A]">
                  <span aria-hidden="true">✧</span>
                  Community Impact
                  <span aria-hidden="true">✧</span>
                </p>
                <span className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                  <span className="block h-[3px] w-12 rounded-full bg-[#E8741A]/80" />
                  <span className="block h-1.5 w-1.5 rounded-full bg-[#E8741A]/60" />
                </span>
                <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-[#0D4A52] sm:text-[42px]">
                  Recent Donations
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6B7280]">
                  See how people are making a difference with their support.
                </p>
              </div>

              <RangeFilters range={range} onRangeChange={setRange} variant="gridGlass" />
              {contentState}
              <PaginationControls
                pagination={pagination}
                page={page}
                onPageChange={setPage}
                variant="gridGlass"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isEditorial) {
    return (
      <section className="bg-[#FFFDF8] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
              Community Impact
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#1F2937] sm:text-5xl">
              Recent Donations
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#6B7280]">
              Every contribution creates a ripple of change.
            </p>
          </div>

          <RangeFilters range={range} onRangeChange={setRange} variant="editorial" />
          {contentState}
          <PaginationControls
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            variant="editorial"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden px-4 py-24 sm:px-8 sm:py-28">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 560px at 92% 0%, rgba(230,126,34,0.12), transparent 55%), radial-gradient(900px 560px at 4% 100%, rgba(20,148,140,0.12), transparent 55%), var(--color-brand-bg)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto mb-14 max-w-2xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.55)",
            color: "var(--color-brand-teal)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <Sparkles size={14} aria-hidden="true" />
          Community Impact
        </div>

        <h2
          className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
          style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
        >
          Impact{" "}
          <span
            className="italic"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Stories
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-gray-600 sm:text-lg">
          Every contribution creates a ripple of change.
        </p>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[44px] opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle at 50% 20%, rgba(232,116,26,0.22), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="relative overflow-hidden rounded-[32px] border transition-shadow duration-500"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,253,248,0.7) 100%)",
            borderColor: "rgba(255,255,255,0.7)",
            boxShadow:
              "0 2px 10px -6px rgba(26,26,26,0.06), 0 30px 70px -40px rgba(26,26,26,0.22)",
            backdropFilter: "blur(10px)",
          }}
        >
          <RangeFilters range={range} onRangeChange={setRange} variant="default" />
          {contentState}
        </div>
      </div>

      <PaginationControls
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        variant="default"
      />
    </section>
  );
}
