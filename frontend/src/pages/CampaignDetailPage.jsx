import { useState } from "react";
import { useParams } from "react-router-dom";
import CampaignStatsCard from "../components/common/campaign/CampaignStatsCard";
import DonationForm from "../components/common/donate/DonationForm";
import mockCampaigns from "../data/mockCampaigns";

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const campaign = mockCampaigns.find((item) => item.slug === slug);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState(null);

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-600 text-lg">Campaign not found.</p>
      </div>
    );
  }

  const statusStyles = {
    completed: { icon: "✔", badge: "bg-green-100 text-green-700", ring: "border-green-500" },
    "in-progress": { icon: "●", badge: "bg-orange-100 text-orange-700", ring: "border-[#E8741A]" },
    locked: { icon: "🔒", badge: "bg-gray-100 text-gray-500", ring: "border-gray-300" },
  };

  const handleDonateClick = (amount) => {
    setDonationAmount(amount);
    setShowDonationForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-[420px] object-cover rounded-2xl"
          />

          <h1 className="text-4xl font-bold text-[#0D4A52] mt-8">
            {campaign.title}
          </h1>

          <p className="text-gray-600 text-lg mt-4">
            {campaign.shortDescription}
          </p>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-[#0D4A52] mb-4">
              Campaign Overview
            </h2>
            <p className="text-gray-600 leading-8">{campaign.description}</p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#0D4A52] mb-6">
              Campaign Milestones
            </h2>

            <div className="space-y-4">
              {campaign.milestones.map((item, index) => {
                const style = statusStyles[item.status] || statusStyles.locked;
                const pct = item.targetAmount
                  ? Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100))
                  : 0;

                return (
                  <div
                    key={index}
                    className={`border-l-4 ${style.ring} bg-orange-50 rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{style.icon}</span>
                        <p className="font-semibold text-[#0D4A52]">{item.title}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${style.badge}`}>
                        {item.status === "in-progress" ? `${pct}% Complete` : item.status}
                      </span>
                    </div>

                    {item.status !== "locked" && (
                      <div className="mt-2 text-sm text-gray-500">
                        ₹{item.raisedAmount.toLocaleString()} / ₹{item.targetAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline donation form, shown after "Donate Now" is clicked */}
          {showDonationForm && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[#0D4A52] mb-6">
                Complete Your Donation
              </h2>
              <DonationForm initialAmount={donationAmount} campaignTitle={campaign.title} />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <CampaignStatsCard campaign={campaign} onDonateClick={handleDonateClick} />
        </div>
      </div>
    </div>
  );
}