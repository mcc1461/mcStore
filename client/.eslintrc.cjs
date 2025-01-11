module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended", // Ensure Prettier rules are integrated
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect", // Automatically detect the React version
    },
  },
  plugins: [
    "react-refresh", // Useful if you're using React Fast Refresh in development
    "prettier",
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "prettier/prettier": "error", // Enforce Prettier rules as errors
    "react/prop-types": "off", // Disable prop-types if using TypeScript
    "no-console": "warn", // Warn about console.log usage
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Ignore unused variables starting with "_"
  },
  ignorePatterns: ["dist", "node_modules", "*.config.js"], // Ignore build and config files
};
