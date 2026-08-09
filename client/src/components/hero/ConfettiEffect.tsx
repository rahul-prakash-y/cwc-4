import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export const triggerCarnivalConfetti = () => {
  const getConfettiInstance = () => {
    if (typeof confetti === 'function') return confetti;
    if (typeof (confetti as any)?.default === 'function') return (confetti as any).default;
    if (typeof (window as any)?.confetti === 'function') return (window as any).confetti;
    return null;
  };

  const confettiFn = getConfettiInstance();
  if (!confettiFn) {
    console.warn('Confetti module not available in current environment');
    return;
  }

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
    useWorker: false, // Run directly on main thread to avoid CSP blob worker blocked on hosted sites (Render)
    disableForReducedMotion: true,
    colors: ['#FF0055', '#FFD700', '#00F0FF', '#8A2BE2', '#39FF14', '#FF7700'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    try {
      confettiFn({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch (err) {
      console.warn('Failed to fire confetti burst:', err);
    }
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const ConfettiEffect: React.FC = () => {
  const triggerConfetti = useCallback(() => {
    triggerCarnivalConfetti();
  }, []);

  useEffect(() => {
    // Initial celebration burst after brief mount delay
    const timer = setTimeout(() => {
      triggerCarnivalConfetti();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Continuous background confetti bits
  const ambientBits = Array.from({ length: 30 });
  const colors = ['#FF0055', '#FFD700', '#00F0FF', '#8A2BE2', '#39FF14'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {ambientBits.map((_, idx) => {
        const color = colors[idx % colors.length];
        const left = `${(idx * 3.3 + (idx % 7) * 2) % 95}%`;
        const size = 6 + (idx % 8);
        const duration = 12 + (idx % 10);
        const delay = (idx * 0.4) % 8;

        return (
          <motion.div
            key={idx}
            initial={{ y: '-5vh', opacity: 0, rotate: 0 }}
            animate={{
              y: ['-5vh', '105vh'],
              x: [0, (idx % 2 === 0 ? 30 : -30), 0],
              opacity: [0, 0.9, 0.9, 0],
              rotate: [0, 360 * (idx % 2 === 0 ? 1 : -1)],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
              delay,
            }}
            style={{
              left,
              width: size,
              height: size * (idx % 3 === 0 ? 2 : 1),
              backgroundColor: color,
              borderRadius: idx % 4 === 0 ? '50%' : idx % 2 === 0 ? '2px' : '0px',
              boxShadow: `0 0 8px ${color}`,
            }}
            className="absolute opacity-80"
          />
        );
      })}
    </div>
  );
};
