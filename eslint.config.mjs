import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const noDirectFetch = {
  selector: "CallExpression[callee.name='fetch']",
  message:
    "Keep external I/O in services/api and consume it through feature-local query options.",
};

const noMemberFetch = {
  selector: "CallExpression[callee.type='MemberExpression'][callee.property.name='fetch']",
  message:
    "Keep external I/O in services/api and consume it through feature-local query options.",
};

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
  {
    files: [
      "app/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "providers/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": ["error", noDirectFetch, noMemberFetch],
    },
  },
  {
    files: ["app/**/page.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        noDirectFetch,
        noMemberFetch,
        {
          selector: "ExpressionStatement[directive='use client']",
          message:
            "Route pages must remain Server Components; move interactivity into a smaller Client Component.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".vercel/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
