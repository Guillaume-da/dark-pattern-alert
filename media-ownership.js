(() => {
  // Qui possède le média que vous lisez, et comment il est financé.
  // Uniquement des faits d'actionnariat et de financement : aucune évaluation
  // éditoriale, aucune étiquette politique, aucun effet sur le score de confiance.
  //
  // Instantané documentaire : l'actionnariat des médias change souvent
  // (rachats, montées au capital, scissions). Voir SNAPSHOT ci-dessous.

  const SNAPSHOT = "mai 2026";

  const OWNER_TYPES = {
    "service-public": "Service public",
    prive: "Capitaux privés",
    cooperative: "Coopérative",
    association: "Association",
    fondation: "Fonds de dotation ou fondation",
    "non-lucratif": "Organisation à but non lucratif"
  };

  const OUTLETS = [
    // Presse quotidienne nationale
    { domains: ["lemonde.fr"], name: "Le Monde", owner: "Groupe Le Monde : Xavier Niel, Matthieu Pigasse et Daniel Křetínský (CMI France), face à un pôle d’indépendance réunissant la société des rédacteurs et des lecteurs", group: "Groupe Le Monde", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["lefigaro.fr"], name: "Le Figaro", owner: "Famille Dassault, via Dassault Médias", group: "Groupe Figaro", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["liberation.fr"], name: "Libération", owner: "Fonds de dotation pour une presse indépendante, doté par Altice (Patrick Drahi) lors du transfert de 2020", group: "Fonds de dotation pour une presse indépendante", type: "fondation", funding: "Abonnements, publicité et dotation" },
    { domains: ["lesechos.fr"], name: "Les Échos", owner: "Bernard Arnault, via LVMH", group: "Groupe Les Échos-Le Parisien (LVMH)", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["leparisien.fr", "aujourdhui-en-france.fr"], name: "Le Parisien", owner: "Bernard Arnault, via LVMH", group: "Groupe Les Échos-Le Parisien (LVMH)", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["la-croix.com", "lacroix.com"], name: "La Croix", owner: "Bayard Presse, détenu par la congrégation des Augustins de l’Assomption", group: "Bayard", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["humanite.fr"], name: "L’Humanité", owner: "Actionnariat réunissant le Parti communiste français, les salariés et des lecteurs", group: "L’Humanité", type: "prive", funding: "Abonnements, dons et souscriptions" },
    { domains: ["lecanardenchaine.fr"], name: "Le Canard enchaîné", owner: "Actionnariat interne détenu par les journalistes et anciens du journal", group: "Les Éditions Maréchal – Le Canard enchaîné", type: "prive", funding: "Ventes uniquement, sans publicité" },
    { domains: ["latribune.fr"], name: "La Tribune", owner: "Jean-Christophe Tortora, actionnaire majoritaire", group: "Groupe La Tribune", type: "prive", funding: "Abonnements, publicité et événements" },
    { domains: ["lopinion.fr"], name: "L’Opinion", owner: "Nicolas Beytout, avec au capital Bernard Arnault, Xavier Niel et d’autres investisseurs privés", group: "L’Opinion", type: "prive", funding: "Abonnements et publicité" },

    // Magazines et hebdomadaires
    { domains: ["nouvelobs.com", "obs.fr"], name: "L’Obs", owner: "Groupe Le Monde : Xavier Niel, Matthieu Pigasse et Daniel Křetínský", group: "Groupe Le Monde", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["lexpress.fr"], name: "L’Express", owner: "Alain Weill", group: "Groupe L’Express", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["lepoint.fr"], name: "Le Point", owner: "Famille Pinault, via Artémis", group: "Artémis", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["marianne.net"], name: "Marianne", owner: "Daniel Křetínský, via CMI France", group: "CMI France", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["valeursactuelles.com"], name: "Valeurs actuelles", owner: "Groupe Valmonde, dans l’orbite de la famille Safa (Privinvest)", group: "Valmonde", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["challenges.fr"], name: "Challenges", owner: "Claude Perdriel", group: "Groupe Perdriel", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["telerama.fr"], name: "Télérama", owner: "Groupe Le Monde", group: "Groupe Le Monde", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["courrierinternational.com"], name: "Courrier international", owner: "Groupe Le Monde", group: "Groupe Le Monde", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["monde-diplomatique.fr"], name: "Le Monde diplomatique", owner: "Société des rédacteurs majoritaire, avec l’association Gunter Holzmann et Le Monde au capital", group: "Le Monde diplomatique", type: "prive", funding: "Abonnements et ventes" },
    { domains: ["charliehebdo.fr"], name: "Charlie Hebdo", owner: "Salariés majoritaires, via Les Éditions Rotative", group: "Les Éditions Rotative", type: "prive", funding: "Ventes et abonnements, sans publicité" },
    { domains: ["alternatives-economiques.fr"], name: "Alternatives Économiques", owner: "Société coopérative détenue par ses salariés", group: "Alternatives Économiques", type: "cooperative", funding: "Abonnements, sans actionnaire extérieur" },
    { domains: ["capital.fr", "geo.fr", "voici.fr", "femmeactuelle.fr"], name: "Prisma Media", owner: "Vincent Bolloré, via Vivendi", group: "Vivendi (Bolloré)", type: "prive", funding: "Publicité et ventes" },
    { domains: ["parismatch.com", "jdd.fr", "europe1.fr"], name: "Lagardère News", owner: "Vincent Bolloré, via Vivendi et Lagardère", group: "Lagardère (Vivendi, Bolloré)", type: "prive", funding: "Publicité, ventes et abonnements" },

    // Audiovisuel
    { domains: ["francetvinfo.fr", "franceinfo.fr", "france.tv", "francetelevisions.fr"], name: "France Télévisions", owner: "État français, entreprise publique", group: "France Télévisions", type: "service-public", funding: "Dotation publique, en remplacement de la redevance supprimée en 2022" },
    { domains: ["radiofrance.fr", "franceinter.fr", "franceculture.fr", "francebleu.fr", "fip.fr"], name: "Radio France", owner: "État français, entreprise publique", group: "Radio France", type: "service-public", funding: "Dotation publique et publicité limitée" },
    { domains: ["arte.tv"], name: "Arte", owner: "Chaîne publique franco-allemande, groupement européen d’intérêt économique", group: "Arte GEIE", type: "service-public", funding: "Dotations publiques française et allemande" },
    { domains: ["france24.com", "rfi.fr", "mc-doualiya.com"], name: "France Médias Monde", owner: "État français, entreprise publique de l’audiovisuel extérieur", group: "France Médias Monde", type: "service-public", funding: "Dotation publique" },
    { domains: ["tf1.fr", "lci.fr", "tf1info.fr"], name: "Groupe TF1", owner: "Groupe Bouygues, actionnaire de contrôle", group: "Bouygues", type: "prive", funding: "Publicité" },
    { domains: ["m6.fr", "rtl.fr", "6play.fr"], name: "Groupe M6", owner: "Groupe coté, avec Bertelsmann (RTL Group) comme actionnaire de référence", group: "RTL Group / Bertelsmann", type: "prive", funding: "Publicité" },
    { domains: ["cnews.fr", "canalplus.com"], name: "CNews / Canal+", owner: "Vincent Bolloré, actionnaire de contrôle de Canal+ après la scission de Vivendi fin 2024", group: "Canal+ (Bolloré)", type: "prive", funding: "Publicité et abonnements" },
    { domains: ["bfmtv.com", "rmc.fr"], name: "BFMTV / RMC", owner: "Rodolphe Saadé, via CMA CGM, après le rachat à Altice en 2024", group: "CMA CGM", type: "prive", funding: "Publicité" },

    // Pure players et médias indépendants
    { domains: ["mediapart.fr"], name: "Mediapart", owner: "Fonds pour une presse libre et Société des amis de Mediapart, capital verrouillé depuis 2019", group: "Société éditrice de Mediapart", type: "fondation", funding: "Abonnements uniquement, sans publicité ni subvention" },
    { domains: ["arretsurimages.net"], name: "Arrêt sur images", owner: "Salariés et lecteurs actionnaires", group: "Arrêt sur images", type: "prive", funding: "Abonnements uniquement, sans publicité" },
    { domains: ["lesjours.fr"], name: "Les Jours", owner: "Journalistes fondateurs et salariés", group: "Les Jours", type: "prive", funding: "Abonnements, sans publicité" },
    { domains: ["reporterre.net"], name: "Reporterre", owner: "Association à but non lucratif", group: "Reporterre", type: "association", funding: "Dons des lecteurs, sans publicité" },
    { domains: ["basta.media"], name: "Basta !", owner: "Association à but non lucratif", group: "Basta !", type: "association", funding: "Dons et subventions à la presse, sans publicité" },
    { domains: ["blast-info.fr"], name: "Blast", owner: "Structure associative portée par ses fondateurs", group: "Blast", type: "association", funding: "Dons et abonnements, sans publicité" },
    { domains: ["slate.fr"], name: "Slate.fr", owner: "Éditeur indépendant français, licence de la marque Slate", group: "Slate.fr", type: "prive", funding: "Publicité et partenariats" },
    { domains: ["huffingtonpost.fr"], name: "Le HuffPost", owner: "Groupe Le Monde depuis 2019", group: "Groupe Le Monde", type: "prive", funding: "Publicité" },
    { domains: ["konbini.com"], name: "Konbini", owner: "Éditeur indépendant, avec des investisseurs privés minoritaires", group: "Konbini", type: "prive", funding: "Publicité et contenus de marque" },

    // Presse quotidienne régionale
    { domains: ["ouest-france.fr"], name: "Ouest-France", owner: "Association pour le soutien des principes de la démocratie humaniste, via SIPA-Ouest France : structure non capitalistique", group: "SIPA-Ouest France", type: "association", funding: "Ventes, abonnements et publicité" },
    { domains: ["20minutes.fr"], name: "20 Minutes", owner: "Groupe Rossel et SIPA-Ouest France, à parts égales", group: "Rossel / SIPA-Ouest France", type: "prive", funding: "Publicité, gratuit pour le lecteur" },
    { domains: ["sudouest.fr"], name: "Sud Ouest", owner: "Famille Lemoîne, actionnaire historique", group: "Groupe Sud Ouest", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["ladepeche.fr"], name: "La Dépêche du Midi", owner: "Famille Baylet", group: "Groupe La Dépêche", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["lavoixdunord.fr"], name: "La Voix du Nord", owner: "Groupe belge Rossel", group: "Rossel", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["letelegramme.fr"], name: "Le Télégramme", owner: "Famille Coudurier", group: "Groupe Télégramme", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["leprogres.fr", "ledauphine.com", "estrepublicain.fr", "dna.fr", "lalsace.fr", "bienpublic.com", "vosgesmatin.fr", "lejsl.com"], name: "Groupe EBRA", owner: "Crédit Mutuel Alliance Fédérale", group: "EBRA (Crédit Mutuel)", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["nicematin.com", "varmatin.com", "monacomatin.mc"], name: "Nice-Matin", owner: "Groupe Nice-Matin, adossé à des investisseurs privés après la période coopérative", group: "Groupe Nice-Matin", type: "prive", funding: "Ventes, abonnements et publicité" },

    // International
    { domains: ["theguardian.com"], name: "The Guardian", owner: "Scott Trust Limited, structure sans actionnaire privé destinée à garantir l’indépendance du titre", group: "Guardian Media Group", type: "fondation", funding: "Contributions des lecteurs et publicité, sans mur payant" },
    { domains: ["nytimes.com"], name: "The New York Times", owner: "Société cotée, contrôle familial Ochs-Sulzberger via des actions à droit de vote renforcé", group: "The New York Times Company", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["washingtonpost.com"], name: "The Washington Post", owner: "Jeff Bezos, via Nash Holdings", group: "Nash Holdings", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["wsj.com", "barrons.com", "marketwatch.com"], name: "The Wall Street Journal", owner: "Famille Murdoch, via News Corp et Dow Jones", group: "News Corp", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["foxnews.com"], name: "Fox News", owner: "Famille Murdoch, via Fox Corporation", group: "Fox Corporation", type: "prive", funding: "Publicité et redevances des câblo-opérateurs" },
    { domains: ["cnn.com"], name: "CNN", owner: "Warner Bros. Discovery, société cotée", group: "Warner Bros. Discovery", type: "prive", funding: "Publicité et redevances des distributeurs" },
    { domains: ["reuters.com"], name: "Reuters", owner: "Thomson Reuters, contrôlé par la famille Thomson via Woodbridge", group: "Thomson Reuters", type: "prive", funding: "Abonnements professionnels et licences" },
    { domains: ["apnews.com"], name: "Associated Press", owner: "Coopérative à but non lucratif détenue par ses médias membres", group: "Associated Press", type: "non-lucratif", funding: "Cotisations des membres et licences" },
    { domains: ["bbc.com", "bbc.co.uk"], name: "BBC", owner: "Société publique britannique sous charte royale", group: "BBC", type: "service-public", funding: "Redevance audiovisuelle britannique" },
    { domains: ["dw.com"], name: "Deutsche Welle", owner: "Radiodiffuseur public allemand pour l’étranger", group: "Deutsche Welle", type: "service-public", funding: "Budget fédéral allemand" },
    { domains: ["npr.org"], name: "NPR", owner: "Organisation à but non lucratif détenue par ses stations membres", group: "National Public Radio", type: "non-lucratif", funding: "Cotisations des stations, dons et mécénat" },
    { domains: ["ft.com"], name: "Financial Times", owner: "Groupe japonais Nikkei depuis 2015", group: "Nikkei", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["economist.com"], name: "The Economist", owner: "Actionnariat familial et institutionnel, avec Exor (famille Agnelli) comme premier actionnaire", group: "The Economist Group", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["politico.eu", "politico.com"], name: "Politico", owner: "Groupe allemand Axel Springer", group: "Axel Springer", type: "prive", funding: "Abonnements professionnels, publicité et événements" },
    { domains: ["theatlantic.com"], name: "The Atlantic", owner: "Emerson Collective, structure de Laurene Powell Jobs", group: "Emerson Collective", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["spiegel.de"], name: "Der Spiegel", owner: "Héritiers de Rudolf Augstein et société des salariés, actionnaire significatif", group: "Spiegel-Verlag", type: "prive", funding: "Abonnements, ventes et publicité" },
    { domains: ["zeit.de"], name: "Die Zeit", owner: "Groupe Holtzbrinck", group: "Holtzbrinck", type: "prive", funding: "Abonnements, ventes et publicité" },
    { domains: ["faz.net"], name: "Frankfurter Allgemeine Zeitung", owner: "FAZIT-Stiftung, fondation d’intérêt public", group: "FAZIT-Stiftung", type: "fondation", funding: "Abonnements, ventes et publicité" },
    { domains: ["elpais.com"], name: "El País", owner: "Groupe espagnol Prisa, société cotée", group: "Prisa", type: "prive", funding: "Abonnements et publicité" },
    { domains: ["corriere.it"], name: "Corriere della Sera", owner: "Urbano Cairo, via RCS MediaGroup", group: "RCS MediaGroup", type: "prive", funding: "Ventes, abonnements et publicité" },
    { domains: ["euronews.com"], name: "Euronews", owner: "Fonds portugais Alpac Capital, actionnaire majoritaire", group: "Alpac Capital", type: "prive", funding: "Publicité et partenariats institutionnels" },
    { domains: ["aljazeera.com", "aljazeera.net"], name: "Al Jazeera", owner: "Réseau financé par l’État du Qatar", group: "Al Jazeera Media Network", type: "service-public", funding: "Financement de l’État qatarien" },
    { domains: ["rt.com"], name: "RT", owner: "Média financé par l’État russe", group: "TV-Novosti", type: "service-public", funding: "Budget de l’État russe" }
  ];

  const MULTI_LABEL_SUFFIXES = new Set(["co.uk", "com.au", "co.jp", "com.br", "co.nz", "com.mx"]);

  const registrable = (hostname = "") => {
    const labels = hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "").split(".").filter(Boolean);
    if (labels.length <= 2) return labels.join(".");
    const lastTwo = labels.slice(-2).join(".");
    if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
    return lastTwo;
  };

  const index = new Map();
  for (const outlet of OUTLETS) {
    for (const domain of outlet.domains) index.set(domain, outlet);
  }

  const lookupMedia = (url = "") => {
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return null;
    }

    const outlet = index.get(registrable(hostname));
    if (!outlet) return null;

    return {
      name: outlet.name,
      owner: outlet.owner,
      group: outlet.group,
      type: outlet.type,
      typeLabel: OWNER_TYPES[outlet.type] || outlet.type,
      funding: outlet.funding,
      snapshot: SNAPSHOT
    };
  };

  const api = Object.freeze({ lookupMedia, OUTLETS, OWNER_TYPES, SNAPSHOT });

  globalThis.__dpaMediaOwnership = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
