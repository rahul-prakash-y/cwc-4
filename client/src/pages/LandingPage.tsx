import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { AboutCWC } from '../components/about/AboutCWC';
import { SeasonTimeline } from '../components/timeline/SeasonTimeline';
import { PrizeSection } from '../components/prizes/PrizeSection';
import { RegisteredTeams } from '../components/teams/RegisteredTeams';
import { RuleBook } from '../components/rules/RuleBook';
import { SponsorMarquee } from '../components/sponsors/SponsorMarquee';
import { ContactSection } from '../components/contact/ContactSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Task 1: About CWC Section */}
      <AboutCWC />

      {/* 3. Season Timeline */}
      <SeasonTimeline />

      {/* 4. Task 2: Prize Section */}
      <PrizeSection />

      {/* 5. Registered Teams */}
      <RegisteredTeams />

      {/* 6. Rule Book */}
      <RuleBook />

      {/* 7. Task 3: Sponsors Component */}
      <SponsorMarquee />

      {/* 8. Task 4: Contact & Venue Section */}
      <ContactSection />
    </div>
  );
};
