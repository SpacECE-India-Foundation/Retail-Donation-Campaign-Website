import { HeroSection } from "../components/home/HeroSection";
import { StatsStrip } from "../components/home/StatsStrip";
import { CampaignProgress } from "../components/home/CampaignProgress";
import { HowItWorks } from "../components/home/HowItWorks";
import DonationTicker from "../components/common/donation/DonationTicker";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsStrip />
      <DonationTicker />
      <CampaignProgress />
      <HowItWorks />
    </div>
  );
}