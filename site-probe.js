(() => {
  if (globalThis.__darkPatternAlertProbe) return;

  // Collecte de faits observables dans la page. Aucune évaluation ici :
  // le calcul de confiance vit dans reputation-rules.js, testable hors navigateur.

  const MAX_SCANNED_NODES = 400;

  const PAYMENT_FIELD =
    /card[-_ ]?number|cardnumber|cc[-_ ]?num|numero.*carte|carte.*bancaire|cvv|cvc|crypto ?gramme|exp(?:iry|iration)|date.*expiration/i;

  const LEGAL_LINKS = {
    legal: /mentions?[ -]l[eé]gales?|legal notice|imprint|impressum|[eé]diteur du site/i,
    privacy: /confidentialit[eé]|donn[eé]es personnelles|privacy policy|rgpd|gdpr/i,
    terms: /conditions g[eé]n[eé]rales|\bcgv\b|\bcgu\b|terms of (?:service|use|sale)/i,
    contact: /nous contacter|contactez[- ]nous|contact\b|service client|support client/i
  };

  // Signatures d’obfuscation proprement dite. La minification seule ne suffit
  // pas : la plupart des sites sérieux embarquent du code minifié légitime.
  const OBFUSCATION_MARKERS = [
    /_0x[0-9a-f]{4,}/,
    /eval\s*\(\s*(?:atob|unescape|decodeURIComponent|function|String)/,
    /(?:\\x[0-9a-f]{2}){8,}/i,
    /String\.fromCharCode\((?:\s*\d+\s*,){10,}/
  ];

  const COMMERCE_HINT =
    /panier|ajouter au panier|commander|passer commande|paiement|checkout|acheter|\d+[ ,]\d{2}\s*(?:€|eur|\$|usd)|add to (?:cart|bag)|buy now|place order|subscribe/i;

  const originOf = (value) => {
    try {
      return new URL(value, location.href).origin;
    } catch {
      return null;
    }
  };

  const isHttp = (value) => {
    try {
      return new URL(value, location.href).protocol === "http:";
    } catch {
      return false;
    }
  };

  const isHidden = (element) => {
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity || "1") < 0.05) {
      return true;
    }
    const rect = element.getBoundingClientRect();
    return rect.width < 4 || rect.height < 4;
  };

  const collectForms = () => {
    const pageOrigin = location.origin;
    let crossOriginForms = 0;
    let crossOriginCredentialForms = 0;
    let insecureFormActions = 0;
    const crossOriginFormOrigins = new Set();

    for (const form of document.querySelectorAll("form")) {
      const action = form.getAttribute("action");
      const target = action ? originOf(action) : pageOrigin;
      const sensitive =
        form.querySelector('input[type="password"]') !== null ||
        [...form.querySelectorAll("input")].some((input) =>
          PAYMENT_FIELD.test(`${input.name} ${input.id} ${input.autocomplete} ${input.placeholder}`)
        );

      if (action && isHttp(action)) insecureFormActions += 1;
      if (target && target !== pageOrigin) {
        crossOriginForms += 1;
        crossOriginFormOrigins.add(new URL(target).hostname);
        if (sensitive) crossOriginCredentialForms += 1;
      }
    }

    return {
      crossOriginForms,
      crossOriginCredentialForms,
      insecureFormActions,
      crossOriginFormOrigins: [...crossOriginFormOrigins].slice(0, 5)
    };
  };

  const collectMixedContent = () => {
    if (location.protocol !== "https:") return { activeMixedContent: 0, passiveMixedContent: 0 };
    let active = 0;
    let passive = 0;

    for (const script of document.querySelectorAll("script[src]")) {
      if (isHttp(script.getAttribute("src"))) active += 1;
    }
    for (const sheet of document.querySelectorAll('link[rel~="stylesheet"][href]')) {
      if (isHttp(sheet.getAttribute("href"))) active += 1;
    }
    for (const frame of document.querySelectorAll("iframe[src]")) {
      if (isHttp(frame.getAttribute("src"))) active += 1;
    }
    for (const media of [...document.querySelectorAll("img[src], video[src], audio[src], source[src]")].slice(0, MAX_SCANNED_NODES)) {
      if (isHttp(media.getAttribute("src"))) passive += 1;
    }

    return { activeMixedContent: active, passiveMixedContent: passive };
  };

  const collectFrames = () => {
    const pageOrigin = location.origin;
    let crossOriginFrames = 0;
    let hiddenCrossOriginFrames = 0;

    for (const frame of document.querySelectorAll("iframe[src]")) {
      const origin = originOf(frame.getAttribute("src"));
      if (!origin || origin === pageOrigin) continue;
      crossOriginFrames += 1;
      if (isHidden(frame)) hiddenCrossOriginFrames += 1;
    }
    return { crossOriginFrames, hiddenCrossOriginFrames };
  };

  const collectScripts = () => {
    const pageOrigin = location.origin;
    const thirdPartyScriptOrigins = new Set();
    let obfuscatedInlineScripts = 0;

    for (const script of [...document.querySelectorAll("script")].slice(0, MAX_SCANNED_NODES)) {
      const source = script.getAttribute("src");
      if (source) {
        const origin = originOf(source);
        if (origin && origin !== pageOrigin) thirdPartyScriptOrigins.add(new URL(origin).hostname);
        continue;
      }
      const code = script.textContent || "";
      if (code.length < 4000) continue;
      if (!OBFUSCATION_MARKERS.some((marker) => marker.test(code))) continue;
      const whitespaceRatio = (code.match(/\s/g) || []).length / code.length;
      const longestLine = code.split("\n").reduce((longest, line) => Math.max(longest, line.length), 0);
      if (whitespaceRatio < 0.05 || longestLine > 3000) obfuscatedInlineScripts += 1;
    }

    return {
      thirdPartyScriptOrigins: [...thirdPartyScriptOrigins].slice(0, 25),
      obfuscatedInlineScripts
    };
  };

  const collectLegalLinks = () => {
    const found = { legal: false, privacy: false, terms: false, contact: false };
    for (const link of [...document.querySelectorAll("a")].slice(0, 600)) {
      const text = `${link.textContent || ""} ${link.getAttribute("aria-label") || ""} ${link.getAttribute("href") || ""}`
        .replace(/\s+/g, " ")
        .trim();
      if (!text) continue;
      for (const [key, pattern] of Object.entries(LEGAL_LINKS)) {
        if (!found[key] && pattern.test(text)) found[key] = true;
      }
    }
    return found;
  };

  const collectFacts = () => {
    const passwordFields = document.querySelectorAll('input[type="password"]').length;
    const paymentFields = [...document.querySelectorAll("input")].filter((input) =>
      PAYMENT_FIELD.test(`${input.name} ${input.id} ${input.autocomplete} ${input.placeholder}`)
    ).length;

    const bodyText = (document.body?.innerText || "").slice(0, 20000);

    return {
      url: location.href,
      hostname: location.hostname,
      protocol: location.protocol,
      secureContext: window.isSecureContext === true,
      title: document.title,
      passwordFields,
      paymentFields,
      commercePage: COMMERCE_HINT.test(bodyText),
      metaCsp: document.querySelector('meta[http-equiv="Content-Security-Policy" i]') !== null,
      legalLinks: collectLegalLinks(),
      ...collectForms(),
      ...collectMixedContent(),
      ...collectFrames(),
      ...collectScripts()
    };
  };

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "DPA_SITE_FACTS") return false;
    try {
      sendResponse({ ok: true, facts: collectFacts() });
    } catch (error) {
      sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
    return false;
  });

  globalThis.__darkPatternAlertProbe = { collectFacts };
})();
