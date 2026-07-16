import { HeroSection } from "../components/home/HeroSection";
import { StatsStrip } from "../components/home/StatsStrip";
import { CampaignProgress } from "../components/home/CampaignProgress";
import { HowItWorks } from "../components/home/HowItWorks";

export default function HomePage() {
  return (
    <div>
  <HeroSection />
  <StatsStrip />
  <CampaignProgress />
  <HowItWorks />
</div>
  );
}