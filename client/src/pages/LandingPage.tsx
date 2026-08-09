import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { About } from '../components/landing/About';
import { SeasonTimeline } from '../components/timeline/SeasonTimeline';
import { Prizes } from '../components/landing/Prizes';
import { Gallery } from '../components/landing/Gallery';
import { RegisteredTeams } from '../components/teams/RegisteredTeams';
import { FanFavoriteBoard } from '../components/landing/FanFavoriteBoard';
import { RuleBook } from '../components/rules/RuleBook';
import { Sponsors } from '../components/landing/Sponsors';
import { Contact } from '../components/landing/Contact';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Task 1: About CWC Section */}
      {/* <About /> */}

      {/* 3. Season Timeline */}
      <SeasonTimeline />

      {/* 4. Task 2: Prize Section */}
      {/* <Prizes /> */}

      {/* 5. Media Gallery Section */}
      <Gallery />

      {/* 6. Registered Teams */}
      <RegisteredTeams />

      {/* 7. Live Fan Favorite Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FanFavoriteBoard />
      </div>

      {/* 8. Rule Book */}
      {/* <RuleBook /> */}

      {/* 8. Task 3: Sponsors Component */}
      {/* <Sponsors /> */}

      {/* 9. Task 4: Contact & Venue Section */}
      <Contact />
    </div>
  );
};
