CONFIG-PROJEK — MSNC PEOPLEHUB
==============================
Folder rasmi untuk fail .json konfigurasi & data seed sistem.

JANGAN anggap fail di sini sebagai sampah — semua disenaraikan dalam
manifest-fail-penting.json

================================================================================
FAIL DALAM FOLDER INI
================================================================================

  manifest-fail-penting.json  — Senarai SEMUA fail kritikal projek (BACA DULU)
  auth-defaults.json          — Mock users Phase 1 (admin/hr/staff)
  app-settings.json           — Nama app, company default, port dev
  security-config.json        — Idle lock, session days (parity Depoh)
  env.example                 — Template .env — salin ke root sebagai .env.local
  eslint.config.mjs           — Konfig lint

================================================================================
ROOT PROJEK — FAIL WAJIB (npm/Next)
================================================================================

  package.json, package-lock.json, tsconfig.json
  next.config.ts, next-env.d.ts, postcss.config.mjs
  README.md (pintasan pendek sahaja)

  Txt panduan → panduan/  |  Docx → docs/

================================================================================
CARA GUNA env.example
================================================================================

  copy config-projek\env.example .env.local

================================================================================
RUJUKAN
================================================================================

  panduan/PANDUAN-DEPLOY.txt