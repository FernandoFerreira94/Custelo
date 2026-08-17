/**
 * Conventional Commits — Quality Gates, Gate 6 (Git).
 * Escopos = modulos do Module Map + superficies do Architecture Freeze.
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        // superficies
        "ops",
        "web",
        "saas",
        // modulos de dominio (Module Map, 12 bounded contexts)
        "tenancy",
        "estrutura",
        "pessoas",
        "contatos",
        "importacao",
        "recebimento",
        "custodia",
        "retirada",
        "devolucao",
        "auditoria",
        "relatorios",
        "billing",
        // transversais
        "ui",
        "db",
        "infra",
        "ci",
        "docs",
        "deps",
        "config",
      ],
    ],
    "subject-case": [0],
  },
};

export default config;
