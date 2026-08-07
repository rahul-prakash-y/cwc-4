/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cwc-bg': '#05050A',
        'cwc-surface': 'rgba(255, 255, 255, 0.03)',
        'cwc-gold': '#FFD700',
        'cwc-red': '#E11D48',
        'cwc-purple': '#8B5CF6',
        carnival: {
          dark: '#05050A',
          card: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.1)',
          crimson: '#E11D48',
          gold: '#FFD700',
          purple: '#8B5CF6',
          cyan: '#00F0FF',
          amber: '#FF7700',
          pink: '#FF007F',
          lime: '#39FF14',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'carnival-gradient': 'linear-gradient(135deg, #E11D48 0%, #8B5CF6 50%, #FFD700 100%)',
        'carnival-glow': 'radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.25), transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FF7700 100%)',
        'red-gradient': 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
        'purple-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #00F0FF 0%, #8B5CF6 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-reverse': 'floatReverse 5s ease-in-out infinite',
        'light-twinkle': 'twinkle 1.5s infinite ease-in-out alternate',
        'marquee': 'marquee 25s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-2deg)' },
        },
        twinkle: {
          '0%': { opacity: '0.3', filter: 'brightness(0.8)' },
          '100%': { opacity: '1', filter: 'brightness(1.5)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-red': '0 0 20px rgba(225, 29, 72, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        'neon-crimson': '0 0 20px rgba(225, 29, 72, 0.5), 0 0 40px rgba(225, 29, 72, 0.25)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.25)',
        'neon-lime': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.25)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
