import fs from "fs";
const t = fs.readFileSync("src/lib/modules.ts", "utf8");
const keys = [...t.matchAll(/^  (?:"([^"]+)"|([a-z][a-z0-9-]*)): \{/gm)].map(
  (m) => m[1] || m[2]
);
const primaries = [...t.matchAll(/primaryAction: "([^"]+)"/g)].map((m) => m[1]);
console.log(JSON.stringify({
  totalModules: keys.length,
  customPrimaryAction: primaries,
  defaultAddNew: keys.length - primaries.length,
  digitalFileOwnPage: 1,
  usersAddUser: 1,
  feedbackSend: 1,
  modulePageViewButtons: keys.length - 1, // digital-file has own page
}, null, 2));
