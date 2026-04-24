import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Claude-like palette
        claude: {
          cream: '#FAF9F7',
          'cream-dark': '#F0EDE6',
          sidebar: '#1C1C1C',
          'sidebar-hover': '#2A2A2A',
          'sidebar-text': '#E8E8E8',
          'sidebar-muted': '#9CA3AF',
          amber: '#D97706',
          'amber-hover': '#B45309',
          border: '#E5E0D8',
          muted: '#6B6B6B',
        }

      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-dot': 'pulse 1.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
      }
    }
  },
  plugins: []
}
export default config
