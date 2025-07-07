/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./*.html"],
    theme: {
        extend: {
            colors: {
                brand: '#FF6B6B',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    },
    plugins: []
};