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
    <div className="ticket-flip-card w-full h-[260px] relative cursor-pointer group">
      <div className="ticket-flip-inner relative w-full h-full">
        {/* ================= FRONT OF PHYSICAL ADMISSION TICKET ================= */}
        <div className="ticket-flip-front glass-card p-5 border-carnival-gold/30 flex flex-col justify-between overflow-hidden shadow-2xl relative bg-gradient-to-b from-[#181432] to-[#0E0C22]">
          {/* Ticket Side Notch Cutouts */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0B0A16] border border-carnival-gold/40 z-20 transform -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0B0A16] border border-carnival-gold/40 z-20 transform -translate-y-1/2" />

          {/* Ticket Top Header & Barcode Visual */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-white/20">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-carnival-gold" />
              <span className="text-[11px] font-mono font-bold text-carnival-gold uppercase tracking-wider">
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
                  <span className="text-[10px] font-mono font-bold text-carnival-gold uppercase">
                    RANK #{rank}
                  </span>
                )}
                <h3 className="text-xl font-black text-white group-hover:text-carnival-gold transition-colors">
                  {team.teamName}
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-xl font-extrabold text-carnival-gold">{team.totalPoints}</div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">POINTS</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {getStatusBadge(team.status)}
              {team.immunity && (
                <span className="px-2 py-0.5 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> IMMUNITY
                </span>
              )}
              {team.advantages && team.advantages.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {team.advantages.length} POWER-UPS
                </span>
              )}
            </div>
          </div>

          {/* Bottom Stub Footer */}
          <div className="pt-2 border-t border-dashed border-white/20 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px]">Leader: {team.leaderName || 'Aarav'}</span>
            <span className="text-[10px] text-carnival-gold flex items-center gap-1 font-mono">
              <RotateCw className="w-3 h-3 animate-spin" /> Flip Ticket
            </span>
          </div>
        </div>

        {/* ================= BACK OF PHYSICAL ADMISSION TICKET ================= */}
        <div className="ticket-flip-back glass-card p-5 border-carnival-purple/40 flex flex-col justify-between overflow-hidden shadow-2xl bg-gradient-to-b from-[#1C1738] to-[#120F2A]">
          {/* Ticket Side Notch Cutouts */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#0B0A16] border border-carnival-purple/40 z-20 transform -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#0B0A16] border border-carnival-purple/40 z-20 transform -translate-y-1/2" />

          {/* Back Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] font-mono font-bold text-carnival-purple uppercase">
              TICKET STUB DETAILS • ROSTER & REPO
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[9px] font-mono">
              {team.track || 'Full-Stack Web'}
            </span>
          </div>

          {/* Members list */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">MEMBER ROSTER</div>
            <div className="flex flex-wrap gap-1.5">
              {team.members && team.members.length > 0 ? (
                team.members.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-[11px] font-medium"
                  >
                    👤 {m}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">👤 {team.leaderName || 'Solo Competitor'}</span>
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
                className="flex items-center gap-1.5 text-xs text-carnival-cyan hover:underline font-mono"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
              </a>
            )}

            {onStatusChange && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => onStatusChange(team._id, 'Safe')}
                  className="py-1 px-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 text-[9px] font-mono font-bold border border-emerald-500/40 transition-all text-center"
                >
                  🟢 Safe
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Danger')}
                  className="py-1 px-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 text-[9px] font-mono font-bold border border-orange-500/40 transition-all text-center"
                >
                  🟠 Danger
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Eliminated')}
                  className="py-1 px-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-[9px] font-mono font-bold border border-rose-500/40 transition-all text-center"
                >
                  🔴 Eliminated
                </button>
                <button
                  onClick={() => onStatusChange(team._id, 'Qualified')}
                  className="py-1 px-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 text-[9px] font-mono font-bold border border-blue-500/40 transition-all text-center"
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
