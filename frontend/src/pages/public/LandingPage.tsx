import { GlobalNav } from '../../components/ui/GlobalNav';
import { GlobalFooter } from '../../components/ui/GlobalFooter';
import { HeroSearch } from '../../components/landing/HeroSearch';
import { FeaturedRooms } from '../../components/landing/FeaturedRooms';
import { VerificationSection } from '../../components/landing/VerificationSection';
import { RoommateMatcherPreview } from '../../components/landing/RoommateMatcherPreview';
import { FinalCTA } from '../../components/landing/FinalCTA';

export default function LandingPage() {
  // ponytail: Product-first modular LandingPage (5 core sections, no AI-slop, no fake stats/marquee)
  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] flex flex-col font-sans">
      <GlobalNav />
      
      <main className="flex-1 pt-[56px]">
        {/* 1. HERO + SEARCH */}
        <HeroSearch />

        {/* 2. FEATURED ROOMS (Moved immediately after Hero) */}
        <FeaturedRooms />

        {/* 3. VERIFICATION SECTION */}
        <VerificationSection />

        {/* 4. ROOMMATE MATCHER */}
        <RoommateMatcherPreview />

        {/* 5. FINAL CTA */}
        <FinalCTA />
      </main>

      <GlobalFooter />
    </div>
  );
}
