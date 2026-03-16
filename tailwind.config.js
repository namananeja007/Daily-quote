/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 10px 35px rgba(255, 255, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
