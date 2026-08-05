import React, { useEffect, useRef } from 'react';
import { useGrandFinale } from '../../context/GrandFinaleContext';

export const GrandFinaleFX: React.FC = () => {
  const { isGrandFinale } = useGrandFinale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isGrandFinale) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fireworks particle system
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.size = Math.random() * 3 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Gravity effect
        this.alpha -= 0.015;
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    class Firework {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      exploded: boolean;
      particles: Particle[];
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = Math.random() * (height * 0.5) + 80;
        this.vy = - (Math.random() * 4 + 7);
        this.exploded = false;
        this.particles = [];
        const goldShades = ['#FFD700', '#FFA500', '#FFE5B4', '#FFF5EE', '#F0E68C', '#E6C200'];
        this.color = goldShades[Math.floor(Math.random() * goldShades.length)];
      }

      update() {
        if (!this.exploded) {
          this.y += this.vy;
          if (this.y <= this.targetY || this.vy >= 0) {
            this.exploded = true;
            const particleCount = Math.floor(Math.random() * 30) + 40;
            for (let i = 0; i < particleCount; i++) {
              this.particles.push(new Particle(this.x, this.y, this.color));
            }
          }
        } else {
          this.particles.forEach((p) => p.update());
          this.particles = this.particles.filter((p) => p.alpha > 0);
        }
      }

      draw(context: CanvasRenderingContext2D) {
        if (!this.exploded) {
          context.save();
          context.fillStyle = this.color;
          context.beginPath();
          context.arc(this.x, this.y, 3, 0, Math.PI * 2);
          context.fill();
          context.restore();
        } else {
          this.particles.forEach((p) => p.draw(context));
        }
      }
    }

    let fireworks: Firework[] = [];

    const loop = () => {
      ctx.fillStyle = 'rgba(11, 10, 22, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Random firework spawn rate
      if (Math.random() < 0.08) {
        fireworks.push(new Firework());
      }

      fireworks.forEach((fw) => {
        fw.update();
        fw.draw(ctx);
      });

      fireworks = fireworks.filter((fw) => !fw.exploded || fw.particles.length > 0);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGrandFinale]);

  if (!isGrandFinale) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Dynamic Gold Sweeping Spotlights */}
      <div className="absolute -top-40 -left-20 w-[500px] h-[800px] bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent blur-3xl transform -rotate-45 animate-spotlight-left" />
      <div className="absolute -top-40 -right-20 w-[500px] h-[800px] bg-gradient-to-bl from-amber-300/20 via-yellow-400/10 to-transparent blur-3xl transform rotate-45 animate-spotlight-right" />

      {/* Continuous Gold Fireworks Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
