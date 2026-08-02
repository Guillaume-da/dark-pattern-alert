(() => {
  // Moteur de confiance : logique pure, sans DOM ni réseau.
  // Utilisable dans le panneau latéral (script classique) et sous Node pour les tests.

  const MULTI_LABEL_SUFFIXES = new Set([
    "co.uk",
    "org.uk",
    "ac.uk",
    "gov.uk",
    "com.au",
    "net.au",
    "org.au",
    "co.jp",
    "co.nz",
    "co.za",
    "com.br",
    "com.mx",
    "com.tr",
    "com.cn",
    "gouv.fr",
    "asso.fr",
    "tm.fr"
  ]);

  const RISKY_TLDS = new Set([
    "zip",
    "mov",
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "top",
    "xyz",
    "work",
    "click",
    "country",
    "review",
    "kim",
    "men",
    "loan",
    "download",
    "rest",
    "cam",
    "surf"
  ]);

  // Mots typiquement collés à une marque dans une URL d’hameçonnage.
  const LURE_WORDS = [
    "secure",
    "securite",
    "login",
    "signin",
    "connexion",
    "account",
    "compte",
    "verify",
    "verification",
    "validation",
    "update",
    "billing",
    "facture",
    "paiement",
    "payment",
    "support",
    "service",
    "help",
    "assistance",
    "official",
    "officiel",
    "recovery",
    "unlock",
    "alerte",
    "alert"
  ];

  const BRANDS = [
    { name: "Google", token: "google", domains: ["google.com", "google.fr", "googleapis.com", "googleusercontent.com", "googletagmanager.com", "gstatic.com", "youtube.com"] },
    { name: "Microsoft", token: "microsoft", domains: ["microsoft.com", "microsoftonline.com", "live.com", "office.com", "outlook.com", "azure.com"] },
    { name: "Apple", token: "apple", domains: ["apple.com", "icloud.com"] },
    { name: "Amazon", token: "amazon", domains: ["amazon.com", "amazon.fr", "amazonaws.com", "amazoncognito.com"] },
    { name: "PayPal", token: "paypal", domains: ["paypal.com", "paypal.fr", "paypal.me", "paypalobjects.com"] },
    { name: "Facebook", token: "facebook", domains: ["facebook.com", "fb.com"] },
    { name: "Instagram", token: "instagram", domains: ["instagram.com"] },
    { name: "WhatsApp", token: "whatsapp", domains: ["whatsapp.com"] },
    { name: "Netflix", token: "netflix", domains: ["netflix.com"] },
    { name: "Spotify", token: "spotify", domains: ["spotify.com"] },
    { name: "Steam", token: "steam", domains: ["steampowered.com", "steamcommunity.com"] },
    { name: "eBay", token: "ebay", domains: ["ebay.com", "ebay.fr"] },
    { name: "Booking", token: "booking", domains: ["booking.com"], generic: true },
    { name: "Airbnb", token: "airbnb", domains: ["airbnb.com", "airbnb.fr"] },
    { name: "Leboncoin", token: "leboncoin", domains: ["leboncoin.fr"] },
    { name: "Vinted", token: "vinted", domains: ["vinted.fr", "vinted.com"] },
    { name: "Cdiscount", token: "cdiscount", domains: ["cdiscount.com"] },
    { name: "Fnac", token: "fnac", domains: ["fnac.com"] },
    { name: "Darty", token: "darty", domains: ["darty.com"] },
    { name: "Carrefour", token: "carrefour", domains: ["carrefour.fr"] },
    { name: "Doctolib", token: "doctolib", domains: ["doctolib.fr"] },
    { name: "Ameli", token: "ameli", domains: ["ameli.fr"] },
    { name: "La Poste", token: "laposte", domains: ["laposte.fr", "laposte.net"] },
    { name: "Colissimo", token: "colissimo", domains: ["colissimo.fr"] },
    { name: "Chronopost", token: "chronopost", domains: ["chronopost.fr"] },
    { name: "Orange", token: "orange", domains: ["orange.fr", "orange.com"], generic: true },
    { name: "SFR", token: "sfr", domains: ["sfr.fr"] },
    { name: "Bouygues", token: "bouygues", domains: ["bouyguestelecom.fr"] },
    { name: "BNP Paribas", token: "bnpparibas", domains: ["bnpparibas.com", "bnpparibas.net", "mabanque.bnpparibas"] },
    { name: "Crédit Agricole", token: "creditagricole", domains: ["credit-agricole.fr", "ca-paris.fr"] },
    { name: "Société Générale", token: "societegenerale", domains: ["societegenerale.fr"] },
    { name: "Boursorama", token: "boursorama", domains: ["boursorama.com", "boursobank.com"] },
    { name: "Revolut", token: "revolut", domains: ["revolut.com"] },
    { name: "N26", token: "n26", domains: ["n26.com"] },
    { name: "Coinbase", token: "coinbase", domains: ["coinbase.com"] },
    { name: "Binance", token: "binance", domains: ["binance.com"] }
  ];

  const SEVERITY_RANK = { high: 3, medium: 2, low: 1, info: 0 };

  const levenshtein = (a, b, limit = 3) => {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      let rowMinimum = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        if (current[j] < rowMinimum) rowMinimum = current[j];
      }
      if (rowMinimum > limit) return limit + 1;
      previous = current;
    }
    return previous[b.length];
  };

  const registrableDomain = (hostname = "") => {
    const labels = hostname.toLowerCase().replace(/\.$/, "").split(".").filter(Boolean);
    if (labels.length <= 2) return labels.join(".");
    const lastTwo = labels.slice(-2).join(".");
    if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
    return lastTwo;
  };

  const isIpHost = (hostname = "") =>
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || /^\[[0-9a-f:]+\]$/i.test(hostname);

  const signal = (id, severity, label, detail, weight) => ({ id, severity, label, detail, weight });

  const matchesBrandToken = (part, token) => {
    if (part === token) return "exact";
    const tolerance = token.length >= 8 ? 2 : 1;
    if (token.length >= 5 && levenshtein(part, token, tolerance) <= tolerance) return "lookalike";
    for (const lure of LURE_WORDS) {
      if (part === `${token}${lure}` || part === `${lure}${token}`) return "lure";
    }
    return null;
  };

  const analyzeUrl = (url, { firstVisit = false } = {}) => {
    const signals = [];
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return { signals, hostname: "", registrable: "", brand: null };
    }

    const hostname = parsed.hostname.toLowerCase();
    const registrable = registrableDomain(hostname);
    const labels = hostname.split(".").filter(Boolean);
    const parts = hostname.split(/[.-]/).filter(Boolean);
    const tld = labels.at(-1) || "";
    const mainLabel = registrable.split(".")[0] || "";

    // Le trafic de bouclage ne quitte pas la machine : l’absence de TLS n’y est pas un risque.
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(hostname) || hostname.endsWith(".localhost");

    if (parsed.protocol === "http:" && !loopback) {
      signals.push(
        signal(
          "no-tls",
          "high",
          "Connexion non chiffrée (HTTP)",
          "Le trafic circule en clair. Tout ce que vous saisissez peut être lu ou modifié sur le réseau.",
          34
        )
      );
    } else if (parsed.protocol === "https:") {
      signals.push(signal("tls", "info", "Connexion chiffrée (HTTPS)", "Le trafic est chiffré entre le navigateur et le site.", 0));
    }

    if (isIpHost(hostname) && !loopback) {
      signals.push(
        signal(
          "ip-host",
          "high",
          "Adresse IP au lieu d’un nom de domaine",
          "Un site légitime s’identifie normalement par un nom de domaine. Une IP nue est courante sur les pages d’hameçonnage.",
          26
        )
      );
    }

    if (hostname.includes("xn--")) {
      signals.push(
        signal(
          "punycode",
          "high",
          "Domaine à caractères non latins",
          "Le nom contient des caractères pouvant imiter des lettres latines (attaque homographe). Vérifiez le domaine caractère par caractère.",
          24
        )
      );
    }

    let brand = null;
    if (!isIpHost(hostname)) {
      const official = BRANDS.find((candidate) => candidate.domains.includes(registrable));
      if (official) {
        brand = { name: official.name, official: true };
        signals.push(
          signal("known-brand", "info", `Domaine officiel de ${official.name}`, "Le domaine enregistré correspond à ceux connus pour cette marque.", 0)
        );
      } else {
        const hasLure = parts.some((part) => LURE_WORDS.includes(part));
        for (const candidate of BRANDS) {
          const mainMatch = matchesBrandToken(mainLabel, candidate.token);
          const partMatch = mainMatch || parts.some((part) => matchesBrandToken(part, candidate.token));
          if (!partMatch) continue;
          // Marques dont le nom est un mot courant : on n’alerte que si le
          // domaine associe aussi un mot d’appât, sinon le bruit est trop fort.
          if (candidate.generic && !hasLure) continue;
          brand = { name: candidate.name, official: false };
          if (mainMatch === "lookalike") {
            signals.push(
              signal(
                "typosquat",
                "high",
                `Domaine très proche de ${candidate.name}`,
                `« ${registrable} » ressemble à l’orthographe de ${candidate.name} sans en être un domaine officiel. Typique d’une imitation.`,
                30
              )
            );
          } else {
            signals.push(
              signal(
                "brand-impersonation",
                "high",
                `Nom de ${candidate.name} dans un domaine tiers`,
                `Le domaine enregistré est « ${registrable} », qui n’appartient pas aux domaines connus de ${candidate.name}. Seule la partie juste avant le TLD identifie le propriétaire.`,
                34
              )
            );
          }
          break;
        }
      }
    }

    if (!brand) {
      const lures = parts.filter((part) => LURE_WORDS.includes(part));
      if (lures.length >= 2) {
        signals.push(
          signal(
            "lure-keywords",
            "medium",
            "Mots d’urgence dans le domaine",
            `Le domaine combine « ${lures.slice(0, 3).join(" », « ")} ». Cette accumulation est fréquente sur les pages d’hameçonnage.`,
            16
          )
        );
      }
    }

    if (RISKY_TLDS.has(tld)) {
      signals.push(
        signal(
          "risky-tld",
          "medium",
          `Extension « .${tld} » à faible réputation`,
          "Cette extension est peu coûteuse et fortement utilisée pour des campagnes jetables. Elle ne condamne pas le site, mais invite à la prudence.",
          12
        )
      );
    }

    const subdomainCount = Math.max(0, labels.length - registrable.split(".").length);
    if (subdomainCount >= 3) {
      signals.push(
        signal(
          "deep-subdomains",
          "medium",
          "Empilement de sous-domaines",
          `${subdomainCount} sous-domaines masquent le domaine réel, qui reste « ${registrable} ».`,
          8
        )
      );
    }

    if ((mainLabel.match(/-/g) || []).length >= 3) {
      signals.push(signal("many-hyphens", "low", "Domaine très segmenté", "Les tirets multiples servent souvent à composer un nom crédible autour d’une marque.", 6));
    }

    if (mainLabel.length > 30) {
      signals.push(signal("long-label", "low", "Nom de domaine anormalement long", "Un nom très long rend la lecture du vrai propriétaire difficile.", 5));
    }

    if (parsed.port && !["80", "443"].includes(parsed.port) && !loopback) {
      signals.push(signal("unusual-port", "low", `Port inhabituel (${parsed.port})`, "Les sites publics utilisent normalement les ports 80 ou 443.", 5));
    }

    if (parsed.username || parsed.password) {
      signals.push(
        signal(
          "url-credentials",
          "high",
          "Identifiants intégrés à l’URL",
          "La partie avant « @ » peut afficher un domaine rassurant tout en menant ailleurs.",
          28
        )
      );
    }

    if (firstVisit) {
      signals.push(
        signal(
          "first-visit",
          "low",
          "Premier site analysé sur ce domaine",
          "Vous n’avez encore jamais lancé d’analyse ici. Redoublez d’attention avant de payer ou de créer un compte.",
          4
        )
      );
    }

    return { signals, hostname, registrable, brand };
  };

  const analyzePage = (facts = {}) => {
    const signals = [];
    // `secureContext` reste vrai sur localhost : le navigateur y considère
    // le transport comme sûr, inutile d’alarmer sur une page de test locale.
    const insecure = facts.protocol === "http:" && facts.secureContext !== true;

    if (facts.passwordFields > 0 && insecure) {
      signals.push(
        signal(
          "password-on-http",
          "high",
          "Mot de passe demandé hors HTTPS",
          "Le formulaire enverrait vos identifiants en clair. N’y saisissez rien.",
          40
        )
      );
    }

    if (facts.paymentFields > 0 && insecure) {
      signals.push(
        signal("payment-on-http", "high", "Paiement demandé hors HTTPS", "Des champs de carte bancaire sont présents sur une page non chiffrée.", 40)
      );
    }

    if (facts.insecureFormActions > 0) {
      signals.push(
        signal(
          "insecure-form-action",
          "high",
          "Formulaire envoyé en HTTP",
          "Un formulaire poste vers une adresse non chiffrée : les données saisies circuleraient en clair, quel que soit le chiffrement de la page.",
          26
        )
      );
    }

    if (facts.crossOriginCredentialForms > 0) {
      signals.push(
        signal(
          "cross-origin-credentials",
          "high",
          "Identifiants envoyés vers un autre domaine",
          `Un formulaire de connexion ou de paiement poste vers ${facts.crossOriginFormOrigins?.slice(0, 2).join(", ") || "un domaine tiers"}.`,
          30
        )
      );
    } else if (facts.crossOriginForms > 0) {
      signals.push(
        signal(
          "cross-origin-form",
          "medium",
          "Formulaire envoyé vers un domaine tiers",
          `Les données saisies partent vers ${facts.crossOriginFormOrigins?.slice(0, 2).join(", ") || "un autre domaine"}.`,
          12
        )
      );
    }

    if (facts.activeMixedContent > 0) {
      signals.push(
        signal(
          "active-mixed-content",
          "medium",
          "Scripts chargés en HTTP sur une page HTTPS",
          `${facts.activeMixedContent} ressource(s) active(s) non chiffrée(s) : le contenu de la page peut être altéré en transit.`,
          10
        )
      );
    } else if (facts.passiveMixedContent > 0) {
      signals.push(
        signal(
          "passive-mixed-content",
          "low",
          "Images ou médias chargés en HTTP",
          `${facts.passiveMixedContent} ressource(s) non chiffrée(s). Impact limité, mais signe d’une maintenance négligée.`,
          6
        )
      );
    }

    if (facts.hiddenCrossOriginFrames > 0) {
      signals.push(
        signal(
          "hidden-frames",
          "medium",
          "Cadres tiers invisibles",
          `${facts.hiddenCrossOriginFrames} iframe(s) d’un autre domaine sont masquées ou hors écran. Technique utilisée pour du suivi ou du détournement de clic.`,
          12
        )
      );
    }

    const thirdPartyCount = facts.thirdPartyScriptOrigins?.length || 0;
    if (thirdPartyCount >= 10) {
      signals.push(
        signal(
          "many-third-parties",
          "medium",
          `${thirdPartyCount} domaines tiers exécutent du code`,
          "Chaque domaine supplémentaire élargit la surface d’attaque et le partage de données.",
          8
        )
      );
    } else if (thirdPartyCount > 0) {
      signals.push(
        signal("third-parties", "info", `${thirdPartyCount} domaine(s) tiers chargé(s)`, "Volume habituel pour un site commercial.", 0)
      );
    }

    if (facts.obfuscatedInlineScripts > 0) {
      signals.push(
        signal(
          "obfuscated-scripts",
          "low",
          "Script embarqué illisible",
          `${facts.obfuscatedInlineScripts} script(s) très longs et sans mise en forme, un profil compatible avec du code obfusqué.`,
          8
        )
      );
    }

    const legal = facts.legalLinks || {};
    const legalCount = ["legal", "privacy", "terms", "contact"].filter((key) => legal[key]).length;
    if (facts.commercePage && legalCount === 0) {
      signals.push(
        signal(
          "no-legal-pages",
          "medium",
          "Aucune mention légale ni contact",
          "Une page marchande sans mentions légales, CGV ni moyen de contact est un signal classique de boutique éphémère.",
          14
        )
      );
    } else if (facts.commercePage && legalCount < 2) {
      signals.push(
        signal(
          "few-legal-pages",
          "low",
          "Informations légales incomplètes",
          "Une seule page d’information légale a été trouvée sur une page marchande.",
          7
        )
      );
    } else if (legalCount >= 2) {
      signals.push(signal("legal-pages", "info", "Mentions légales et contact présents", "Le site publie les informations attendues d’un éditeur identifiable.", 0));
    }

    if (facts.metaCsp) {
      signals.push(signal("csp", "info", "Politique de sécurité du contenu déclarée", "Le site restreint les scripts qu’il autorise.", 0));
    }

    return signals;
  };

  const trustPresentation = (score) => {
    if (score >= 80) {
      return { level: "trusted", label: "Aucun signal d’alerte", summary: "Les vérifications locales n’ont rien relevé d’anormal sur l’identité du site et sa sécurité de transport." };
    }
    if (score >= 55) {
      return { level: "caution", label: "Prudence recommandée", summary: "Des éléments méritent vérification avant de saisir des informations personnelles." };
    }
    return { level: "risky", label: "Signaux préoccupants", summary: "Plusieurs indices d’usurpation ou de sécurité insuffisante. N’y saisissez ni identifiants ni moyen de paiement sans vérification." };
  };

  const buildTrustReport = ({ url, facts = {}, firstVisit = false } = {}) => {
    const domain = analyzeUrl(url, { firstVisit });
    let protocol = facts.protocol;
    if (!protocol) {
      try {
        protocol = new URL(url).protocol;
      } catch {
        protocol = "";
      }
    }
    const signals = [...domain.signals, ...analyzePage({ ...facts, protocol })];

    const penalty = signals.reduce((total, item) => total + item.weight, 0);
    const score = Math.max(0, Math.min(100, 100 - penalty));
    const alerts = signals.filter((item) => item.weight > 0);

    signals.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.weight - a.weight);

    return {
      score,
      ...trustPresentation(score),
      hostname: domain.hostname,
      registrable: domain.registrable,
      brand: domain.brand,
      alertCount: alerts.length,
      signals
    };
  };

  const api = Object.freeze({
    analyzeUrl,
    analyzePage,
    buildTrustReport,
    trustPresentation,
    registrableDomain,
    levenshtein,
    BRANDS,
    RISKY_TLDS
  });

  globalThis.__dpaReputationRules = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
