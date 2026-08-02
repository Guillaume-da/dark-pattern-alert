// Icônes de l'extension, aux quatre tailles exigées par le manifeste.
// Même signe que la pastille du panneau : bouclier coché sur dégradé ambre.
//
//   node scripts/build-icons.cjs

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const extensionRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(extensionRoot, "icons");

fs.mkdirSync(outputRoot, { recursive: true });

// Le rayon et l'épaisseur du trait suivent la taille : à 16 px, un tracé fin
// et un arrondi calculés en proportion deviennent illisibles.
const icon = (size) => {
  const radius = Math.round(size * 0.225);
  const inset = size * 0.2;
  const stroke = Math.max(1.5, size * 0.075);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body { width: ${size}px; height: ${size}px; overflow: hidden; }
    .tile {
      width: ${size}px; height: ${size}px; border-radius: ${radius}px;
      background: linear-gradient(180deg, #FFD84D 0%, #F0B400 100%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 ${Math.max(0.5, size * 0.008)}px 0 rgba(255,255,255,.55);
    }
    svg { width: ${size - inset * 2}px; height: ${size - inset * 2}px; display: block; }
  </style></head><body>
    <div class="tile">
      <svg viewBox="0 0 24 24" fill="none" stroke="#3A2C00"
           stroke-width="${(stroke * 24) / (size - inset * 2)}"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2.6 20 6v5.7c0 5-3.4 8.3-8 9.7-4.6-1.4-8-4.7-8-9.7V6l8-3.4Z" />
        <path d="m8.4 12.2 2.2 2.2 5.1-5.1" />
      </svg>
    </div>
  </body></html>`;
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const size of [16, 32, 48, 128]) {
      const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
      await page.setContent(icon(size), { waitUntil: "load" });
      await page.screenshot({ path: path.join(outputRoot, `icon-${size}.png`), omitBackground: true });
      await page.close();
      console.log(`icon-${size}.png`);
    }
    console.log(`\nIcônes écrites dans ${outputRoot}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
