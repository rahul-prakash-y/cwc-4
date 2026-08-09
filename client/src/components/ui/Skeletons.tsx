import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Skeleton component with Tailwind pulse animation.
 * Light Mode: bg-slate-200/70
 * Dark Mode: bg-white/10
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
};

export interface CardSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * CardSkeleton for Student Dashboard and Gallery.
 * Glassy container with 3-4 varying width skeleton bars inside.
 * Min-height matching actual cards to prevent CLS.
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className = '', count = 1 }) => {
  const cards = Array.from({ length: count });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {cards.map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-sm space-y-5 min-h-[220px] flex flex-col justify-between transition-all"
        >
          {/* Top metadata skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-7 w-3/4 rounded-xl" />
          </div>

          {/* Middle content bars with varying widths */}
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>

          {/* Footer action button skeleton */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * TableSkeleton for Admin & Leaderboard table views.
 * Renders a glassy table container with header row + N skeleton data rows.
 * Takes exact min-height to eliminate Cumulative Layout Shift (CLS).
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  className = '',
}) => {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: cols });

  return (
    <div
      className={`bg-white/60 dark:bg-[#140D21]/80 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-md min-h-[380px] flex flex-col justify-between ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5">
              {colArray.map((_, cIdx) => (
                <th key={cIdx} className="p-4">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {rowArray.map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                {colArray.map((_, cIdx) => (
                  <td key={cIdx} className="p-4">
                    <Skeleton
                      className={`h-4 rounded-md ${
                        cIdx === 0
                          ? 'w-12'
                          : cIdx === 1
                          ? 'w-36'
                          : cIdx === cols - 1
                          ? 'w-20'
                          : 'w-24'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table Footer placeholder to maintain layout balance */}
      <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
    </div>
  );
};

export default Skeleton;
