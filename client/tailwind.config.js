export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-yellow": "#f0f099", // Custom yellow color
      },
    },
  },
  plugins: [require("@tailwindcss/forms")], // ✅ Ensure this exists
};
