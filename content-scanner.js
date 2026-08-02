(() => {
  if (globalThis.__darkPatternAlertScanner) return;

  const MAX_TEXT_NODES = 2600;
  const MAX_FINDINGS = 40;
  const HIGHLIGHT_CLASS = "dpa-alerted-element";
  const FOCUS_CLASS = "dpa-focused-element";

  const CATEGORY_META = {
    preselection: "Choix précoché",
    urgency: "Urgence artificielle",
    visual: "Interface trompeuse",
    cancellation: "Abonnement et résiliation"
  };

  const state = {
    findings: [],
    elements: new Map(),
    highlightsEnabled: true,
    sequence: 0
  };

  const compact = (value = "") =>
    String(value)
      // Certaines pages exposent du balisage sous forme de texte (contenu de
      // noscript, gabarits de chargement diff\u00e9r\u00e9) : il ne doit ni d\u00e9clencher
      // une d\u00e9tection ni se retrouver cit\u00e9 comme preuve.
      .replace(/<[^>]{1,300}>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\u00a0/g, " ")
      .trim();

  const lower = (value = "") => compact(value).toLocaleLowerCase("fr");

  const isVisible = (element) => {
    if (!(element instanceof Element)) return false;
    const style = getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number.parseFloat(style.opacity || "1") < 0.08
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 2 && rect.height > 2;
  };

  const elementText = (element, limit = 260) => {
    if (!(element instanceof Element)) return "";
    const parts = [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element instanceof HTMLInputElement ? element.value : "",
      element.textContent
    ];
    return compact(parts.filter(Boolean).join(" ")).slice(0, limit);
  };

  const nearbyText = (element, limit = 700) => {
    const ownLabel =
      element instanceof HTMLInputElement && element.labels
        ? [...element.labels].map((label) => label.textContent).join(" ")
        : "";

    let cursor = element;
    let best = compact(`${ownLabel} ${elementText(element, limit)}`);
    for (let depth = 0; depth < 3 && cursor?.parentElement; depth += 1) {
      cursor = cursor.parentElement;
      const candidate = elementText(cursor, limit);
      if (candidate.length > best.length) best = candidate;
      if (best.length >= limit * 0.7) break;
    }
    return best.slice(0, limit);
  };

  const collectTextCandidates = () => {
    const root = document.body || document.documentElement;
    if (!root) return [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const candidates = [];
    const usefulTags = new Set([
      "A",
      "BUTTON",
      "DIV",
      "LABEL",
      "LI",
      "P",
      "SMALL",
      "SPAN",
      "STRONG",
      "TD",
      "TIME"
    ]);

    let visited = 0;
    while (walker.nextNode() && visited < MAX_TEXT_NODES) {
      visited += 1;
      const element = walker.currentNode;
      if (!usefulTags.has(element.tagName) || !isVisible(element)) continue;
      // `textContent` absorbe le contenu des balises style et script : sans ce
      // filtre, des règles CSS embarquées passent pour du texte de la page.
      if (element.querySelector("style, script, noscript, template")) continue;
      if (element.childElementCount > 5 && !["DIV", "LI", "TD"].includes(element.tagName)) continue;
      const text = elementText(element, 520);
      if (text.length >= 3 && text.length <= 520) candidates.push(element);
    }
    return candidates;
  };

  const clearPageMarks = () => {
    for (const element of state.elements.values()) {
      if (!element?.isConnected) continue;
      element.classList.remove(HIGHLIGHT_CLASS, FOCUS_CLASS);
      element.removeAttribute("data-dpa-severity");
    }
    state.elements.clear();
  };

  const setHighlights = (enabled) => {
    state.highlightsEnabled = Boolean(enabled);
    for (const finding of state.findings) {
      const element = state.elements.get(finding.id);
      if (!element?.isConnected) continue;
      element.classList.toggle(HIGHLIGHT_CLASS, state.highlightsEnabled);
      if (state.highlightsEnabled) {
        element.setAttribute("data-dpa-severity", finding.severity);
      } else {
        element.removeAttribute("data-dpa-severity");
      }
    }
  };

  const addFinding = ({
    category,
    title,
    detail,
    evidence,
    severity = "medium",
    confidence = 0.7,
    element
  }) => {
    if (!element || state.findings.length >= MAX_FINDINGS) return;

    const duplicate = state.findings.some(
      (finding) => finding.category === category && state.elements.get(finding.id) === element
    );
    if (duplicate) return;

    state.sequence += 1;
    const id = `dpa-${Date.now().toString(36)}-${state.sequence}`;
    const rect = element.getBoundingClientRect();
    const finding = {
      id,
      category,
      categoryLabel: CATEGORY_META[category],
      title,
      detail,
      evidence: compact(evidence).slice(0, 220),
      severity,
      confidence: Math.max(0, Math.min(1, confidence)),
      location: {
        x: Math.round(rect.x),
        y: Math.round(rect.y + window.scrollY)
      }
    };

    state.findings.push(finding);
    state.elements.set(id, element);
  };

  const scanPreselectedChoices = () => {
    const sensitiveChoice =
      /newsletter|marketing|partenaire|offre|promotion|assurance|garantie|don|tip|pourboire|abonnement|subscribe|renew|membership|communications?|emails?|sms/i;

    for (const checkbox of document.querySelectorAll('input[type="checkbox"]')) {
      if (!checkbox.checked || checkbox.disabled || !isVisible(checkbox)) continue;
      const context = nearbyText(checkbox);
      const isSensitive = sensitiveChoice.test(context);
      addFinding({
        category: "preselection",
        title: isSensitive ? "Option commerciale activée par défaut" : "Choix activé avant votre décision",
        detail: isSensitive
          ? "Une option susceptible d’ajouter un engagement ou des communications est déjà cochée."
          : "La case est cochée par défaut. Vérifiez qu’elle correspond bien à votre intention.",
        evidence: context || "Case cochée",
        severity: isSensitive ? "high" : "medium",
        confidence: isSensitive ? 0.94 : 0.82,
        element: checkbox.labels?.[0] || checkbox
      });
    }
  };

  const scanUrgency = (textCandidates) => {
    const timerPattern = /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b|\b\d{1,2}\s*(?:min(?:ute)?s?|sec(?:onde)?s?)\b/i;
    const urgencyPattern =
      /expire|expiration|se termine|derni[eè]re chance|plus que|temps restant|offre limit[eé]e|\bvite\b|d[eé]p[eê]chez|\bleft\b|ends? in|last chance|limited time|\bhurry\b|deal ends/i;
    const commercialPattern =
      /panier|commande|paiement|checkout|acheter|prix|promo|r[eé]duction|order|payment|buy|discount|sale/i;

    const explicitTimers = document.querySelectorAll(
      '[role="timer"], time, [class*="countdown" i], [id*="countdown" i], [class*="timer" i], [id*="timer" i]'
    );
    const candidates = new Set(explicitTimers);
    for (const element of textCandidates) {
      const text = elementText(element);
      if (timerPattern.test(text)) candidates.add(element);
    }

    // « Temps de lecture : 3 min » n’est pas un décompte commercial, et son
    // icône porte souvent une classe contenant « timer ».
    const readingTimePattern = /temps de lecture|min(?:ute)?s? de lecture|reading time|lecture\s*:\s*\d/i;
    const clockPattern = /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b/;
    const durationPattern = /\b\d{1,2}\s*(?:min(?:ute)?s?|sec(?:onde)?s?)\b/i;

    for (const element of candidates) {
      if (!isVisible(element)) continue;
      const ownText = elementText(element);
      // Un compteur affiche lui-même son décompte. Sans cette exigence, une
      // icône décorative suffisait à signaler toute la carte qui l’entoure.
      const hasClock = clockPattern.test(ownText);
      const hasDuration = durationPattern.test(ownText);
      if (!hasClock && !hasDuration) continue;
      const context = nearbyText(element);
      if (readingTimePattern.test(context)) continue;
      const marker = lower(`${element.id} ${element.className || ""} ${element.getAttribute("role") || ""}`);
      const explicitMarker = /countdown|timer/.test(marker) || element.getAttribute("role") === "timer";
      // « 3 min » désigne le plus souvent une durée de lecture ou de trajet.
      // Cette forme n’est retenue que dans un contexte à la fois pressant et
      // marchand, même sur un élément marqué « timer ».
      if (!hasClock && !(urgencyPattern.test(context) && commercialPattern.test(context))) continue;
      if (!explicitMarker && !urgencyPattern.test(context)) continue;

      const commercial = commercialPattern.test(context);
      addFinding({
        category: "urgency",
        title: "Compteur d’urgence à vérifier",
        detail:
          "Un décompte peut créer une pression artificielle. Rechargez la page ou revenez plus tard pour vérifier s’il repart à zéro.",
        evidence: ownText || context,
        severity: commercial ? "high" : "medium",
        confidence: explicitMarker ? 0.84 : 0.66,
        element
      });
    }
  };

  const controlLabel = (element) => elementText(element, 120);

  const scanMisleadingControls = () => {
    const controls = [...document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]')]
      .filter(isVisible)
      .filter((element) => controlLabel(element).length > 0);

    const confirmShaming =
      /non merci.*(?:payer|[eé]conom|offre|avantage|argent|risque)|je pr[eé]f[eè]re.*(?:payer|rater|perdre|rester)|non.*je (?:n['’]en )?veux pas|no thanks.*(?:pay|save|offer|money)|i(?:'|’)d rather.*(?:pay|miss|lose)|i don(?:'|’)t want/i;

    for (const control of controls) {
      const label = controlLabel(control);
      // Un libellé de refus tient en quelques mots. Au-delà, on lit un titre
      // d’article ou un paragraphe cliquable, pas un bouton culpabilisant.
      if (label.length > 90 || !confirmShaming.test(label)) continue;
      addFinding({
        category: "visual",
        title: "Refus formulé pour culpabiliser",
        detail:
          "Le libellé du refus porte un jugement sur votre choix au lieu de proposer une option neutre.",
        evidence: label,
        severity: "high",
        confidence: 0.94,
        element: control
      });
    }

    const acceptPattern =
      /^(tout accepter|accepter|j['’]?accepte|continuer|confirmer|oui|s['’]?abonner|acheter|commander|accept all|agree|continue|confirm|yes|subscribe|buy|place order)$/i;
    const rejectPattern =
      /^(refuser|tout refuser|non merci|plus tard|continuer sans|param[eè]tres|reject|decline|no thanks|not now|continue without|manage settings)$/i;
    const containers = [
      ...document.querySelectorAll(
        'form, dialog, [role="dialog"], [class*="modal" i], [class*="cookie" i], [id*="cookie" i], [class*="consent" i], [id*="consent" i]'
      )
    ].filter(isVisible);

    const processedPairs = new Set();
    for (const container of containers) {
      const localControls = controls.filter((control) => container.contains(control)).slice(0, 12);
      const accept = localControls.find((control) => acceptPattern.test(lower(controlLabel(control))));
      const reject = localControls.find((control) => rejectPattern.test(lower(controlLabel(control))));
      if (!accept || !reject || accept === reject) continue;

      const pairKey = `${controlLabel(accept)}::${controlLabel(reject)}::${Math.round(reject.getBoundingClientRect().y)}`;
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const acceptRect = accept.getBoundingClientRect();
      const rejectRect = reject.getBoundingClientRect();
      const acceptStyle = getComputedStyle(accept);
      const rejectStyle = getComputedStyle(reject);
      const acceptArea = acceptRect.width * acceptRect.height;
      const rejectArea = rejectRect.width * rejectRect.height;
      let asymmetry = 0;

      if (acceptArea > rejectArea * 1.45) asymmetry += 1;
      if (Number.parseFloat(acceptStyle.fontWeight) > Number.parseFloat(rejectStyle.fontWeight) + 150) asymmetry += 1;
      if (Number.parseFloat(rejectStyle.opacity || "1") < Number.parseFloat(acceptStyle.opacity || "1") - 0.2) asymmetry += 1;
      if (
        acceptStyle.backgroundColor !== rejectStyle.backgroundColor &&
        /rgba?\(0, 0, 0(?:, 0)?\)|transparent/.test(rejectStyle.backgroundColor)
      ) {
        asymmetry += 1;
      }

      if (asymmetry < 2) continue;
      addFinding({
        category: "visual",
        title: "Choix présentés de manière déséquilibrée",
        detail:
          "L’option favorable au site est nettement plus visible que l’alternative, ce qui peut orienter la décision.",
        evidence: `« ${controlLabel(accept)} » mis en avant face à « ${controlLabel(reject)} »`,
        severity: "medium",
        confidence: Math.min(0.92, 0.68 + asymmetry * 0.07),
        element: reject
      });
    }
  };

  const scanCancellationFriction = (textCandidates) => {
    const frictionPattern =
      /(?:r[eé]sili(?:er|ation)|annuler (?:votre )?abonnement).{0,110}(?:appel(?:er)?|t[eé]l[eé]phon|contacter|service client|courrier|lettre recommand[eé]e)|(?:appel(?:er)?|t[eé]l[eé]phon|contacter|service client|courrier|lettre recommand[eé]e).{0,110}(?:r[eé]sili(?:er|ation)|annuler (?:votre )?abonnement)|(?:cancel(?:lation)?|end your subscription).{0,110}(?:call|phone|contact support|mail|letter)|(?:call|phone|contact support|mail a letter).{0,110}(?:cancel(?:lation)?|end your subscription)/i;
    const autoRenewPattern =
      /renouvel(?:lement|[eé]e?)\s+automatique|reconduit(?:e)?\s+automatiquement|automatically renew|auto[- ]?renew|charged automatically after|factur[eé].{0,50}(?:apr[eè]s|[àa] la fin).{0,40}(?:essai|p[eé]riode)/i;
    const onlineBlockPattern =
      /impossible de r[eé]silier en ligne|ne peut pas [eê]tre r[eé]sili[eé] en ligne|cannot (?:be )?cancel(?:led)? online|no online cancellation/i;

    for (const element of textCandidates) {
      const text = elementText(element, 520);
      if (frictionPattern.test(text) || onlineBlockPattern.test(text)) {
        addFinding({
          category: "cancellation",
          title: "Résiliation soumise à une démarche supplémentaire",
          detail:
            "Le texte semble imposer un appel, un contact ou un courrier au lieu d’une résiliation directe en ligne.",
          evidence: text,
          severity: "high",
          confidence: onlineBlockPattern.test(text) ? 0.96 : 0.88,
          element
        });
        continue;
      }

      if (autoRenewPattern.test(text)) {
        addFinding({
          category: "cancellation",
          title: "Renouvellement ou facturation automatique",
          detail:
            "L’engagement peut continuer automatiquement. Vérifiez la date, le prix futur et la méthode de résiliation avant d’accepter.",
          evidence: text,
          severity: "medium",
          confidence: 0.87,
          element
        });
      }
    }
  };

  const calculateScore = (findings) => {
    const weights = { high: 22, medium: 12, low: 6 };
    const base = findings.reduce(
      (total, finding) => total + weights[finding.severity] * (0.55 + finding.confidence * 0.45),
      0
    );
    const categoryBonus = Math.max(0, new Set(findings.map((finding) => finding.category)).size - 1) * 4;
    return Math.min(100, Math.round(base + categoryBonus));
  };

  const buildSummary = (findings) => {
    const categories = {};
    const severities = { high: 0, medium: 0, low: 0 };
    for (const finding of findings) {
      categories[finding.category] = (categories[finding.category] || 0) + 1;
      severities[finding.severity] += 1;
    }
    return { categories, severities };
  };

  const scan = (settings = {}) => {
    clearPageMarks();
    state.findings = [];
    state.sequence = 0;
    state.highlightsEnabled = settings.highlightsEnabled !== false;

    const textCandidates = collectTextCandidates();
    scanPreselectedChoices();
    scanUrgency(textCandidates);
    scanMisleadingControls();
    scanCancellationFriction(textCandidates);

    if (settings.includeLowConfidence === false) {
      const retained = state.findings.filter((finding) => finding.confidence >= 0.72);
      const retainedIds = new Set(retained.map((finding) => finding.id));
      for (const [id, element] of state.elements) {
        if (!retainedIds.has(id)) state.elements.delete(id);
        if (!element?.isConnected) state.elements.delete(id);
      }
      state.findings = retained;
    }

    state.findings.sort((a, b) => {
      const rank = { high: 3, medium: 2, low: 1 };
      return rank[b.severity] - rank[a.severity] || b.confidence - a.confidence;
    });
    setHighlights(state.highlightsEnabled);

    return {
      url: location.href,
      hostname: location.hostname,
      title: document.title,
      scannedAt: new Date().toISOString(),
      score: calculateScore(state.findings),
      summary: buildSummary(state.findings),
      findings: state.findings
    };
  };

  const focusFinding = (id) => {
    const element = state.elements.get(id);
    if (!element?.isConnected) return false;
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    element.classList.add(HIGHLIGHT_CLASS, FOCUS_CLASS);
    const finding = state.findings.find((item) => item.id === id);
    if (finding) element.setAttribute("data-dpa-severity", finding.severity);
    window.setTimeout(() => element.classList.remove(FOCUS_CLASS), 1600);
    return true;
  };

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message.type !== "string") return false;

    if (message.type === "DPA_SCAN") {
      try {
        sendResponse({ ok: true, report: scan(message.settings || {}) });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
      }
      return false;
    }

    if (message.type === "DPA_SET_HIGHLIGHTS") {
      setHighlights(message.enabled);
      sendResponse({ ok: true });
      return false;
    }

    if (message.type === "DPA_FOCUS") {
      sendResponse({ ok: focusFinding(message.id) });
      return false;
    }

    return false;
  });

  globalThis.__darkPatternAlertScanner = { scan, setHighlights, focusFinding };
})();
