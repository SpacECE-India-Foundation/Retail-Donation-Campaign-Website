import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart3,
  Download,
  Loader2,
  AlertTriangle,
  IndianRupee,
  Users,
  FolderKanban,
  CheckCircle2,
  RotateCcw,
  Filter,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { fetchDonations } from "../../services/donationService";
import { fetchAdminCampaigns } from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const REPORT_FETCH_LIMIT = 5000;
const PAYMENT_MODES = ["UPI", "Bank Transfer", "Cash", "Cheque"];
const PAYMENT_MODE_COLORS = {
  UPI: "bg-brand-orange",
  "Bank Transfer": "bg-blue-500",
  Cash: "bg-emerald-500",
  Cheque: "bg-purple-500",
};

const DEFAULT_FILTERS = { campaign: "All", fromDate: "", toDate: "" };

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function monthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  if (key === "Unknown") return "Unknown";
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function downloadCsv(rows, filename) {
  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Presentational subcomponents                                        */
/* ------------------------------------------------------------------ */

const STAT_ACCENTS = [
  { iconBg: "bg-brand-orange/10", iconText: "text-brand-orange" },
  { iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  { iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { iconBg: "bg-purple-50", iconText: "text-purple-600" },
];

function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">{value}</h2>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`rounded-2xl ${accent.iconBg} p-3`}>
          <Icon className={`h-5 w-5 ${accent.iconText}`} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

function CampaignBreakdownRow({ campaign, index }) {
  const goal = Number(campaign.campaignGoalAmt ?? 0);
  const raised = Number(campaign.campaignRaisedAmt ?? 0);
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <tr className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
      <td className="py-4 pl-2 font-medium text-brand-dark">{campaign.campaignName}</td>
      <td className="text-gray-500">{formatINR(goal)}</td>
      <td className="font-semibold text-brand-dark">{formatINR(raised)}</td>
      <td>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-brand-orange" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400">{progress}%</span>
        </div>
      </td>
      <td className="text-gray-500">{campaign.contributors ?? 0}</td>
      <td className="text-gray-500">{campaign.campaignStatus}</td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = useCallback((key, value) => setFilters((prev) => ({ ...prev, [key]: value })), []);
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const hasActiveFilters = filters.campaign !== "All" || filters.fromDate !== "" || filters.toDate !== "";

  const buildParams = useCallback(() => {
    const params = { page: 1, limit: REPORT_FETCH_LIMIT };
    if (filters.campaign !== "All") params.campaign = filters.campaign;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    return params;
  }, [filters]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const [donationsRes, campaignsRes] = await Promise.allSettled([
        fetchDonations(buildParams()),
        fetchAdminCampaigns(),
      ]);

      if (donationsRes.status === "fulfilled") {
        setDonations(donationsRes.value.data?.data?.donations ?? []);
      } else {
        setFetchError(donationsRes.reason?.response?.data?.message || "Failed to load donation data.");
      }

      if (campaignsRes.status === "fulfilled") {
        setCampaigns(campaignsRes.value.data?.data?.campaigns ?? []);
      } else {
        // treat "no campaigns yet" as empty, matching CampaignsPage behavior
        setCampaigns([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCampaigns = useMemo(() => {
    if (filters.campaign === "All") return campaigns;
    return campaigns.filter((c) => c._id === filters.campaign);
  }, [campaigns, filters.campaign]);

  const stats = useMemo(() => {
    const verified = donations.filter((d) => d.status === "Verified");
    const pending = donations.filter((d) => d.status === "Pending");
    const rejected = donations.filter((d) => d.status === "Rejected");
    const totalRaisedAllTime = campaigns.reduce((sum, c) => sum + Number(c.campaignRaisedAmt ?? 0), 0);
    const totalContributors = campaigns.reduce((sum, c) => sum + Number(c.contributors ?? 0), 0);

    return {
      totalRaisedAllTime,
      totalContributors,
      totalDonations: donations.length,
      verifiedCount: verified.length,
      verifiedAmount: verified.reduce((sum, d) => sum + Number(d.amount ?? 0), 0),
      pendingCount: pending.length,
      rejectedCount: rejected.length,
    };
  }, [donations, campaigns]);

  const paymentModeBreakdown = useMemo(() => {
    const verified = donations.filter((d) => d.status === "Verified");
    const byMode = PAYMENT_MODES.map((mode) => {
      const matches = verified.filter((d) => d.paymentMode === mode);
      return {
        mode,
        count: matches.length,
        amount: matches.reduce((sum, d) => sum + Number(d.amount ?? 0), 0),
      };
    });
    const maxAmount = Math.max(1, ...byMode.map((m) => m.amount));
    return byMode.map((m) => ({ ...m, percent: Math.round((m.amount / maxAmount) * 100) }));
  }, [donations]);

  const monthlyTrend = useMemo(() => {
    const verified = donations.filter((d) => d.status === "Verified");
    const buckets = new Map();
    verified.forEach((d) => {
      const key = monthKey(d.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(d.amount ?? 0));
    });
    const entries = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b));
    const maxAmount = Math.max(1, ...entries.map(([, amount]) => amount));
    return entries.map(([key, amount]) => ({
      label: monthLabel(key),
      amount,
      percent: Math.round((amount / maxAmount) * 100),
    }));
  }, [donations]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      const rows = [["Campaign Report"], []];
      rows.push(["Campaign Name", "Goal", "Raised", "Progress %", "Contributors", "Status"]);
      filteredCampaigns.forEach((c) => {
        const goal = Number(c.campaignGoalAmt ?? 0);
        const raised = Number(c.campaignRaisedAmt ?? 0);
        const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;
        rows.push([c.campaignName, goal, raised, `${progress}%`, c.contributors ?? 0, c.campaignStatus]);
      });

      rows.push([], ["Payment Mode Breakdown (Verified Donations)"], []);
      rows.push(["Payment Mode", "Count", "Amount"]);
      paymentModeBreakdown.forEach((m) => rows.push([m.mode, m.count, m.amount]));

      rows.push([], ["Monthly Trend (Verified Donations)"], []);
      rows.push(["Month", "Amount"]);
      monthlyTrend.forEach((m) => rows.push([m.label, m.amount]));

      downloadCsv(rows, `donation-report-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setIsExporting(false);
    }
  }, [filteredCampaigns, paymentModeBreakdown, monthlyTrend]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
            <BarChart3 size={14} aria-hidden="true" />
            Reports
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Reports</h1>
          <p className="mt-2 text-gray-500">Campaign performance, payment breakdowns, and donation trends.</p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="flex items-center justify-center gap-2 self-start rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
          Export Report
        </button>
      </div>

      <Card className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Filter size={13} aria-hidden="true" />
            Filters
          </span>
          <select
            value={filters.campaign}
            onChange={(e) => updateFilter("campaign", e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
          >
            <option value="All">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.campaignName}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            From
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => updateFilter("fromDate", e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            To
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => updateFilter("toDate", e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            />
          </label>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Date filters apply to donation-based figures (payment mode, trend, and donation counts). Campaign goal/raised totals are
          always all-time.
        </p>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          Loading reports...
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button onClick={loadData} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !fetchError && (
        <>
          <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Raised" value={formatINR(stats.totalRaisedAllTime)} subtitle="All-time, across campaigns" icon={IndianRupee} accent={STAT_ACCENTS[0]} />
            <StatCard title="Verified Donations" value={`${stats.verifiedCount} (${formatINR(stats.verifiedAmount)})`} subtitle="Within selected filters" icon={CheckCircle2} accent={STAT_ACCENTS[1]} />
            <StatCard title="Total Contributors" value={String(stats.totalContributors)} subtitle="All-time, across campaigns" icon={Users} accent={STAT_ACCENTS[2]} />
            <StatCard title="Campaigns" value={String(filteredCampaigns.length)} subtitle={`${stats.pendingCount} pending / ${stats.rejectedCount} rejected`} icon={FolderKanban} accent={STAT_ACCENTS[3]} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-brand-dark">Payment Mode Breakdown</h2>
              {paymentModeBreakdown.every((m) => m.amount === 0) ? (
                <p className="py-8 text-center text-sm text-gray-400">No verified donations in the selected range.</p>
              ) : (
                <div className="space-y-4">
                  {paymentModeBreakdown.map((m) => (
                    <div key={m.mode}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-brand-dark">{m.mode}</span>
                        <span className="text-gray-400">
                          {m.count} · {formatINR(m.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${PAYMENT_MODE_COLORS[m.mode]}`} style={{ width: `${m.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-brand-dark">Monthly Trend (Verified)</h2>
              {monthlyTrend.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No verified donations in the selected range.</p>
              ) : (
                <div className="flex h-40 items-end gap-2">
                  {monthlyTrend.map((m) => (
                    <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-32 w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-brand-orange transition-all"
                          style={{ height: `${Math.max(4, m.percent)}%` }}
                          title={`${m.label}: ${formatINR(m.amount)}`}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-brand-dark">Campaign-wise Breakdown</h2>
            {filteredCampaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No campaigns to show.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th scope="col" className="py-3 pl-2">
                        Campaign
                      </th>
                      <th scope="col">Goal</th>
                      <th scope="col">Raised</th>
                      <th scope="col">Progress</th>
                      <th scope="col">Contributors</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign, index) => (
                      <CampaignBreakdownRow key={campaign._id} campaign={campaign} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}