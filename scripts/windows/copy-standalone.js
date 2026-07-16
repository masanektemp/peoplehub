/**
 * Salin static assets ke folder standalone selepas build.
 * Diperlukan untuk output: "standalone" pada Windows Server.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(standalone)) {
  console.error("Standalone folder tidak dijumpai. Jalankan npm run build dahulu.");
  process.exit(1);
}

copyDir(staticSrc, staticDest);
if (fs.existsSync(publicSrc)) copyDir(publicSrc, publicDest);

console.log("Standalone package siap di .next/standalone/");