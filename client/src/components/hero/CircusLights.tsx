import React from 'react';

export const CircusLights: React.FC = () => {
  const bulbs = Array.from({ length: 24 });
  const colors = ['#FF0055', '#FFD700', '#00F0FF', '#8A2BE2', '#39FF14', '#FF7700'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Banner String Lights */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-around px-4 z-20 border-b border-white/10 bg-black/30 backdrop-blur-md">
        {bulbs.map((_, i) => {
          const color = colors[i % colors.length];
          const delay = (i * 0.15).toFixed(2);
          return (
            <div
              key={i}
              className="relative flex flex-col items-center"
            >
              {/* Wire */}
              <div className="w-[1px] h-3 bg-slate-600/50" />
              {/* Bulb */}
              <div
                className="w-3.5 h-3.5 rounded-full animate-light-twinkle shadow-lg"
                style={{
                  backgroundColor: color,
                  color: color,
                  animationDelay: `${delay}s`,
                  boxShadow: `0 0 12px ${color}, 0 0 24px ${color}`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Moving Ambient Carnival Orbs */}
      <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-carnival-crimson/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-carnival-purple/25 rounded-full blur-[140px] animate-float-slow" />
      <div className="absolute -bottom-32 left-10 w-[550px] h-[550px] bg-carnival-cyan/20 rounded-full blur-[130px] animate-float-reverse" />
      
      {/* Radial Spotlight Overlay */}
      <div className="absolute inset-0 bg-carnival-glow opacity-80" />

      {/* Grid Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} 
      />
    </div>
  );
};
