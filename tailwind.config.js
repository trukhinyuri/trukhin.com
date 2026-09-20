module.exports = {
  purge: ['./src/**/*.{html,js}', './src/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'midnight-indigo': '#1E1A78',
        'deep-indigo': '#4B0082',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}