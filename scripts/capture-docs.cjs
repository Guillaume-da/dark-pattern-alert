const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const extensionRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(extensionRoot, "..");
const outputRoot = path.join(extensionRoot, "docs", "screenshots");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png"
};

fs.mkdirSync(outputRoot, { recursive: true });

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const requestedPath = path.resolve(projectRoot, relativePath || "index.html");

  if (!requestedPath.startsWith(projectRoot)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(requestedPath, (statError, stats) => {
    const filePath = !statError && stats.isDirectory() ? path.join(requestedPath, "index.html") : requestedPath;
    fs.readFile(filePath, (readError, contents) => {
      if (readError) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
      response.end(contents);
    });
  });
});

const listen = () =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });

const closeServer = () => new Promise((resolve) => server.close(resolve));

const renderResults = async (page, report) => {
  await page.evaluate((data) => {
    const categoryMeta = {
      preselection: { label: "Choix précoché", icon: "✓" },
      urgency: { label: "Urgence", icon: "◷" },
      visual: { label: "Interface", icon: "◐" },
      cancellation: { label: "Abonnement", icon: "↻" }
    };
    const severityLabels = { high: "Élevé", medium: "Modéré", low: "Faible" };
    const select = (selector) => document.querySelector(selector);

    select("#welcomeState").hidden = true;
    select("#loadingState").hidden = true;
    select("#errorState").hidden = true;
    select("#resultsState").hidden = false;
    select("#siteName").textContent = "slowgood.demo";
    select("#siteAvatar").textContent = "S";
    select("#scanTime").textContent = "Analysée à l’instant";
    select("#scoreValue").textContent = data.score;
    select("#scoreRing").style.setProperty("--score-angle", `${data.score * 3.6}deg`);
    select("#scoreRing").style.setProperty("--score-color", data.score >= 65 ? "#c83d3d" : "#b46b00");
    select("#riskLabel").textContent = data.score >= 65 ? "Risque élevé" : "Risque modéré";
    select("#riskLabel").style.color = data.score >= 65 ? "#c83d3d" : "#b46b00";
    select("#findingCount").textContent = data.findings.length;
    select("#scoreTitle").lastChild.textContent = " signaux détectés";
    select("#scoreSummary").textContent = "Plusieurs signaux importants méritent votre attention avant de poursuivre.";

    const filters = select("#filters");
    filters.replaceChildren();
    const counts = data.findings.reduce((result, finding) => {
      result[finding.category] = (result[finding.category] || 0) + 1;
      return result;
    }, {});
    const filterItems = [
      ["Tous", data.findings.length],
      ...Object.entries(counts).map(([category, count]) => [categoryMeta[category]?.label || category, count])
    ];
    filterItems.forEach(([label, count], index) => {
      const button = document.createElement("button");
      button.className = "filter-button";
      button.setAttribute("aria-pressed", String(index === 0));
      button.textContent = `${label} · ${count}`;
      filters.append(button);
    });

    const list = select("#findingsList");
    list.replaceChildren();
    data.findings.forEach((finding) => {
      const card = document.createElement("article");
      card.className = "finding-card";
      card.dataset.severity = finding.severity;

      const topline = document.createElement("div");
      topline.className = "finding-topline";
      const icon = document.createElement("span");
      icon.className = "category-icon";
      icon.textContent = categoryMeta[finding.category]?.icon || "!";
      const category = document.createElement("span");
      category.className = "finding-category";
      category.textContent = finding.categoryLabel;
      const severity = document.createElement("span");
      severity.className = "severity-pill";
      severity.textContent = severityLabels[finding.severity];
      topline.append(icon, category, severity);

      const title = document.createElement("h3");
      title.textContent = finding.title;
      const detail = document.createElement("p");
      detail.className = "finding-detail";
      detail.textContent = finding.detail;
      const evidence = document.createElement("blockquote");
      evidence.className = "evidence";
      evidence.textContent = `« ${finding.evidence} »`;
      const footer = document.createElement("div");
      footer.className = "finding-footer";
      footer.innerHTML = `<span class="confidence">Confiance ${Math.round(finding.confidence * 100)} %</span><span class="locate-button">Voir dans la page →</span>`;
      card.append(topline, title, detail, evidence, footer);
      list.append(card);
    });
    select("#visibleCount").textContent = `${data.findings.length} affichés`;
    select("#emptyResults").hidden = true;
  }, report);
};

(async () => {
  const port = await listen();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const panel = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await panel.goto(`${baseUrl}/dark-pattern-alert/sidepanel.html`, { waitUntil: "networkidle" });
    await panel.screenshot({ path: path.join(outputRoot, "01-extension-welcome.png") });

    const demo = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await demo.goto(`${baseUrl}/dark-pattern-alert/demo/`, { waitUntil: "networkidle" });
    await demo.screenshot({ path: path.join(outputRoot, "02-demo-page.png") });

    await demo.evaluate(() => {
      globalThis.chrome = { runtime: { onMessage: { addListener: () => {} } } };
    });
    await demo.addStyleTag({ path: path.join(extensionRoot, "content-overlay.css") });
    await demo.addScriptTag({ path: path.join(extensionRoot, "detector-rules.js") });
    await demo.addScriptTag({ path: path.join(extensionRoot, "content-scanner.js") });
    const report = await demo.evaluate(() =>
      globalThis.__darkPatternAlertScanner.scan({ includeLowConfidence: true, highlightsEnabled: true })
    );

    await demo.evaluate(() => document.querySelector("dialog")?.close());
    await demo.evaluate(() =>
      globalThis.__darkPatternAlertScanner.scan({ includeLowConfidence: true, highlightsEnabled: true })
    );
    await demo.screenshot({ path: path.join(outputRoot, "03-page-highlights.png"), fullPage: true });

    await renderResults(panel, report);
    await panel.screenshot({ path: path.join(outputRoot, "04-analysis-results.png"), fullPage: true });

    console.log(`Captures générées : ${outputRoot}`);
    console.log(`Signaux utilisés dans le rapport : ${report.findings.length}, score ${report.score}/100`);
  } finally {
    await browser.close();
    await closeServer();
  }
})().catch(async (error) => {
  console.error(error);
  await closeServer();
  process.exitCode = 1;
});
