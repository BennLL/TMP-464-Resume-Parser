/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        bounce200: "bounce 1s infinite 0.2s",
        bounce400: "bounce 1s infinite 0.4s",
      },
    }
  },
  plugins: [],
};

