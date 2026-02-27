/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ["./src/**/*.{jsx,tsx}", "./*.html"],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                surface: "var(--surface)",
                surfaceHover: "var(--surface-hover)",
                primary: "var(--primary)",
                primaryHover: "var(--primary-hover)",
                danger: "var(--danger)",
                text: "var(--text)",
                textSecondary: "var(--text-secondary)",
                border: "var(--border)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                'google': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                'google-hover': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
            },
            animation: {
                "up-down": "up-down 2s ease-in-out infinite alternate",
            },
        },
    },
    plugins: [],
}
