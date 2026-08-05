/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carnival: {
          dark: '#0B0A16',
          card: '#151329',
          border: '#2A264D',
          crimson: '#FF0055',
          gold: '#FFD700',
          purple: '#8A2BE2',
          cyan: '#00F0FF',
          amber: '#FF7700',
          pink: '#FF007F',
          lime: '#39FF14',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'carnival-gradient': 'linear-gradient(135deg, #FF0055 0%, #8A2BE2 50%, #00F0FF 100%)',
        'carnival-glow': 'radial-gradient(circle at 50% 0%, rgba(255, 0, 85, 0.25), transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FF7700 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)',
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
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        'neon-crimson': '0 0 20px rgba(255, 0, 85, 0.5), 0 0 40px rgba(255, 0, 85, 0.25)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.25)',
        'neon-lime': '0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.25)',
      },
    },
  },
  plugins: [],
}
