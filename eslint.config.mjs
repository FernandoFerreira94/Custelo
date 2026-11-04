import next from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...next,
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/db/migrations/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "docs/pranchas/**",
    ],
  },
  {
    rules: {
      // Quality Gates, Gate 1: sem `any`, sem cast desnecessario.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Gate 1: sem console.log esquecido.
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // Componentes vindos do registry @webcode: o codigo e da biblioteca e um
    // `--overwrite` refaz o arquivo, entao nao se corrige regra de lint nele.
    files: ["src/components/ui/**"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    // ADR-001/002: a camada de dominio nao conhece framework nem fornecedor.
    // Esta e a fronteira que impede a "dilucao de fronteiras" citada no ADR-001.
    files: ["src/domain/**/*.ts", "src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "react",
                "react-dom",
                "@supabase/*",
                "inngest",
                "inngest/*",
                "drizzle-orm",
                "drizzle-orm/*",
                "posthog-js",
                "@sentry/*",
                "dexie",
              ],
              message:
                "Dominio e aplicacao nao importam framework nem SDK de fornecedor. Use uma porta de src/ports (Architecture Freeze).",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
