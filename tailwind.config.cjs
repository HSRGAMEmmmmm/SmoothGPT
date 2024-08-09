/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#fff', 
        secondary: '#F9F9F9', 
        warningHover: '#e56865',
        warning: '#c23e45',
        good3: '#96c561',
        good2: '#4889fe',
        good: '#2563eb',
        hover: '#2b3038',
        hover2: '#333943',
        chat: '#454c5a',
        themegreen:"#4A928C",
        themegrey:"#505860",
        themegreylight:"#ABABAB",
        themegreyhover:"#EBEDED"

      },
            opacity: {
        'hover': '.2',
      }
    }
  },
  plugins: []
};
