import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { SeasonTimeline } from '../components/timeline/SeasonTimeline';
import { RegisteredTeams } from '../components/teams/RegisteredTeams';
import { RuleBook } from '../components/rules/RuleBook';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Task 2: Hero Section */}
      <HeroSection />

      {/* Task 3: Season Timeline */}
      <SeasonTimeline />

      {/* Task 4: Registered Teams */}
      <RegisteredTeams />

      {/* Task 5: Rule Book */}
      <RuleBook />
    </div>
  );
};
