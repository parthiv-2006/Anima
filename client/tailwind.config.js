/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif']
      },
      colors: {
        background: '#0d1117',
        nav: 'rgba(10,14,20,0.98)',
        sidebar: 'rgba(10,14,20,0.6)',
        topbar: 'rgba(13,17,23,0.95)',
        surface: '#1a2236',
        surfaceElevated: 'rgba(26,34,54,0.7)',
        borderSubtle: 'rgba(255,255,255,0.06)',
        textPrimary: '#f0e6cc',
        textMuted: '#6b7280',
        accentAmber: '#e8a020',
        accentRust: '#c44f2a',
        statSTR: '#e8a020',
        statINT: '#3b82f6',
        statSPI: '#22c55e',
        success: '#22c55e'
      },
      boxShadow: {
        'glow-amber': '0 0 8px rgba(232,160,32,0.4)',
        'glow-rust': '0 0 8px rgba(196,79,42,0.4)',
        'glow-blue': '0 0 8px rgba(59,130,246,0.4)',
        'glow-green': '0 0 8px rgba(34,197,94,0.4)'
      }
    }
  },
  plugins: []
};
