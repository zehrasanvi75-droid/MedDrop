/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        tactical: {
          950: '#060a12',
          900: '#0c1322',
          850: '#111b2f',
          800: '#17233d',
          700: '#233458',
          600: '#354c7d',
        },
        emergency: {
          critical: '#ef4444',
          'critical-bg': '#fef2f2',
          'critical-border': '#fecaca',
          high: '#f59e0b',
          'high-bg': '#fffbeb',
          'high-border': '#fde68a',
          moderate: '#3b82f6',
          'moderate-bg': '#eff6ff',
          'moderate-border': '#bfdbfe',
          success: '#10b981',
          'success-bg': '#ecfdf5',
          'success-border': '#a7f3d0',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 3s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
