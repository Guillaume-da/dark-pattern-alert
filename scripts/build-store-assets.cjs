// Assets de la fiche Chrome Web Store, aux dimensions exigées par Google.
// Les visuels reprennent les captures du panneau produites par capture-docs.cjs
// et le système visuel de l'extension : fond clair, accent ambre, polices SF.
//
//   node scripts/build-store-assets.cjs
//
// Produit store/assets/ : cinq captures 1280x800, une tuile promo 440x280 et
// une bannière 1400x560.

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const extensionRoot = path.resolve(__dirname, "..");
const shotsRoot = path.join(extensionRoot, "docs", "screenshots");
const outputRoot = path.join(extensionRoot, "store", "assets");

fs.mkdirSync(outputRoot, { recursive: true });

const dataUri = (file) =>
  `data:image/png;base64,${fs.readFileSync(path.join(shotsRoot, file)).toString("base64")}`;

const iconUri = `data:image/png;base64,${fs
  .readFileSync(path.join(extensionRoot, "icons", "icon-128.png"))
  .toString("base64")}`;

const SHELL = `
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1280px; height: 800px; display: flex; align-items: center;
    background: radial-gradient(120% 120% at 12% 0%, #FFF8E2 0%, #F7F7F9 46%, #EFEFF2 100%);
    font-family: -apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
    color: #1D1D1F; -webkit-font-smoothing: antialiased; overflow: hidden;
  }
  .copy { width: 560px; padding: 0 0 0 92px; display: flex; flex-direction: column; gap: 20px; }
  .eyebrow {
    font-size: 15px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #8A6100;
    display: flex; align-items: center; gap: 10px;
  }
  .eyebrow span { width: 9px; height: 9px; border-radius: 5px; background: #F0B400; }
  h1 { font-size: 46px; line-height: 1.1; letter-spacing: -.025em; font-weight: 600; text-wrap: pretty; }
  p { font-size: 19px; line-height: 1.5; color: #55555A; text-wrap: pretty; }
  ul { display: flex; flex-direction: column; gap: 11px; padding: 0; list-style: none; }
  li { font-size: 17px; color: #3C3C41; display: flex; align-items: flex-start; gap: 11px; line-height: 1.4; }
  li b { font-weight: 600; color: #1D1D1F; }
  .tick {
    flex: none; width: 21px; height: 21px; margin-top: 1px; border-radius: 11px; color: #3A2C00;
    background: linear-gradient(180deg, #FFD84D, #F0B400); display: flex;
    align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
  }
  .stage { flex: 1; display: flex; align-items: center; justify-content: center; height: 100%; position: relative; }
  .panel {
    border-radius: 18px; border: .5px solid rgba(0,0,0,.16);
    box-shadow: 0 30px 70px rgba(20,20,25,.22), 0 2px 6px rgba(0,0,0,.1);
    overflow: hidden; background: #fff;
  }
  .panel img { display: block; width: 390px; }
  .card {
    border-radius: 16px; box-shadow: 0 26px 60px rgba(20,20,25,.2), 0 2px 6px rgba(0,0,0,.08);
    overflow: hidden; background: #fff; border: .5px solid rgba(0,0,0,.12);
  }
  .card img { display: block; width: 430px; }
`;

const feature = ({ eyebrow, title, lead, bullets = [], visual }) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>${SHELL}</style></head>
<body>
  <div class="copy">
    <div class="eyebrow"><span></span>${eyebrow}</div>
    <h1>${title}</h1>
    <p>${lead}</p>
    ${bullets.length ? `<ul>${bullets.map((item) => `<li><i class="tick">✓</i><div>${item}</div></li>`).join("")}</ul>` : ""}
  </div>
  <div class="stage">${visual}</div>
</body></html>`;

const cropped = (file, height) => `
  <div class="panel" style="height:${height}px">
    <img src="${dataUri(file)}" alt="" />
  </div>`;

const card = (file) => `<div class="card"><img src="${dataUri(file)}" alt="" /></div>`;

const screens = [
  {
    name: "01-rapport.png",
    html: feature({
      eyebrow: "Analyse locale, à la demande",
      title: "Cette page essaie-t-elle de vous influencer&nbsp;?",
      lead:
        "Un clic sur l’icône, et le panneau explique ce que la page tente d’obtenir de vous — sans rien envoyer à personne.",
      bullets: [
        "<b>Choix précochés</b> et options commerciales activées par défaut",
        "<b>Compteurs d’urgence</b>, formulations culpabilisantes, boutons déséquilibrés",
        "<b>Frais ajoutés</b> après le prix annoncé, résiliation piégée"
      ],
      visual: cropped("04-analysis-results.png", 700)
    })
  },
  {
    name: "02-reputation.png",
    html: feature({
      eyebrow: "Réputation et sécurité",
      title: "À qui parlez-vous vraiment&nbsp;?",
      lead:
        "Le domaine, le chiffrement et les formulaires sont vérifiés dans votre navigateur. Aucun service de réputation externe n’est interrogé.",
      bullets: [
        "Imitations de marque et domaines <b>presque</b> identiques",
        "Mot de passe ou carte bancaire demandés <b>hors HTTPS</b>",
        "Formulaires qui postent vers un <b>autre domaine</b>"
      ],
      visual: card("05-site-reputation.png")
    })
  },
  {
    name: "03-medias.png",
    html: feature({
      eyebrow: "Sur les sites de presse",
      title: "Qui possède le média que vous lisez&nbsp;?",
      lead:
        "Propriétaire, groupe et mode de financement, pour une soixantaine de titres français et internationaux. Des faits, pas une opinion.",
      bullets: [
        "Aucune étiquette politique, aucune note de ligne éditoriale",
        "Capitaux privés, service public, coopérative, association",
        "Sans effet sur les autres scores"
      ],
      visual: card("07-media-ownership.png")
    })
  },
  {
    name: "04-resiliation.png",
    html: feature({
      eyebrow: "Sur plusieurs pages",
      title: "Combien de pages pour résilier&nbsp;?",
      lead:
        "Une résiliation étalée sur cinq pages est un obstacle en soi, invisible page par page. Le panneau récapitule les étapes.",
      bullets: [
        "Les compteurs sont <b>comparés d’une visite à l’autre</b>",
        "Un décompte qui se réarme devient un constat, plus un soupçon",
        "Seules les pages que vous analysez sont retenues"
      ],
      visual: card("08-cancellation-journey.png")
    })
  },
  {
    name: "05-confidentialite.png",
    html: feature({
      eyebrow: "Vie privée",
      title: "Rien ne sort de votre navigateur.",
      lead:
        "Pas de serveur, pas de compte, pas de télémétrie. L’extension ne surveille pas votre navigation : elle n’analyse une page que si vous le lui demandez.",
      bullets: [
        "Quatre permissions&nbsp;: <b>activeTab, scripting, sidePanel, storage</b>",
        "Chaque fonction qui mémorise quelque chose est désactivable",
        "Un bouton efface toutes les données locales"
      ],
      visual: card("06-settings.png")
    })
  }
];

const promoTile = `
<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 440px; height: 280px; padding: 30px 32px; display: flex; flex-direction: column;
    justify-content: center; gap: 14px; overflow: hidden;
    background: radial-gradient(130% 130% at 100% 0%, #FFE9A3 0%, #F7F7F9 52%, #EDEDF0 100%);
    font-family: -apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; color: #1D1D1F;
    -webkit-font-smoothing: antialiased;
  }
  img { width: 54px; height: 54px; border-radius: 13px; box-shadow: 0 6px 16px rgba(180,130,0,.28); }
  h1 { font-size: 27px; line-height: 1.1; letter-spacing: -.02em; font-weight: 600; }
  p { font-size: 14px; line-height: 1.45; color: #55555A; }
  .tag { font-size: 11.5px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #8A6100; }
</style></head>
<body>
  <img src="${iconUri}" alt="" />
  <h1>Dark Pattern Alert</h1>
  <p>Repère les interfaces trompeuses et explique le risque, page par page.</p>
  <div class="tag">Analyse locale · aucune donnée envoyée</div>
</body></html>`;

const marquee = `
<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1400px; height: 560px; display: flex; align-items: center; gap: 64px; padding: 0 92px; overflow: hidden;
    background: radial-gradient(110% 140% at 8% 0%, #FFF3CF 0%, #F7F7F9 48%, #EAEAEE 100%);
    font-family: -apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; color: #1D1D1F;
    -webkit-font-smoothing: antialiased;
  }
  .copy { flex: 1; display: flex; flex-direction: column; gap: 22px; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand img { width: 58px; height: 58px; border-radius: 14px; box-shadow: 0 8px 20px rgba(180,130,0,.3); }
  .brand div { font-size: 24px; font-weight: 600; letter-spacing: -.01em; }
  h1 { font-size: 54px; line-height: 1.08; letter-spacing: -.03em; font-weight: 600; max-width: 15ch; }
  p { font-size: 21px; line-height: 1.45; color: #55555A; max-width: 46ch; }
  .tag { font-size: 14px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #8A6100; }
  .shots { display: flex; gap: 26px; align-items: flex-start; }
  .shots div {
    border-radius: 16px; overflow: hidden; border: .5px solid rgba(0,0,0,.14); background: #fff;
    box-shadow: 0 28px 64px rgba(20,20,25,.22);
  }
  .shots img { display: block; width: 300px; }
  .shots div { height: 400px; }
  .shots div:first-child { transform: translateY(-26px); }
  .shots div:last-child { height: auto; transform: translateY(64px); }
</style></head>
<body>
  <div class="copy">
    <div class="brand"><img src="${iconUri}" alt="" /><div>Dark Pattern Alert</div></div>
    <h1>Voyez ce que la page cherche à obtenir.</h1>
    <p>Choix précochés, faux compteurs, frais de dernière minute, résiliation piégée, domaines qui imitent une marque : le panneau explique chaque signal.</p>
    <div class="tag">Analyse locale · aucune donnée envoyée</div>
  </div>
  <div class="shots">
    <div><img src="${dataUri("04-analysis-results.png")}" alt="" /></div>
    <div><img src="${dataUri("07-media-ownership.png")}" alt="" /></div>
  </div>
</body></html>`;

const shoot = async (browser, { html, name, width, height }) => {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: path.join(outputRoot, name) });
  await page.close();
  return name;
};

(async () => {
  const missing = ["04-analysis-results.png", "05-site-reputation.png", "06-settings.png", "07-media-ownership.png", "08-cancellation-journey.png"].filter(
    (file) => !fs.existsSync(path.join(shotsRoot, file))
  );
  if (missing.length > 0) {
    throw new Error(`Captures manquantes : ${missing.join(", ")}. Lancez d’abord « npm run capture ».`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const screen of screens) {
      console.log(`1280×800  ${await shoot(browser, { ...screen, width: 1280, height: 800 })}`);
    }
    console.log(`440×280   ${await shoot(browser, { html: promoTile, name: "promo-tile-440x280.png", width: 440, height: 280 })}`);
    console.log(`1400×560  ${await shoot(browser, { html: marquee, name: "marquee-1400x560.png", width: 1400, height: 560 })}`);
    console.log(`\nAssets écrits dans ${outputRoot}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
