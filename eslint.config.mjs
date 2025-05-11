import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Ignore Prisma generated files and other non-user code
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/prisma/client/**",
      "**/.prisma/**",
      "**/src/generated/**",
      "**/.vercel/**"
    ]
  },
  {
    // Apply these rules to all JavaScript/TypeScript files
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Allow unused variables when prefixed with underscore
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      // Temporarily allow any types while in development
      "@typescript-eslint/no-explicit-any": "warn",
      // Prevent missing prop-types validation in React components
      "react/prop-types": "off",
      // Ignore NextJS specific routing behavior that causes false positives
      "@next/next/no-html-link-for-pages": "off"
    }
  }
];

export default eslintConfig;
