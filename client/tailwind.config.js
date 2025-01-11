import { purge } from "../server/src/routes";

export default {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-yellow": "#f0f099", // Add a custom yellow color
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
