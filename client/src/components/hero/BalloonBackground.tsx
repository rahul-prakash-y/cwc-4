import React from 'react';
import { motion } from 'framer-motion';

interface Balloon {
  id: number;
  color: string;
  size: number;
  left: string;
  duration: number;
  delay: number;
  stringLength: number;
  label?: string;
}

export const BalloonBackground: React.FC = () => {
  const balloons: Balloon[] = [
    { id: 1, color: '#FF0055', size: 54, left: '5%', duration: 16, delay: 0, stringLength: 60, label: '🎪' },
    { id: 2, color: '#FFD700', size: 68, left: '15%', duration: 22, delay: 2, stringLength: 80, label: '🏆' },
    { id: 3, color: '#00F0FF', size: 48, left: '82%', duration: 18, delay: 1, stringLength: 50, label: '⚡' },
    { id: 4, color: '#8A2BE2', size: 60, left: '92%', duration: 20, delay: 4, stringLength: 70, label: '👑' },
    { id: 5, color: '#39FF14', size: 42, left: '25%', duration: 24, delay: 3, stringLength: 45, label: '🔥' },
    { id: 6, color: '#FF7700', size: 52, left: '75%', duration: 19, delay: 5, stringLength: 55, label: '🎡' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          initial={{ y: '110vh', x: 0, opacity: 0.8 }}
          animate={{
            y: ['105vh', '-20vh'],
            x: [0, Math.sin(b.id) * 40, -Math.sin(b.id) * 30, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            y: {
              duration: b.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: b.delay,
            },
            x: {
              duration: 6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
            rotate: {
              duration: 4,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          }}
          style={{ left: b.left }}
          className="absolute flex flex-col items-center pointer-events-auto cursor-pointer group"
          whileHover={{ scale: 1.25 }}
        >
          {/* Balloon Body */}
          <div
            className="relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
            style={{
              width: b.size,
              height: b.size * 1.2,
              background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${b.color} 40%, #0B0A16 100%)`,
              boxShadow: `0 8px 25px ${b.color}66, inset -2px -4px 10px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Glossy Highlight */}
            <div className="absolute top-2 left-2.5 w-3 h-4 bg-white/60 rounded-full blur-[1px] transform -rotate-45" />

            {/* Icon inside balloon */}
            {b.label && <span className="text-sm select-none drop-shadow-md">{b.label}</span>}

            {/* Balloon Knot */}
            <div
              className="absolute -bottom-2 w-2.5 h-2.5 rotate-45"
              style={{ backgroundColor: b.color }}
            />
          </div>

          {/* Balloon Wavy String */}
          <svg
            width="2"
            height={b.stringLength}
            className="stroke-slate-400/50 opacity-80"
          >
            <path
              d={`M1,0 Q5,${b.stringLength / 3} 1,${(b.stringLength / 3) * 2} T1,${b.stringLength}`}
              fill="none"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
