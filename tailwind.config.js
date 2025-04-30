/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'jasper': '#1b4079',
          'dark': '#24252D',
          'gray-light': '#f7f7f7',
          'gray-dark': '#1e1e1e',
          'internet-blue': "#648eef",
          'internet-blue-hover': "#336AEA",
          'sidebar-bg': '#24252D',
          'white/5': 'rgba(255, 255, 255, 0.05)',
          'white/10': 'rgba(255, 255, 255, 0.1)',
          'white/20': 'rgba(255, 255, 255, 0.2)',
          'white/80': 'rgba(255, 255, 255, 0.8)',
        },
        fontFamily: {
          gilroy: ['Gilroy', 'sans-serif'],
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  