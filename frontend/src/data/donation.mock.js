/**
 * Placeholder campaign & donation data.
 * Replace fetch calls with API responses when backend is wired.
 */

export const CAMPAIGNS = [
  {
    campaignId: "education-for-all",
    campaignName: "Education for All",
    category: "Education",
    description:
      "Bring quality early learning resources to underserved communities across India.",
    shortDescription: "Early childhood education for every child.",
    banner:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=500&fit=crop",
    goal: 500000,
    raised: 342500,
    contributors: 1248,
    daysLeft: 45,
    endDate: "2026-09-04",
  },
  {
    campaignId: "library-learning",
    campaignName: "Library & Learning",
    category: "Learning",
    description:
      "Set up community libraries and learning corners in Anganwadi centres.",
    shortDescription: "Books, kits, and learning spaces for young minds.",
    banner:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=500&fit=crop",
    goal: 300000,
    raised: 187200,
    contributors: 892,
    daysLeft: 62,
    endDate: "2026-09-21",
  },
  {
    campaignId: "health-support",
    campaignName: "Health Support",
    category: "Health",
    description:
      "Provide nutrition kits and health monitoring for children in high-need regions.",
    shortDescription: "Nutrition and wellness for growing children.",
    banner:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop",
    goal: 400000,
    raised: 256000,
    contributors: 1034,
    daysLeft: 38,
    endDate: "2026-08-28",
  },
  {
    campaignId: "disaster-relief",
    campaignName: "Disaster Relief",
    category: "Relief",
    description:
      "Rapid response kits and learning continuity support for families affected by disasters.",
    shortDescription: "Emergency support when communities need it most.",
    banner:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=500&fit=crop",
    goal: 750000,
    raised: 412000,
    contributors: 2156,
    daysLeft: 21,
    endDate: "2026-08-11",
  },
];

export const DEFAULT_HERO = {
  title: "Make a Difference Today",
  description:
    "Your contribution directly supports early childhood development programmes across India. Every rupee creates lasting impact.",
  banner:
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=500&fit=crop",
};

export const AMOUNT_PRESETS = [500, 1000, 2500, 5000];

export const PAYMENT_MODES = ["UPI", "Bank Transfer"];

export const CAMPAIGN_MILESTONES = {
  "education-for-all": [
    {
      id: "m1",
      milestoneTitle: "Learning Kits Phase 1",
      description:
        "Distribute 500 early learning kits to Anganwadi centres in rural Maharashtra.",
      targetAmount: 100000,
      raisedAmount: 100000,
      displayOrder: 1,
      isCompleted: true,
    },
    {
      id: "m2",
      milestoneTitle: "Parent Facilitator Training",
      description:
        "Train 200 parents as home-learning facilitators across partner communities.",
      targetAmount: 150000,
      raisedAmount: 117000,
      displayOrder: 2,
      isCompleted: false,
    },
    {
      id: "m2b",
      milestoneTitle: "Digital Learning Corners",
      description:
        "Set up tablet-based learning corners in 25 underserved schools.",
      targetAmount: 200000,
      raisedAmount: 0,
      displayOrder: 3,
      isCompleted: false,
    },
  ],
  "library-learning": [
    {
      id: "m3",
      milestoneTitle: "First Community Library",
      description: "Open the first community library with 1,000+ curated children's books.",
      targetAmount: 75000,
      raisedAmount: 75000,
      displayOrder: 1,
      isCompleted: true,
    },
  ],
  "health-support": [],
};

export function getCampaignById(campaignId) {
  return CAMPAIGNS.find((c) => c.campaignId === campaignId) ?? null;
}

export function getMilestonesByCampaignId(campaignId) {
  if (!campaignId) return [];
  return CAMPAIGN_MILESTONES[campaignId] ?? [];
}

export function getCampaignStats(campaign) {
  if (!campaign) {
    const totals = CAMPAIGNS.reduce(
      (acc, c) => ({
        contributors: acc.contributors + c.contributors,
        raised: acc.raised + c.raised,
        goal: acc.goal + c.goal,
        daysLeft: Math.min(acc.daysLeft, c.daysLeft),
      }),
      { contributors: 0, raised: 0, goal: 0, daysLeft: Infinity },
    );
    return {
      ...totals,
      remaining: totals.goal - totals.raised,
      progressPercent: Math.round((totals.raised / totals.goal) * 100),
    };
  }

  const remaining = campaign.goal - campaign.raised;
  const progressPercent = Math.round((campaign.raised / campaign.goal) * 100);

  return {
    contributors: campaign.contributors,
    raised: campaign.raised,
    goal: campaign.goal,
    remaining,
    progressPercent,
    daysLeft: campaign.daysLeft,
  };
}
