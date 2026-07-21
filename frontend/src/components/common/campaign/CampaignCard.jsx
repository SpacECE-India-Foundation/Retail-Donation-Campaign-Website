    import { Link } from "react-router-dom";
    import CampaignProgress from "./CampaignProgress";

    export default function CampaignCard({ campaign }) {
    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
        {/* Campaign Image */}
        <img
        src={campaign.image}
        alt={campaign.title}
        className="w-full h-52 object-cover"
        />

        {/* Card Content */}
        <div className="p-5">
            {/* Status Badge */}
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            {campaign.status}
            </span>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#0D4A52] mb-2">
            {campaign.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">
            {campaign.shortDescription}
            </p>

            {/* Amount */}
            <div className="flex justify-between text-sm font-medium mb-3">
            <span>₹{campaign.raised.toLocaleString()}</span>
            <span>₹{campaign.goal.toLocaleString()}</span>
            </div>

            {/* Progress */}
            <CampaignProgress progress={campaign.progress} />

            {/* Button */}
            <Link
            to={`/campaigns/${campaign.slug}`}
            className="block mt-5 text-center bg-[#E8741A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
            View Details
            </Link>
        </div>
        </div>
    );
    }