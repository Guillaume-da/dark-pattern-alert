const els = {
  welcome: document.querySelector("#welcomeState"),
  loading: document.querySelector("#loadingState"),
  error: document.querySelector("#errorState"),
  results: document.querySelector("#resultsState"),
  scanButton: document.querySelector("#scanButton"),
  retryButton: document.querySelector("#retryButton"),
  rescanButton: document.querySelector("#rescanButton"),
  settingsButton: document.querySelector("#settingsButton"),
  closeSettingsButton: document.querySelector("#closeSettingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  includeLowConfidence: document.querySelector("#includeLowConfidence"),
  autoHighlight: document.querySelector("#autoHighlight"),
  securityAnalysis: document.querySelector("#securityAnalysis"),
  mediaOwnership: document.querySelector("#mediaOwnership"),
  mediaCard: document.querySelector("#mediaCard"),
  mediaEyebrow: document.querySelector("#mediaEyebrow"),
  mediaName: document.querySelector("#mediaName"),
  mediaType: document.querySelector("#mediaType"),
  mediaOwner: document.querySelector("#mediaOwner"),
  mediaGroup: document.querySelector("#mediaGroup"),
  mediaFunding: document.querySelector("#mediaFunding"),
  mediaNote: document.querySelector("#mediaNote"),
  rememberSites: document.querySelector("#rememberSites"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  trustCard: document.querySelector("#trustCard"),
  trustBadge: document.querySelector("#trustBadge"),
  trustScore: document.querySelector("#trustScore"),
  trustTitle: document.querySelector("#trustTitle"),
  trustSummary: document.querySelector("#trustSummary"),
  trustSignals: document.querySelector("#trustSignals"),
  trustToggle: document.querySelector("#trustToggle"),
  highlightToggle: document.querySelector("#highlightToggle"),
  copyReportButton: document.querySelector("#copyReportButton"),
  loadingStep: document.querySelector("#loadingStep"),
  errorTitle: document.querySelector("#errorTitle"),
  errorMessage: document.querySelector("#errorMessage"),
  siteAvatar: document.querySelector("#siteAvatar"),
  siteName: document.querySelector("#siteName"),
  scanTime: document.querySelector("#scanTime"),
  scoreRing: document.querySelector("#scoreRing"),
  scoreValue: document.querySelector("#scoreValue"),
  riskLabel: document.querySelector("#riskLabel"),
  findingCount: document.querySelector("#findingCount"),
  scoreTitle: document.querySelector("#scoreTitle"),
  scoreSummary: document.querySelector("#scoreSummary"),
  filters: document.querySelector("#filters"),
  findingsList: document.querySelector("#findingsList"),
  findingsHeading: document.querySelector(".findings-heading"),
  visibleCount: document.querySelector("#visibleCount"),
  emptyResults: document.querySelector("#emptyResults"),
  disclaimer: document.querySelector(".disclaimer"),
  toast: document.querySelector("#toast")
};

const state = {
  report: null,
  trust: null,
  media: null,
  facts: null,
  activeTabId: null,
  filter: "all",
  loadingTimer: null,
  toastTimer: null
};

const KNOWN_HOSTS_KEY = "dpaKnownHosts";
const KNOWN_HOSTS_LIMIT = 500;

const categoryPresentation = {
  preselection: { label: "Choix précoché", icon: "✓" },
  urgency: { label: "Urgence", icon: "◷" },
  visual: { label: "Interface", icon: "◐" },
  cancellation: { label: "Abonnement", icon: "↻" }
};

const severityLabels = {
  high: "Élevé",
  medium: "Modéré",
  low: "Faible"
};

const setView = (view) => {
  for (const [name, element] of Object.entries({
    welcome: els.welcome,
    loading: els.loading,
    error: els.error,
    results: els.results
  })) {
    element.hidden = name !== view;
  }
};

const showToast = (message) => {
  window.clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
};

const getSettings = () => ({
  includeLowConfidence: els.includeLowConfidence.checked,
  highlightsEnabled: els.autoHighlight.checked
});

const persistSettings = async () => {
  await chrome.storage.local.set({
    dpaSettings: {
      includeLowConfidence: els.includeLowConfidence.checked,
      autoHighlight: els.autoHighlight.checked,
      securityAnalysis: els.securityAnalysis.checked,
      mediaOwnership: els.mediaOwnership.checked,
      rememberSites: els.rememberSites.checked
    }
  });
};

const loadSettings = async () => {
  const { dpaSettings } = await chrome.storage.local.get("dpaSettings");
  if (!dpaSettings) return;
  els.includeLowConfidence.checked = dpaSettings.includeLowConfidence !== false;
  els.autoHighlight.checked = dpaSettings.autoHighlight !== false;
  els.securityAnalysis.checked = dpaSettings.securityAnalysis !== false;
  els.mediaOwnership.checked = dpaSettings.mediaOwnership !== false;
  els.rememberSites.checked = dpaSettings.rememberSites !== false;
  els.highlightToggle.checked = els.autoHighlight.checked;
};

// Historique local et minimal : seuls les domaines explicitement analysés sont
// mémorisés, uniquement pour signaler une première visite.
const rememberHost = async (hostname) => {
  if (!hostname || !els.rememberSites.checked) return false;
  const stored = await chrome.storage.local.get(KNOWN_HOSTS_KEY);
  const known = Array.isArray(stored[KNOWN_HOSTS_KEY]) ? stored[KNOWN_HOSTS_KEY] : [];
  const firstVisit = !known.includes(hostname);
  if (firstVisit) {
    const next = [...known, hostname].slice(-KNOWN_HOSTS_LIMIT);
    await chrome.storage.local.set({ [KNOWN_HOSTS_KEY]: next });
  }
  return firstVisit;
};

const currentTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Aucun onglet actif n’a été trouvé.");
  return tab;
};

const isScannableUrl = (url = "") => /^(https?:|file:)/i.test(url);

const userFacingError = (error, url = "") => {
  const message = error instanceof Error ? error.message : String(error);
  if (!isScannableUrl(url) || /cannot access|chrome:\/\/|edge:\/\/|extensions gallery/i.test(message)) {
    return {
      title: "Cette page est protégée par Chrome",
      message: "Ouvrez un site web classique, puis cliquez de nouveau sur l’icône de l’extension."
    };
  }
  if (/receiving end does not exist|could not establish connection/i.test(message)) {
    return {
      title: "La page n’a pas répondu",
      message: "Rechargez la page, puis relancez l’analyse."
    };
  }
  return {
    title: "L’analyse n’a pas abouti",
    message: "La structure de cette page empêche peut-être son inspection. Vous pouvez réessayer après l’avoir rechargée."
  };
};

const startLoadingMessages = () => {
  const steps = [
    "Recherche des cases précochées",
    "Vérification des compteurs et messages d’urgence",
    "Comparaison des boutons et choix proposés",
    "Lecture des conditions d’abonnement",
    "Contrôle du domaine et du chiffrement"
  ];
  let index = 0;
  els.loadingStep.textContent = steps[index];
  window.clearInterval(state.loadingTimer);
  state.loadingTimer = window.setInterval(() => {
    index = (index + 1) % steps.length;
    els.loadingStep.textContent = steps[index];
  }, 650);
};

const stopLoadingMessages = () => {
  window.clearInterval(state.loadingTimer);
  state.loadingTimer = null;
};

const runScan = async () => {
  setView("loading");
  startLoadingMessages();
  let tab;

  try {
    tab = await currentTab();
    if (!isScannableUrl(tab.url)) throw new Error(`Cannot access ${tab.url || "this page"}`);
    state.activeTabId = tab.id;

    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content-overlay.css"]
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-scanner.js"]
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "DPA_SCAN",
      settings: getSettings()
    });

    if (!response?.ok || !response.report) {
      throw new Error(response?.error || "La page n’a pas renvoyé de rapport.");
    }

    state.report = response.report;
    state.trust = await runSecurityAnalysis(tab);
    state.media = els.mediaOwnership.checked
      ? globalThis.__dpaMediaOwnership.lookupMedia(response.report.url || tab.url)
      : null;
    state.filter = "all";
    els.highlightToggle.checked = els.autoHighlight.checked;
    renderReport();
    setView("results");
  } catch (error) {
    console.warn("Dark Pattern Alert:", error);
    const friendly = userFacingError(error, tab?.url);
    els.errorTitle.textContent = friendly.title;
    els.errorMessage.textContent = friendly.message;
    setView("error");
  } finally {
    stopLoadingMessages();
  }
};

// L’analyse de réputation reste locale : identité du domaine, transport et
// formulaires de la page. Aucun service externe n’est interrogé.
const runSecurityAnalysis = async (tab) => {
  if (!els.securityAnalysis.checked) return null;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["site-probe.js"]
    });
    const response = await chrome.tabs.sendMessage(tab.id, { type: "DPA_SITE_FACTS" });
    if (!response?.ok || !response.facts) throw new Error(response?.error || "Sonde indisponible");

    state.facts = response.facts;
    const firstVisit = await rememberHost(response.facts.hostname);
    return globalThis.__dpaReputationRules.buildTrustReport({
      url: response.facts.url || tab.url,
      facts: response.facts,
      firstVisit
    });
  } catch (error) {
    console.warn("Dark Pattern Alert (sécurité):", error);
    return null;
  }
};

const scorePresentation = (score) => {
  if (score >= 65) {
    return {
      label: "Risque élevé",
      color: "#c83d3d",
      summary: "Plusieurs signaux importants méritent votre attention avant de poursuivre."
    };
  }
  if (score >= 30) {
    return {
      label: "Risque modéré",
      color: "#b46b00",
      summary: "Certains choix semblent orientés. Prenez le temps de vérifier les détails."
    };
  }
  return {
    label: "Risque faible",
    color: "#39946d",
    summary: "Aucun procédé trompeur évident n’a été repéré sur cette page."
  };
};

const safeHostname = (report) => {
  if (report.hostname) return report.hostname.replace(/^www\./, "");
  try {
    return new URL(report.url).hostname.replace(/^www\./, "");
  } catch {
    return "Page analysée";
  }
};

const renderReport = () => {
  if (!state.report) return;
  const { report } = state;
  const hostname = safeHostname(report);
  const count = report.findings.length;
  const scoreInfo = scorePresentation(report.score);

  els.siteName.textContent = hostname || report.title || "Page analysée";
  els.siteAvatar.textContent = (hostname || "?").charAt(0);
  els.scanTime.textContent = `Analysée à ${new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(report.scannedAt))}`;
  els.scoreValue.textContent = report.score;
  els.scoreRing.style.setProperty("--score-angle", `${report.score * 3.6}deg`);
  els.scoreRing.style.setProperty("--score-color", scoreInfo.color);
  els.riskLabel.textContent = scoreInfo.label;
  els.riskLabel.style.color = scoreInfo.color;
  els.findingCount.textContent = count;
  els.scoreTitle.lastChild.textContent = count > 1 ? " signaux détectés" : " signal détecté";
  els.scoreSummary.textContent = scoreInfo.summary;

  renderTrust();
  renderMedia();
  renderFilters();
  renderFindings();
};

// Carte purement informative : elle décrit qui possède le média et comment il
// est financé, sans porter de jugement éditorial et sans peser sur les scores.
const renderMedia = () => {
  const media = state.media;
  els.mediaCard.hidden = !media;
  if (!media) return;

  els.mediaEyebrow.textContent = state.facts?.isArticle ? "Article de presse" : "Média identifié";
  els.mediaName.textContent = media.name;
  els.mediaType.textContent = media.typeLabel;
  els.mediaCard.dataset.type = media.type;
  els.mediaOwner.textContent = media.owner;
  els.mediaGroup.textContent = media.group;
  els.mediaFunding.textContent = media.funding;
  els.mediaNote.textContent = `Faits d’actionnariat et de financement, arrêtés en ${media.snapshot}. Aucune appréciation de la ligne éditoriale, aucun effet sur les scores ci-dessus. L’actionnariat des médias change souvent : vérifiez avant de conclure.`;
};

const TRUST_BADGES = { trusted: "✓", caution: "!", risky: "⚠" };

const renderTrust = () => {
  const trust = state.trust;
  els.trustCard.hidden = !trust;
  if (!trust) return;

  els.trustCard.dataset.level = trust.level;
  els.trustBadge.textContent = TRUST_BADGES[trust.level] || "?";
  els.trustScore.textContent = trust.score;
  els.trustTitle.textContent = trust.label;
  els.trustSummary.textContent = trust.summary;

  els.trustSignals.replaceChildren();
  for (const item of trust.signals) {
    const entry = document.createElement("li");
    entry.className = "trust-signal";
    entry.dataset.severity = item.severity;

    const label = document.createElement("p");
    label.className = "trust-signal-label";
    label.textContent = item.label;

    const detail = document.createElement("p");
    detail.className = "trust-signal-detail";
    detail.textContent = item.detail;

    entry.append(label, detail);
    els.trustSignals.append(entry);
  }

  const alerting = trust.alertCount > 0;
  els.trustSignals.hidden = !alerting;
  els.trustToggle.setAttribute("aria-expanded", String(alerting));
};

const renderFilters = () => {
  els.filters.replaceChildren();
  const counts = state.report.findings.reduce((accumulator, finding) => {
    accumulator[finding.category] = (accumulator[finding.category] || 0) + 1;
    return accumulator;
  }, {});

  const available = [
    { id: "all", label: `Tous · ${state.report.findings.length}` },
    ...Object.entries(counts).map(([id, count]) => ({
      id,
      label: `${categoryPresentation[id]?.label || id} · ${count}`
    }))
  ];

  for (const filter of available) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.filter = filter.id;
    button.setAttribute("aria-pressed", String(state.filter === filter.id));
    button.textContent = filter.label;
    button.addEventListener("click", () => {
      state.filter = filter.id;
      renderFilters();
      renderFindings();
    });
    els.filters.append(button);
  }
};

const createFindingCard = (finding) => {
  const card = document.createElement("article");
  card.className = "finding-card";
  card.dataset.severity = finding.severity;

  const topline = document.createElement("div");
  topline.className = "finding-topline";

  const icon = document.createElement("span");
  icon.className = "category-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = categoryPresentation[finding.category]?.icon || "!";

  const category = document.createElement("span");
  category.className = "finding-category";
  category.textContent = finding.categoryLabel || categoryPresentation[finding.category]?.label || finding.category;

  const severity = document.createElement("span");
  severity.className = "severity-pill";
  severity.textContent = severityLabels[finding.severity] || finding.severity;

  topline.append(icon, category, severity);

  const title = document.createElement("h3");
  title.textContent = finding.title;
  const detail = document.createElement("p");
  detail.className = "finding-detail";
  detail.textContent = finding.detail;
  const evidence = document.createElement("blockquote");
  evidence.className = "evidence";
  evidence.textContent = `« ${finding.evidence || "Élément sans libellé"} »`;

  const footer = document.createElement("div");
  footer.className = "finding-footer";
  const confidence = document.createElement("span");
  confidence.className = "confidence";
  confidence.textContent = `Confiance ${Math.round(finding.confidence * 100)} %`;
  const locate = document.createElement("button");
  locate.type = "button";
  locate.className = "locate-button";
  locate.textContent = "Voir dans la page →";
  locate.addEventListener("click", () => focusFinding(finding.id));
  footer.append(confidence, locate);

  card.append(topline, title, detail, evidence, footer);
  return card;
};

const renderFindings = () => {
  els.findingsList.replaceChildren();
  const findings = state.report.findings.filter(
    (finding) => state.filter === "all" || finding.category === state.filter
  );

  for (const finding of findings) {
    els.findingsList.append(createFindingCard(finding));
  }

  const hasAny = state.report.findings.length > 0;
  els.findingsHeading.hidden = !hasAny;
  els.filters.hidden = !hasAny;
  els.emptyResults.hidden = hasAny;
  els.disclaimer.hidden = !hasAny;
  els.visibleCount.textContent = `${findings.length} affiché${findings.length > 1 ? "s" : ""}`;
};

const sendToActivePage = async (message) => {
  const tab = await currentTab();
  state.activeTabId = tab.id;
  return chrome.tabs.sendMessage(tab.id, message);
};

const focusFinding = async (id) => {
  try {
    els.highlightToggle.checked = true;
    await sendToActivePage({ type: "DPA_SET_HIGHLIGHTS", enabled: true });
    const response = await sendToActivePage({ type: "DPA_FOCUS", id });
    if (!response?.ok) showToast("L’élément n’est plus présent dans la page");
  } catch {
    showToast("Rechargez l’analyse pour retrouver cet élément");
  }
};

const reportAsText = () => {
  const { report, trust } = state;
  const lines = [
    "DARK PATTERN ALERT",
    `${safeHostname(report)} — score ${report.score}/100`,
    `${report.findings.length} signal${report.findings.length > 1 ? "aux" : ""} détecté${report.findings.length > 1 ? "s" : ""}`,
    ""
  ];

  if (state.media) {
    const { media } = state;
    lines.push(
      `ÉDITEUR — ${media.name} (${media.typeLabel})`,
      `   Propriétaire : ${media.owner}`,
      `   Groupe : ${media.group}`,
      `   Financement : ${media.funding}`,
      `   Faits arrêtés en ${media.snapshot}, sans appréciation de la ligne éditoriale.`,
      ""
    );
  }

  if (trust) {
    lines.push(`RÉPUTATION ET SÉCURITÉ — ${trust.score}/100 · ${trust.label}`);
    for (const item of trust.signals) {
      if (item.weight === 0) continue;
      lines.push(`   - ${item.label} : ${item.detail}`);
    }
    if (trust.alertCount === 0) lines.push("   - Aucune anomalie relevée par les vérifications locales.");
    lines.push("");
  }
  report.findings.forEach((finding, index) => {
    lines.push(
      `${index + 1}. [${severityLabels[finding.severity]}] ${finding.title}`,
      `   ${finding.detail}`,
      `   Indice : « ${finding.evidence} »`,
      ""
    );
  });
  lines.push("Analyse indicative réalisée localement par Dark Pattern Alert.", report.url);
  return lines.join("\n");
};

els.scanButton.addEventListener("click", runScan);
els.retryButton.addEventListener("click", runScan);
els.rescanButton.addEventListener("click", runScan);

els.settingsButton.addEventListener("click", () => {
  const open = els.settingsPanel.hidden;
  els.settingsPanel.hidden = !open;
  els.settingsButton.setAttribute("aria-expanded", String(open));
});

els.closeSettingsButton.addEventListener("click", () => {
  els.settingsPanel.hidden = true;
  els.settingsButton.setAttribute("aria-expanded", "false");
});

els.includeLowConfidence.addEventListener("change", persistSettings);
els.securityAnalysis.addEventListener("change", persistSettings);
els.mediaOwnership.addEventListener("change", persistSettings);
els.rememberSites.addEventListener("change", persistSettings);

els.trustToggle.addEventListener("click", () => {
  const open = els.trustSignals.hidden;
  els.trustSignals.hidden = !open;
  els.trustToggle.setAttribute("aria-expanded", String(open));
});

els.clearHistoryButton.addEventListener("click", async () => {
  await chrome.storage.local.remove(KNOWN_HOSTS_KEY);
  showToast("Domaines mémorisés effacés");
});

els.autoHighlight.addEventListener("change", async () => {
  await persistSettings();
  els.highlightToggle.checked = els.autoHighlight.checked;
  if (!state.report) return;
  try {
    await sendToActivePage({ type: "DPA_SET_HIGHLIGHTS", enabled: els.autoHighlight.checked });
  } catch {
    // A navigation may have replaced the scanned page; the next scan will reapply the setting.
  }
});

els.highlightToggle.addEventListener("change", async () => {
  try {
    await sendToActivePage({ type: "DPA_SET_HIGHLIGHTS", enabled: els.highlightToggle.checked });
  } catch {
    showToast("Relancez l’analyse sur cette page");
  }
});

els.copyReportButton.addEventListener("click", async () => {
  if (!state.report) return;
  try {
    await navigator.clipboard.writeText(reportAsText());
    showToast("Rapport copié");
  } catch {
    showToast("Impossible de copier le rapport");
  }
});

loadSettings().catch(() => {
  // Les valeurs par défaut restent actives si le stockage n’est pas disponible.
});
