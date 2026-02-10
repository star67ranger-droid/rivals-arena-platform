/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                rivals: {
                    darker: '#020617',
                    dark: '#0f172a',
                    card: '#1e293b',
                    accent: '#8b5cf6', // Violet 500
                    neon: '#22d3ee', // Cyan 400
                    hot: '#f43f5e', // Rose 500
                    surface: 'rgba(30, 41, 59, 0.5)',
                }
            },
            backgroundImage: {
                'grid-pattern': "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
            },
            animation: {
                'glow-pulse': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        }
    },
    plugins: [],
}
