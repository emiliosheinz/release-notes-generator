module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [0, "always", 50],
    "type-enum": [
      2,
      "always",
      [
        "docs",
        "feat",
        "fix",
        "refactor",
        "revert",
        "style",
        "chore",
        "ci",
        "test",
      ],
    ],
  },
  "scope-case": [2, "always", "lower-case"],
  "subject-case": [2, "always", "lower-case", "start-case"],
};
