import React from 'react';
import { Ticket, Shield, Zap, ExternalLink, Award, CheckCircle2, AlertTriangle, XCircle, RotateCw } from 'lucide-react';

export interface TicketTeamCardProps {
  team: {
    _id: string;
    teamName: string;
    leaderName?: string;
    leaderEmail?: string;
    members?: string[];
    track?: string;
    totalPoints: number;
    status: string;
    immunity?: boolean;
    advantages?: any[];
    repoUrl?: string;
  };
  rank?: number;
  onStatusChange?: (id: string, status: string) => void;
}

export const TicketTeamCard: React.FC<TicketTeamCardProps> = ({ team, rank, onStatusChange }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Safe':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SAFE PASS
          </span>
        );
      case 'Danger':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-orange-400" /> DANGER ZONE
          </span>
        );
      case 'Eliminated':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" /> ELIMINATED
          </span>
        );
      case 'Qualified':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
            <Award className="w-3 h-3 text-blue-400" /> QUALIFIED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="ticket-flip-card w-full h-[270px] relative cursor-pointer group">
      <div className="ticket-flip-inner relative w-full h-full">
        {/* ================= FRONT OF PHYSICAL ADMISSION TICKET ================= */}
        <div className="ticket-flip-front bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] group-hover:border-white/30 group-hover:shadow-glow-gold group-hover:-translate-y-1 transition-all duration-300 ease-out relative">
          {/* Ticket Side Notch Cutouts */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-cwc-bg border border-cwc-gold/40 z-20 transform -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-cwc-bg border border-cwc-gold/40 z-20 transform -translate-y-1/2" />

          {/* Ticket Top Header & Barcode Visual */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-white/20">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cwc-gold" />
              <span className="text-[11px] font-display font-bold text-cwc-gold uppercase tracking-widest">
                ADMIT ONE • TICKET #{team._id.slice(-6).toUpperCase()}
              </span>
            </div>
            {/* Simulated Barcode Lines */}
            <div className="flex items-center gap-0.5 h-4 opacity-70">
              <div className="w-0.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-0.5 h-full bg-white" />
              <div className="w-1.5 h-full bg-white" />
              <div className="w-0.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
            </div>
          </div>

          {/* Team Main Info */}
          <div className="my-auto space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                {rank && (
                  <span className="text-[10px] font-display font-bold text-cwc-gold uppercase tracking-wider">
                    RANK #{rank}
                  </span>
                )}
                <h3 className="text-xl font-bold font-display text-white group-hover:text-cwc-gold transition-colors">
                  {team.teamName}
                </h3>
              </div>
              <div className="text-right font-display">
                <div className="text-xl font-extrabold text-cwc-gold">{team.totalPoints}</div>
                <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">POINTS</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {getStatusBadge(team.status)}
              {team.immunity && (
                <span className="px-2.5 py-0.5 rounded-full bg-cwc-gold/20 text-cwc-gold border border-cwc-gold/40 text-[10px] font-display font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> IMMUNITY
                </span>
              )}
              {team.advantages && team.advantages.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-cwc-purple/20 text-cwc-purple border border-cwc-purple/40 text-[10px] font-display font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {team.advantages.length} POWER-UPS
                </span>
              )}
            </div>
          </div>

          {/* Bottom Stub Footer */}
          <div className="pt-2 border-t border-dashed border-white/20 flex items-center justify-between text-xs text-gray-400">
            <span className="font-display text-[11px]">Leader: {team.leaderName || 'Aarav'}</span>
            <span className="text-[10px] text-cwc-gold flex items-center gap-1 font-display font-semibold">
              <RotateCw className="w-3 h-3 animate-spin" /> Flip Ticket
            </span>
          </div>
        </div>

        {/* ================= BACK OF PHYSICAL ADMISSION TICKET ================= */}
        <div className="ticket-flip-back bg-white/5 backdrop-blur-lg border border-cwc-purple/40 p-6 rounded-2xl flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.5)]">
          {/* Ticket Side Notch Cutouts */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-cwc-bg border border-cwc-purple/40 z-20 transform -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-cwc-bg border border-cwc-purple/40 z-20 transform -translate-y-1/2" />

          {/* Back Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] font-display font-bold text-cwc-purple uppercase tracking-wider">
              TICKET STUB DETAILS • ROSTER & REPO
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-display font-bold">
              {team.track || 'Full-Stack Web'}
            </span>
          </div>

          {/* Members list */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-display text-gray-400 uppercase font-bold">MEMBER ROSTER</div>
            <div className="flex flex-wrap gap-1.5">
              {team.members && team.members.length > 0 ? (
                team.members.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[11px] font-medium"
                  >
                    👤 {m}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">👤 {team.leaderName || 'Solo Competitor'}</span>
              )}
            </div>
          </div>

          {/* Quick Actions & Status Toggle */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {team.repoUrl && (
              <a
                href={team.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-cwc-gold hover:underline font-display font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
              </a>
            )}

            {onStatusChange && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => onStatusChange(team._id, 'Safe')}
                  className="py-1 px-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 text-[9px] font-display font-bold border border-emerald-500/40 transition-all text-center"
                >
                  🟢 Safe
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Danger')}
                  className="py-1 px-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 text-[9px] font-display font-bold border border-orange-500/40 transition-all text-center"
                >
                  🟠 Danger
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Eliminated')}
                  className="py-1 px-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-[9px] font-display font-bold border border-rose-500/40 transition-all text-center"
                >
                  🔴 Eliminated
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Qualified')}
                  className="py-1 px-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 text-[9px] font-display font-bold border border-blue-500/40 transition-all text-center"
                >
                  🔵 Qualified
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
