---
paths:
  - ".github/**"
---

# GitHub Actions / CI

- **Pin actions by tag, not SHA:** `uses: actions/checkout@v4`, `uses: oven-sh/setup-bun@v2`, never a 40-char hex SHA. This repo's existing workflows are all tag-pinned — don't flag it as a security issue or propose SHA pinning.
