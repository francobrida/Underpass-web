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
        background: '#0a0a0a', // Dark industrial background
        surface: '#121212', // Slightly lighter for cards/panels
        border: '#2a2a2a', // Industrial border color
        accent: {
          DEFAULT: '#8b5cf6', // Neon Violet (Violeta eléctrico)
          hover: '#7c3aed',
        },
        text: {
          primary: '#f3f4f6e4',
          secondary: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
