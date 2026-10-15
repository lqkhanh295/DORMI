import { useState } from 'react';
import { HeroSearch } from '../../components/landing/HeroSearch';
import { FeaturedRooms } from '../../components/landing/FeaturedRooms';
import { VerificationSection } from '../../components/landing/VerificationSection';
import { RoommateMatcherPreview } from '../../components/landing/RoommateMatcherPreview';
import { FinalCTA } from '../../components/landing/FinalCTA';

export default function LandingPage() {
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [query, setQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleResetFilters = () => {
    setDistrict('');
    setPrice('');
    setQuery('');
    setVerifiedOnly(false);
  };

  return (
    <div className="space-y-0">
      {/* 1. COMPACT HERO & INSTANT SEARCH BAR (AIRBNB STYLE) */}
      <HeroSearch 
        district={district}
        onDistrictChange={setDistrict}
        price={price}
        onPriceChange={setPrice}
        query={query}
        onQueryChange={setQuery}
        verifiedOnly={verifiedOnly}
        onVerifiedOnlyChange={setVerifiedOnly}
        onResetFilters={handleResetFilters}
      />

      {/* 2. LIVE AVAILABLE ROOMS GRID (FIRST SCREEN DIRECT VIEW) */}
      <FeaturedRooms 
        district={district}
        price={price}
        query={query}
        verifiedOnly={verifiedOnly}
        onResetFilters={handleResetFilters}
      />

      {/* 3. VERIFICATION SECTION */}
      <VerificationSection />

      {/* 4. ROOMMATE MATCHER */}
      <RoommateMatcherPreview />

      {/* 5. FINAL CTA */}
      <FinalCTA />
    </div>
  );
}
