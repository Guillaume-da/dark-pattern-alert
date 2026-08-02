(() => {
  // Source unique des expressions de détection : `content-scanner.js` les lit
  // depuis ce fichier et `test-rules.js` les vérifie sous Node. Toute copie
  // locale finirait par diverger — c'est déjà arrivé.
  const patterns = {
    sensitiveChoice:
      /newsletter|marketing|partenaire|offre|promotion|assurance|garantie|don|tip|pourboire|abonnement|subscribe|renew|membership|communications?|emails?|sms/i,
    // Forme horloge : un vrai décompte.
    clock: /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b/,
    // Forme durée : le plus souvent un temps de lecture ou de trajet.
    duration: /\b\d{1,2}\s*(?:min(?:ute)?s?|sec(?:onde)?s?)\b/i,
    readingTime: /temps de lecture|min(?:ute)?s? de lecture|reading time|lecture\s*:\s*\d/i,
    // Horaire annoncé — début de séance, date limite — plutôt que décompte :
    // un jour, un mois ou la tournure « à 21:00 » désignent un rendez-vous.
    scheduleMarker:
      /\b(?:aujourd['’]hui|demain|hier|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre|today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december)\b|\b[àa]\s?\d{1,2}\s?[:h]\d{2}\b|\b\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}\b/i,
    timer:
      /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b|\b\d{1,2}\s*(?:min(?:ute)?s?|sec(?:onde)?s?)\b/i,
    urgency:
      /expire|expiration|se termine|derni[eè]re chance|plus que|temps restant|offre limit[eé]e|\bvite\b|d[eé]p[eê]chez|\bleft\b|ends? in|last chance|limited time|\bhurry\b|deal ends/i,
    commercial:
      /panier|commande|paiement|checkout|acheter|prix|promo|r[eé]duction|order|payment|buy|discount|sale/i,
    confirmShaming:
      /non merci.*(?:payer|[eé]conom|offre|avantage|argent|risque)|je pr[eé]f[eè]re.*(?:payer|rater|perdre|rester)|non.*je (?:n['’]en )?veux pas|no thanks.*(?:pay|save|offer|money)|i(?:'|’)d rather.*(?:pay|miss|lose)|i don(?:'|’)t want/i,
    acceptControl:
      /^(tout accepter|accepter|j['’]?accepte|continuer|confirmer|oui|s['’]?abonner|acheter|commander|accept all|agree|continue|confirm|yes|subscribe|buy|place order)$/i,
    rejectControl:
      /^(refuser|tout refuser|non merci|plus tard|continuer sans|param[eè]tres|reject|decline|no thanks|not now|continue without|manage settings)$/i,
    cancellationFriction:
      /(?:r[eé]sili(?:er|ation)|annuler (?:votre )?abonnement).{0,110}(?:appel(?:er)?|t[eé]l[eé]phon|contacter|service client|courrier|lettre recommand[eé]e)|(?:appel(?:er)?|t[eé]l[eé]phon|contacter|service client|courrier|lettre recommand[eé]e).{0,110}(?:r[eé]sili(?:er|ation)|annuler (?:votre )?abonnement)|(?:cancel(?:lation)?|end your subscription).{0,110}(?:call|phone|contact support|mail|letter)|(?:call|phone|contact support|mail a letter).{0,110}(?:cancel(?:lation)?|end your subscription)/i,
    autoRenew:
      /renouvel(?:lement|[eé]e?)\s+automatique|reconduit(?:e)?\s+automatiquement|automatically renew|auto[- ]?renew|charged automatically after|factur[eé].{0,50}(?:apr[eè]s|[àa] la fin).{0,40}(?:essai|p[eé]riode)/i,
    onlineCancellationBlock:
      /impossible de r[eé]silier en ligne|ne peut pas [eê]tre r[eé]sili[eé] en ligne|cannot (?:be )?cancel(?:led)? online|no online cancellation/i,

    // Frais opaques : leur objet n'est pas une prestation identifiable pour
    // l'acheteur. Ce sont eux qui caractérisent un prix révélé en plusieurs fois.
    opaqueFee:
      /frais\s+(?:de\s+)?(?:service|dossier|gestion|traitement|r[eé]servation|paiement|transaction|plateforme|mise en relation)|frais\s+(?:suppl[eé]mentaires|obligatoires|additionnels|divers)|frais de retard|suppl[eé]ment(?:s)?\b|majoration|service (?:fee|charge)|booking fee|handling fee|processing fee|convenience fee|resort fee|platform fee|surcharge/i,
    // Frais attendus : légitimes, mais à signaler s'ils n'apparaissent qu'au paiement.
    expectedFee:
      /frais\s+(?:de\s+)?(?:livraison|port|exp[eé]dition|transport)|participation aux frais de port|delivery fee|shipping (?:fee|cost|charges?)/i,
    totalLabel:
      /\btotal\b|montant (?:total|[àa] payer|d[ûu])|net [àa] payer|reste [àa] payer|order total|grand total|amount due|total to pay/i,
    hiddenCostMention:
      /hors frais|frais en sus|frais non inclus|\+\s*frais|hors livraison|hors options|hors taxes|prix hors|excluding fees|fees not included|plus (?:taxes|fees)|before fees/i
  };

  // Lecture d'un montant affiché, en format français ou anglais.
  const parseAmount = (text = "") => {
    const match = String(text).match(
      /(?:€|EUR|\$|£)\s*([\d   ,.]+)|([\d   ,.]+)\s*(?:€|EUR\b|\$|£)/i
    );
    if (!match) return null;

    const raw = (match[1] || match[2] || "").trim().replace(/[.,]$/, "");
    if (!/\d/.test(raw)) return null;

    let normalized = raw.replace(/[\s  ]/g, "");
    if (/,\d{1,2}$/.test(normalized)) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }

    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : null;
  };

  // Lecture d'un décompte affiché : « 00:09:42 » ou « 09:42 ».
  const parseCountdown = (text = "") => {
    const match = String(text).match(/\b(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\b/);
    if (!match) return null;
    const [, hours, minutes, seconds] = match;
    const total = hours
      ? Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
      : Number(minutes) * 60 + Number(seconds);
    return Number.isFinite(total) && total > 0 ? total : null;
  };

  // Confronte un décompte au relevé de la visite précédente. Un compteur
  // honnête perd exactement le temps écoulé ; tout le reste se voit ici.
  const MIN_ELAPSED_SECONDS = 60;

  const compareCounter = (previous, current, nowMs = Date.now()) => {
    if (!previous || typeof previous.seconds !== "number" || typeof previous.observedAt !== "number") {
      return { verdict: "first" };
    }

    const elapsed = (nowMs - previous.observedAt) / 1000;
    if (elapsed < MIN_ELAPSED_SECONDS) return { verdict: "too-soon", elapsed };

    const expected = previous.seconds - elapsed;
    const tolerance = Math.max(20, elapsed * 0.05);
    const drift = current - expected;

    if (current > previous.seconds + tolerance) {
      return { verdict: "reset", elapsed, expected, drift };
    }
    if (expected <= 0 && current > tolerance) {
      return { verdict: "restarted", elapsed, expected, drift };
    }
    if (drift > tolerance) {
      return { verdict: "stalled", elapsed, expected, drift };
    }
    if (drift < -tolerance) {
      return { verdict: "faster", elapsed, expected, drift };
    }
    return { verdict: "consistent", elapsed, expected, drift };
  };

  // Pondération du score, partagée entre le scanner et le panneau : ce dernier
  // doit pouvoir recalculer après avoir requalifié un compteur.
  const calculateScore = (findings = []) => {
    const weights = { high: 22, medium: 12, low: 6 };
    const base = findings.reduce(
      (total, finding) => total + (weights[finding.severity] || 0) * (0.55 + finding.confidence * 0.45),
      0
    );
    const categoryBonus = Math.max(0, new Set(findings.map((finding) => finding.category)).size - 1) * 4;
    return Math.min(100, Math.round(base + categoryBonus));
  };

  const rules = Object.freeze({
    patterns: Object.freeze(patterns),
    parseAmount,
    parseCountdown,
    compareCounter,
    calculateScore,
    MIN_ELAPSED_SECONDS
  });
  globalThis.__dpaDetectorRules = rules;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = rules;
  }
})();
