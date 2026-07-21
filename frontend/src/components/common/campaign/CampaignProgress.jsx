export default function CampaignProgress({ progress }) {
  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E8741A] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-sm font-medium text-[#0D4A52]">
        {progress}% Funded
      </p>
    </div>
  );
}