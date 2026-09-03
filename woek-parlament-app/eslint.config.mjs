import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "*.tsbuildinfo"] },
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-irregular-whitespace": "error",
      ...nextPlugin.configs["core-web-vitals"].rules
    }
  }
];
