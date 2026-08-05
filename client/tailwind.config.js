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
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'carnival-gradient': 'linear-gradient(135deg, #FF0055 0%, #8A2BE2 50%, #00F0FF 100%)',
        'carnival-glow': 'radial-gradient(circle at 50% 0%, rgba(255, 0, 85, 0.25), transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
