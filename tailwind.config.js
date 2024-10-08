/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
      animation: {
        'linear': 'moveline 6s linear forwards',
      },
      transition:{
        'ease': '10s ease'
      }
  },
  plugins: [],
}
}
