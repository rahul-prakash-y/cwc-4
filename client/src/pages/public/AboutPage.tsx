import React from 'react';
import { About } from '../../components/landing/About';
import { SeasonTimeline } from '../../components/timeline/SeasonTimeline';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 space-y-16">
      <About />
      <SeasonTimeline />
    </div>
  );
};

export default AboutPage;
