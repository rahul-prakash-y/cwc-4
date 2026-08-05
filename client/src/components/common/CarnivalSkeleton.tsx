import React from 'react';
import { Sparkles, Ticket } from 'lucide-react';

export interface CarnivalSkeletonProps {
  type?: 'card' | 'table' | 'banner' | 'chart';
  count?: number;
}

export const CarnivalSkeleton: React.FC<CarnivalSkeletonProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'banner') {
    return (
      <div className="w-full h-44 rounded-3xl glass-card p-6 border-carnival-gold/30 animate-pulse flex items-center justify-between">
        <div className="space-y-3 w-2/3">
          <div className="h-4 w-32 bg-carnival-gold/20 rounded-full" />
          <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
        </div>
        <div className="w-20 h-20 rounded-2xl bg-carnival-gold/10 border border-carnival-gold/30 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-carnival-gold animate-spin" />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full glass-card rounded-2xl border-white/10 p-4 space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded-lg" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-xl flex items-center justify-between px-4">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="h-4 w-16 bg-carnival-gold/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="h-[240px] rounded-3xl glass-card p-6 border-white/10 space-y-4 animate-pulse flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="h-4 w-28 bg-carnival-gold/20 rounded-full" />
            <Ticket className="w-4 h-4 text-white/20" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-white/10 rounded-xl" />
            <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
          </div>
          <div className="h-10 w-full bg-white/5 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
