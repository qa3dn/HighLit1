/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        text: {
          DEFAULT: '#ffffff',
          secondary: '#a0a0a0',
        },
        accent: {
          DEFAULT: '#00ff41',
          hover: '#00cc33',
          dark: '#00aa2a',
        },
        gray: {
          light: '#1a1a1a',
          DEFAULT: '#2a2a2a',
          dark: '#333333',
        },
        border: '#333333',
        terminal: {
          bg: '#000000',
          text: '#ffffff',
          'text-secondary': '#a0a0a0',
          accent: '#00ff41',
          gray: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.7)',
        'hover': '0 12px 40px rgba(0, 255, 65, 0.2)',
        'glow': '0 0 20px rgba(0, 255, 65, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}
