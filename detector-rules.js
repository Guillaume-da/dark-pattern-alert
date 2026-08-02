(() => {
  const patterns = {
    sensitiveChoice:
      /newsletter|marketing|partenaire|offre|promotion|assurance|garantie|don|tip|pourboire|abonnement|subscribe|renew|membership|communications?|emails?|sms/i,
    timer:
      /\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b|\b\d{1,2}\s*(?:min(?:ute)?s?|sec(?:onde)?s?)\b/i,
    urgency:
      /expire|expiration|se termine|derni[eè]re chance|plus que|temps restant|offre limit[eé]e|vite|d[eé]p[eê]chez|left|ends? in|last chance|limited time|hurry|deal ends/i,
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
      /impossible de r[eé]silier en ligne|ne peut pas [eê]tre r[eé]sili[eé] en ligne|cannot (?:be )?cancel(?:led)? online|no online cancellation/i
  };

  const rules = Object.freeze({ patterns: Object.freeze(patterns) });
  globalThis.__dpaDetectorRules = rules;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = rules;
  }
})();
