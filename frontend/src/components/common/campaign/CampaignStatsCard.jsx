import { useState } from "react";

const presetAmounts = [500, 1000, 2500, 5000, 10000];

export default function CampaignStatsCard({ campaign, onDonateClick }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : null);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-[#0D4A52] mb-1">
        Support This Campaign
      </h3>

      <p className="text-3xl font-bold text-[#0D4A52] mt-2">
        ₹{campaign.raised.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mb-3">
        raised of ₹{campaign.goal.toLocaleString()} goal
      </p>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
        <div
          className="bg-[#E8741A] h-3 rounded-full"
          style={{ width: `${campaign.progress}%` }}
        ></div>
      </div>
      <p className="text-sm font-semibold text-[#E8741A] mb-4">
        {campaign.progress}% Funded
      </p>

      <div className="flex justify-between text-sm text-gray-600 mb-6">
        <span>👥 {campaign.contributors} Contributors</span>
        <span>⏳ {campaign.daysLeft} Days Left</span>
      </div>

      <p className="text-sm font-semibold text-[#0D4A52] mb-2">
        Choose an amount to donate
      </p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={`py-2 rounded-lg text-sm font-medium border transition ${
              selectedAmount === amount
                ? "bg-[#0D4A52] text-white border-[#0D4A52]"
                : "border-gray-300 text-gray-700 hover:border-[#0D4A52]"
            }`}
          >
            ₹{amount.toLocaleString()}
          </button>
        ))}
        <input
          type="number"
          placeholder="Other"
          value={customAmount}
          onChange={handleCustomChange}
          className="py-2 px-3 rounded-lg text-sm border border-gray-300 focus:outline-none focus:border-[#0D4A52] col-span-1"
        />
      </div>

      <button
        onClick={() => onDonateClick(finalAmount)}
        className="w-full bg-[#E8741A] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition mb-3"
      >
        Donate Now
      </button>

      <button className="w-full border border-gray-300 text-[#0D4A52] py-3 rounded-lg font-medium hover:bg-gray-50 transition">
        Share Campaign
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        🔒 Your donation is 100% secure
      </p>
    </div>
  );
}