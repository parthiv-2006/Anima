/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['\"Space Grotesk\"', 'system-ui', 'sans-serif']
      },
      colors: {
        ember: '#ff6347',
        aqua: '#3da9fc',
        terra: '#7cc576'
      }
    }
  },
  plugins: []
};
