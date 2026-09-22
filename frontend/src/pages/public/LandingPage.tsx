import { HeroSearch } from '../../components/landing/HeroSearch';
import { FeaturedRooms } from '../../components/landing/FeaturedRooms';
import { VerificationSection } from '../../components/landing/VerificationSection';
import { RoommateMatcherPreview } from '../../components/landing/RoommateMatcherPreview';
import { FinalCTA } from '../../components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <div className="space-y-0">
      {/* 1. HERO + SEARCH */}
      <HeroSearch />

      {/* 2. FEATURED ROOMS */}
      <FeaturedRooms />

      {/* 3. VERIFICATION SECTION */}
      <VerificationSection />

      {/* 4. ROOMMATE MATCHER */}
      <RoommateMatcherPreview />

      {/* 5. FINAL CTA */}
      <FinalCTA />
    </div>
  );
}
