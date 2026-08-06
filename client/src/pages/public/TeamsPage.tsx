import React from 'react';
import { RegisteredTeams } from '../../components/landing/RegisteredTeams';
import { FanFavoriteBoard } from '../../components/landing/FanFavoriteBoard';

export const TeamsPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 space-y-16">
      <RegisteredTeams />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FanFavoriteBoard />
      </div>
    </div>
  );
};

export default TeamsPage;
