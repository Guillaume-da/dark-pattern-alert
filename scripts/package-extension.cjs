// Archive à téléverser sur le Chrome Web Store.
// N'embarque que ce que l'extension exécute : ni tests, ni captures, ni
// scripts de build, ni dépendances de développement.
//
//   node scripts/package-extension.cjs

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { crc32 } = require("node:zlib");

const extensionRoot = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));
const outputDir = path.join(extensionRoot, "store");
const archiveName = `dark-pattern-alert-${manifest.version}.zip`;
const archivePath = path.join(outputDir, archiveName);

// Liste explicite plutôt qu'une exclusion : un fichier oublié ne part pas
// par accident chez Google.
const SHIPPED = [
  "manifest.json",
  "background.js",
  "content-scanner.js",
  "content-overlay.css",
  "detector-rules.js",
  "reputation-rules.js",
  "media-ownership.js",
  "site-probe.js",
  "sidepanel.html",
  "sidepanel.js",
  "sidepanel.css",
  "icons"
];

const missing = SHIPPED.filter((entry) => !fs.existsSync(path.join(extensionRoot, entry)));
if (missing.length > 0) {
  console.error(`Fichiers absents : ${missing.join(", ")}`);
  process.exit(1);
}

// Contrôles que le Chrome Web Store applique de toute façon, autant les voir ici.
const problems = [];
if (manifest.description.length > 132) {
  problems.push(`description : ${manifest.description.length} caractères, maximum 132`);
}
if (manifest.name.length > 75) {
  problems.push(`name : ${manifest.name.length} caractères, maximum 75`);
}
for (const size of ["16", "32", "48", "128"]) {
  if (!manifest.icons?.[size]) problems.push(`icône ${size} absente du manifeste`);
}
if (problems.length > 0) {
  console.error(`Manifeste non conforme :\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.rmSync(archivePath, { force: true });

// Écriture de l'archive sans dépendance ni binaire externe : le format ZIP
// tient en un en-tête par fichier, un répertoire central et un final record.
const collect = (entry) => {
  const absolute = path.join(extensionRoot, entry);
  if (!fs.statSync(absolute).isDirectory()) return [entry];
  return fs
    .readdirSync(absolute)
    .sort()
    .flatMap((child) => collect(path.posix.join(entry, child)));
};

const files = SHIPPED.flatMap(collect);
const chunks = [];
const directory = [];
let offset = 0;

for (const name of files) {
  const content = fs.readFileSync(path.join(extensionRoot, name));
  const deflated = zlib.deflateRawSync(content, { level: 9 });
  const compressed = deflated.length < content.length;
  const payload = compressed ? deflated : content;
  const nameBytes = Buffer.from(name, "utf8");
  const checksum = crc32(content);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version minimale
  local.writeUInt16LE(0x0800, 6); // noms encodés en UTF-8
  local.writeUInt16LE(compressed ? 8 : 0, 8);
  local.writeUInt32LE(0, 10); // horodatage neutralisé : archive reproductible
  local.writeUInt32LE(checksum, 14);
  local.writeUInt32LE(payload.length, 18);
  local.writeUInt32LE(content.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  chunks.push(local, nameBytes, payload);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(compressed ? 8 : 0, 10);
  central.writeUInt32LE(0, 12);
  central.writeUInt32LE(checksum, 16);
  central.writeUInt32LE(payload.length, 20);
  central.writeUInt32LE(content.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  central.writeUInt32LE(offset, 42);
  directory.push(central, nameBytes);

  offset += local.length + nameBytes.length + payload.length;
}

const centralBuffer = Buffer.concat(directory);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuffer.length, 12);
end.writeUInt32LE(offset, 16);

fs.writeFileSync(archivePath, Buffer.concat([...chunks, centralBuffer, end]));

const sizeKb = (fs.statSync(archivePath).size / 1024).toFixed(1);
console.log(`${archiveName} — ${sizeKb} Ko, ${files.length} fichiers`);
for (const name of files) console.log(`  ${name}`);
console.log(`\nÀ téléverser dans « Package » de la fiche : ${archivePath}`);
