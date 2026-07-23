import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  IndianRupee,
  FolderKanban,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { fetchAdminPendingDonations } from "../../services/donationService";
import { fetchAdminCampaigns } from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

// No backend activity-log endpoint exists yet, so Recent Activity shows an
// honest empty state instead of fabricated rows. Wire this up once a real
// admin activity/audit endpoint exists.

const STAT_ACCENTS = [
  { iconBg: "bg-brand-orange/10", iconText: "text-brand-orange", bar: "bg-brand-orange" },
  { iconBg: "bg-blue-50", iconText: "text-blue-600", bar: "bg-blue-500" },
  { iconBg: "bg-purple-50", iconText: "text-purple-600", bar: "bg-purple-500" },
  { iconBg: "bg-emerald-50", iconText: "text-emerald-600", bar: "bg-emerald-500" },
];

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function hashString(value) {
  let hash = 0;
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSparkline(seed) {
  const base = hashString(seed);
  return Array.from({ length: 7 }, (_, i) => 30 + ((base >> (i * 3)) % 70));
}

/* ------------------------------------------------------------------ */
/* Presentational subcomponents                                        */
/* ------------------------------------------------------------------ */

const StatCard = React.memo(function StatCard({ title, value, change, isPositive, icon: Icon, accent }) {
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const sparkline = useMemo(() => getSparkline(title), [title]);

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar} opacity-0 transition duration-300 group-hover:opacity-100`} aria-hidden="true" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">{value}</h2>
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            <TrendIcon size={14} aria-hidden="true" />
            <span>{change}</span>
          </div>
        </div>
        <div className={`rounded-2xl ${accent.iconBg} p-4 transition duration-300 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${accent.iconText}`} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-5 flex h-8 items-end gap-1" aria-hidden="true">
        {sparkline.map((height, i) => (
          <span
            key={i}
            className={`flex-1 rounded-sm ${accent.bar} opacity-20 transition-all duration-300 group-hover:opacity-60`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </Card>
  );
});

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const [donationsRes, campaignsRes] = await Promise.allSettled([
        fetchAdminPendingDonations(),
        fetchAdminCampaigns(),
      ]);

      setDonations(
        donationsRes.status === "fulfilled" ? donationsRes.value.data?.data?.newPendingDonations ?? [] : []
      );
      setCampaigns(
        campaignsRes.status === "fulfilled" ? campaignsRes.value.data?.data?.campaigns ?? [] : []
      );
    } catch (error) {
      setFetchError("Failed to load dashboard overview.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const stats = useMemo(() => {
    const pendingCount = donations.filter((d) => d.status === "Pending").length;
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.campaignRaisedAmt || 0), 0);
    const totalContributors = campaigns.reduce((sum, c) => sum + (c.contributors || 0), 0);
    const activeCampaignsCount = campaigns.filter((c) => c.campaignStatus === "Active").length;

    return [
      { title: "Total Raised", value: formatINR(totalRaised), change: "Across all your campaigns", isPositive: true, icon: IndianRupee, accent: STAT_ACCENTS[0] },
      { title: "Active Campaigns", value: String(activeCampaignsCount), change: `${campaigns.length} total`, isPositive: true, icon: FolderKanban, accent: STAT_ACCENTS[1] },
      { title: "Total Contributors", value: String(totalContributors), change: "Verified donors", isPositive: true, icon: Users, accent: STAT_ACCENTS[2] },
      { title: "Pending Requests", value: String(pendingCount), change: "Awaiting review", isPositive: pendingCount === 0, icon: BarChart3, accent: STAT_ACCENTS[3] },
    ];
  }, [donations, campaigns]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">Welcome back! Monitor donations, campaigns and platform activity.</p>
      </div>

      <div className="h-1 w-full rounded-full bg-gradient-to-r from-brand-orange via-orange-300 to-transparent" aria-hidden="true" />

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          Loading overview...
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button onClick={loadOverview} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !fetchError && (
        <>
          <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <StatCard key={item.title} {...item} />
            ))}
          </section>

          <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</p>
                <h2 className="mt-1 text-2xl font-semibold text-brand-dark">Recent Activity</h2>
              </div>
              <span className="text-sm text-gray-400">Updated just now</span>
            </div>
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
              No recent activity data available yet.
            </p>
          </Card>
        </>
      )}

      <footer className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:justify-between">
        <p>© 2026 SpaceECE India Foundation</p>
        <p>Last Updated • Today</p>
      </footer>
    </div>
  );
}