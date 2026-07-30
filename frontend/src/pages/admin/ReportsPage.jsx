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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Card } from "../../components/common/Card";
import { fetchDonations } from "../../services/donationService";
import { fetchAdminCampaigns } from "../../services/campaignService";
import { getCurrentAdmin } from "../../services/authService";
import { getAllCampaignsForTransfer, getAllAdmins } from "../../services/superAdminService";
import spacEceLogo from "../../assets/logo3.png";

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

// Minimal, white-page palette with a single orange/gold accent from the SpacECE logo —
// no black fills, and just the one accent color everywhere (no varying shades) plus
// warm dark-gray text for readability.
const REPORT_GOLD = [232, 152, 21];
const TEXT_DARK = [66, 61, 53];
const TEXT_MUTED = [140, 133, 120];
const BRAND_DARK = TEXT_DARK;
const BRAND_ROW_TINT = [253, 240, 220];
const PAGE_BG = [255, 255, 255];

/* ------------------------------------------------------------------ */
/* PDF drawing helpers                                                  */
/* ------------------------------------------------------------------ */

function paintPageBackground(doc, pageWidth, pageHeight) {
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

// Loads a bundler-imported image (same-origin) into a canvas so jsPDF can embed it as a
// data URL. Resolves to null on failure so the header can fall back gracefully instead of
// throwing and losing the whole export.
function loadImageAsDataUrl(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.naturalWidth, height: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawBrandHeader(doc, pageWidth, title, subtitle, logo) {
  const marginX = 40;
  const logoBoxSize = 62;
  const logoTop = 24;

  // The logo's own white sticker outline sits directly on the white page — no plate or
  // color block needed behind it, keeping the masthead minimal.
  if (logo?.dataUrl) {
    const scale = Math.min(logoBoxSize / logo.width, logoBoxSize / logo.height);
    const drawW = logo.width * scale;
    const drawH = logo.height * scale;
    const drawY = logoTop + (logoBoxSize - drawH) / 2;
    doc.addImage(logo.dataUrl, "PNG", marginX, drawY, drawW, drawH);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...REPORT_GOLD);
    doc.text("SE", marginX, logoTop + logoBoxSize / 2 + 5);
  }

  const textX = marginX + logoBoxSize + 18;
  doc.setTextColor(...TEXT_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SpacECE India Foundation", textX, logoTop + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(title, textX, logoTop + 39);
  doc.setFontSize(9);
  doc.text(subtitle, textX, logoTop + 53);

  // A single thin gold rule closes off the masthead — the only color accent, on an
  // otherwise plain white page.
  doc.setDrawColor(...REPORT_GOLD);
  doc.setLineWidth(1.5);
  doc.line(marginX, logoTop + logoBoxSize + 14, pageWidth - marginX, logoTop + logoBoxSize + 14);
}

function drawSectionTitle(doc, marginX, y, text) {
  doc.setFillColor(...REPORT_GOLD);
  doc.roundedRect(marginX, y - 9, 4, 12, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_DARK);
  doc.text(text, marginX + 10, y);
}

function fitSingleLineFontSize(doc, text, maxWidth, startSize, minSize = 9) {
  let size = startSize;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size -= 1;
    doc.setFontSize(size);
  }
  return size;
}

// Single unified band instead of four separate boxed cards — one light tint background,
// one thin gold rule on top, metrics laid out as plain columns divided by hairlines. This
// reads as one cohesive strip (closer to how a printed summary line looks) rather than a
// row of small boxes, which kept feeling like a mismatched, "boxy" add-on in a PDF.
function drawKeyMetricsBand(doc, x, y, w, h, metrics) {
  doc.setFillColor(...BRAND_ROW_TINT);
  doc.roundedRect(x, y, w, h, 8, 8, "F");
  doc.setFillColor(...REPORT_GOLD);
  doc.rect(x + 8, y, w - 16, 2.5, "F");

  const colWidth = w / metrics.length;
  metrics.forEach((m, i) => {
    const colX = x + i * colWidth;
    const centerX = colX + colWidth / 2;
    const innerWidth = colWidth - 20;

    fitSingleLineFontSize(doc, m.value, innerWidth, 15);
    doc.setTextColor(...BRAND_DARK);
    doc.text(m.value, centerX, y + h / 2 - 2, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    const lines = doc.splitTextToSize(m.label, innerWidth).slice(0, 2);
    lines.forEach((line, li) => {
      doc.text(line, centerX, y + h / 2 + 13 + li * 9, { align: "center" });
    });

    if (i < metrics.length - 1) {
      doc.setDrawColor(225, 216, 198);
      doc.setLineWidth(0.75);
      doc.line(colX + colWidth, y + 14, colX + colWidth, y + h - 14);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

// jsPDF's built-in fonts don't render the ₹ glyph reliably across viewers, so PDF text
// uses "Rs." instead. The on-screen UI keeps the ₹ symbol via formatINR above.
function formatINRForPdf(amount) {
  return `Rs. ${Number(amount ?? 0).toLocaleString("en-IN")}`;
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

  // Role check — used to widen the campaign dropdown's option list for Super Admin,
  // and now also to power the Admin filter dropdown. Regular admin default view and
  // stats still come from `campaigns` (this admin's own), exactly as before.
  const [adminProfile, setAdminProfile] = useState(null);
  const isSuperAdmin = adminProfile?.role === "SUPER_ADMIN";
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("All");

  const dropdownCampaigns = useMemo(() => {
    if (!isSuperAdmin) return campaigns;
    if (selectedAdminId === "All") return allCampaigns;
    return allCampaigns.filter((c) => String(c.createdBy?._id ?? c.createdBy) === String(selectedAdminId));
  }, [isSuperAdmin, allCampaigns, campaigns, selectedAdminId]);

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then((response) => {
        if (!cancelled) setAdminProfile(response.data?.data?.admin ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    getAllCampaignsForTransfer()
      .then((response) => {
        if (!cancelled) setAllCampaigns(response.data?.data?.campaigns ?? []);
      })
      .catch(() => {});
    getAllAdmins()
      .then((response) => {
        if (!cancelled) setAllAdmins(response.data?.data?.admins ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = useCallback((key, value) => setFilters((prev) => ({ ...prev, [key]: value })), []);

  // Picking an admin narrows the campaign dropdown — clear a previously-picked
  // campaign if it doesn't belong to the newly-picked admin, same as Donation History.
  const handleAdminFilterChange = useCallback(
    (adminId) => {
      setSelectedAdminId(adminId);
      setFilters((prev) => {
        if (prev.campaign === "All") return prev;
        const stillValid = allCampaigns.some(
          (c) => c._id === prev.campaign && String(c.createdBy?._id ?? c.createdBy) === String(adminId)
        );
        return adminId === "All" || stillValid ? prev : { ...prev, campaign: "All" };
      });
    },
    [allCampaigns]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedAdminId("All");
  }, []);
  const hasActiveFilters =
    filters.campaign !== "All" || filters.fromDate !== "" || filters.toDate !== "" || selectedAdminId !== "All";

  const buildParams = useCallback(() => {
    const params = { page: 1, limit: REPORT_FETCH_LIMIT };
    if (filters.campaign !== "All") {
      params.campaign = filters.campaign;
    } else if (isSuperAdmin && selectedAdminId !== "All") {
      params.admin = selectedAdminId;
    }
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    return params;
  }, [filters, isSuperAdmin, selectedAdminId]);

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
    if (filters.campaign !== "All") {
      // look up from dropdownCampaigns (not just `campaigns`) since a Super Admin can
      // pick a campaign that isn't their own — it wouldn't be found in `campaigns` alone
      const match = dropdownCampaigns.find((c) => c._id === filters.campaign);
      return match ? [match] : [];
    }
    if (isSuperAdmin && selectedAdminId !== "All") {
      return dropdownCampaigns;
    }
    return campaigns;
  }, [campaigns, dropdownCampaigns, filters.campaign, isSuperAdmin, selectedAdminId]);

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

  // ------------------------------------------------------------------
  // PDF export — replaces the old CSV/"Excel" export. Built with jsPDF +
  // jspdf-autotable so the tables get real styling (colored headers,
  // alternating row tints) instead of a raw data dump, using the actual
  // SpacECE logo's black + gold palette. All the filtering and computed
  // data above (stats, paymentModeBreakdown, monthlyTrend, filteredCampaigns)
  // is untouched — only how it gets exported changes.
  // ------------------------------------------------------------------
  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const logo = await loadImageAsDataUrl(spacEceLogo);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 40;
      const contentWidth = pageWidth - marginX * 2;
      const pageBreakThreshold = pageHeight - 110;
      let cursorY;

      const generatedOn = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      const campaignLabel =
        filters.campaign === "All"
          ? "All Campaigns"
          : dropdownCampaigns.find((c) => c._id === filters.campaign)?.campaignName ?? "Selected Campaign";

      const goToNextPageIfNeeded = (neededSpace = 0) => {
        if (cursorY + neededSpace > pageBreakThreshold) {
          doc.addPage();
          paintPageBackground(doc, pageWidth, pageHeight);
          cursorY = 50;
        }
      };

      paintPageBackground(doc, pageWidth, pageHeight);
      drawBrandHeader(doc, pageWidth, "Donation & Campaign Report", `Generated on ${generatedOn}`, logo);

      cursorY = 128;

      // Filters summary, on a soft card so it doesn't read as a stray line of text
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(232, 228, 222);
      doc.roundedRect(marginX, cursorY - 16, contentWidth, 30, 6, 6, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...REPORT_GOLD);
      doc.text("FILTERS", marginX + 12, cursorY - 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND_DARK);
      doc.text(
        `Campaign: ${campaignLabel}      From: ${filters.fromDate || "—"}      To: ${filters.toDate || "—"}`,
        marginX + 12,
        cursorY + 9
      );

      cursorY += 46;

      // Key metrics — one unified band with plain columns, rather than four separate cards
      drawSectionTitle(doc, marginX, cursorY, "Key Metrics");
      cursorY += 16;

      const keyMetrics = [
        { label: "Total Raised (all-time)", value: formatINRForPdf(stats.totalRaisedAllTime) },
        { label: `Verified · ${formatINRForPdf(stats.verifiedAmount)}`, value: String(stats.verifiedCount) },
        { label: "Total Contributors (all-time)", value: String(stats.totalContributors) },
        {
          label: `${stats.pendingCount} pending / ${stats.rejectedCount} rejected`,
          value: `${filteredCampaigns.length} Campaigns`,
        },
      ];
      const metricsBandHeight = 66;
      drawKeyMetricsBand(doc, marginX, cursorY, contentWidth, metricsBandHeight, keyMetrics);

      cursorY += metricsBandHeight + 30;

      // Campaign-wise breakdown, with an actual progress bar drawn per row
      drawSectionTitle(doc, marginX, cursorY, "Campaign-wise Breakdown");
      cursorY += 10;

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX },
        styles: { fontSize: 9, cellPadding: 7, lineColor: [240, 236, 230], lineWidth: 0.5, textColor: TEXT_DARK },
        head: [["Campaign", "Goal", "Raised", "Progress", "Contributors", "Status"]],
        body: filteredCampaigns.map((c) => [
          c.campaignName,
          formatINRForPdf(Number(c.campaignGoalAmt ?? 0)),
          formatINRForPdf(Number(c.campaignRaisedAmt ?? 0)),
          "",
          String(c.contributors ?? 0),
          c.campaignStatus,
        ]),
        headStyles: { fillColor: REPORT_GOLD, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: BRAND_ROW_TINT },
        didDrawCell: (data) => {
          if (data.section !== "body" || data.column.index !== 3) return;
          const campaign = filteredCampaigns[data.row.index];
          if (!campaign) return;
          const goal = Number(campaign.campaignGoalAmt ?? 0);
          const raised = Number(campaign.campaignRaisedAmt ?? 0);
          const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
          const { x, y, width, height } = data.cell;
          const barHeight = 5;
          const barWidth = width - 30;
          const barX = x + 4;
          const barY = y + height / 2 - barHeight / 2;
          doc.setFillColor(230, 226, 220);
          doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, "F");
          doc.setFillColor(...REPORT_GOLD);
          doc.roundedRect(barX, barY, Math.max(2, (barWidth * percent) / 100), barHeight, 2, 2, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...BRAND_DARK);
          doc.text(`${percent}%`, barX + barWidth + 5, y + height / 2 + 2.5);
        },
      });

      cursorY = doc.lastAutoTable.finalY + 34;
      goToNextPageIfNeeded(160);

      // Payment mode breakdown
      drawSectionTitle(doc, marginX, cursorY, "Payment Mode Breakdown (Verified Donations)");
      cursorY += 10;

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX },
        styles: { fontSize: 9, cellPadding: 7, lineColor: [240, 236, 230], lineWidth: 0.5, textColor: TEXT_DARK },
        head: [["Payment Mode", "Count", "Amount"]],
        body: paymentModeBreakdown.map((m) => [m.mode, String(m.count), formatINRForPdf(m.amount)]),
        headStyles: { fillColor: REPORT_GOLD, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: BRAND_ROW_TINT },
      });

      cursorY = doc.lastAutoTable.finalY + 34;
      goToNextPageIfNeeded(160);

      // Monthly trend
      drawSectionTitle(doc, marginX, cursorY, "Monthly Trend (Verified Donations)");
      cursorY += 10;

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX },
        styles: { fontSize: 9, cellPadding: 7, lineColor: [240, 236, 230], lineWidth: 0.5, textColor: TEXT_DARK },
        head: [["Month", "Amount"]],
        body: monthlyTrend.map((m) => [m.label, formatINRForPdf(m.amount)]),
        headStyles: { fillColor: REPORT_GOLD, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: BRAND_ROW_TINT },
      });

      // Footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setDrawColor(230, 226, 220);
        doc.line(marginX, pageHeight - 32, pageWidth - marginX, pageHeight - 32);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("SpacECE India Foundation — Confidential admin report", marginX, pageHeight - 18);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX - 60, pageHeight - 18);
      }

      doc.save(`donation-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }, [filteredCampaigns, paymentModeBreakdown, monthlyTrend, stats, filters, campaigns, dropdownCampaigns, selectedAdminId]);

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
          onClick={handleExportPdf}
          disabled={isExporting || isLoading}
          className="flex items-center justify-center gap-2 self-start rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
          Download PDF Report
        </button>
      </div>

      <Card className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Filter size={13} aria-hidden="true" />
            Filters
          </span>
          {isSuperAdmin && (
            <select
              value={selectedAdminId}
              onChange={(e) => handleAdminFilterChange(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            >
              <option value="All">All Admins</option>
              {allAdmins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.fullName}
                </option>
              ))}
            </select>
          )}
          <select
            value={filters.campaign}
            onChange={(e) => updateFilter("campaign", e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
          >
            <option value="All">All Campaigns</option>
            {dropdownCampaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.campaignName}
                {isSuperAdmin && c.createdBy?.fullName ? ` — ${c.createdBy.fullName}` : ""}
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