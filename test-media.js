const assert = require("node:assert/strict");
const { lookupMedia, OUTLETS, OWNER_TYPES } = require("./media-ownership.js");

// Intégrité de la table : sans ces garanties, la carte afficherait des trous.
const seen = new Set();
for (const outlet of OUTLETS) {
  assert.ok(outlet.domains?.length, `domaines manquants pour ${outlet.name}`);
  for (const field of ["name", "owner", "group", "type", "funding"]) {
    assert.ok(outlet[field], `champ « ${field} » manquant pour ${outlet.name}`);
  }
  assert.ok(OWNER_TYPES[outlet.type], `type inconnu « ${outlet.type} » pour ${outlet.name}`);
  for (const domain of outlet.domains) {
    assert.match(domain, /^[a-z0-9.-]+\.[a-z]{2,}$/, `domaine mal formé : ${domain}`);
    assert.ok(!seen.has(domain), `domaine en double : ${domain}`);
    seen.add(domain);
  }
}

// Recherche par URL
const monde = lookupMedia("https://www.lemonde.fr/politique/article/2026/01/01/titre_123.html");
assert.equal(monde.name, "Le Monde");
assert.equal(monde.type, "prive");
assert.match(monde.owner, /Niel/);

assert.equal(lookupMedia("https://francetvinfo.fr/").type, "service-public");
assert.equal(lookupMedia("https://www.mediapart.fr/journal").type, "fondation");
assert.equal(lookupMedia("https://reporterre.net/").type, "association");
assert.equal(lookupMedia("https://apnews.com/hub/ap-top-news").type, "non-lucratif");
assert.equal(lookupMedia("https://alternatives-economiques.fr/").type, "cooperative");

// Sous-domaines et préfixes
assert.equal(lookupMedia("https://www.bbc.co.uk/news").name, "BBC");
assert.equal(lookupMedia("https://edition.cnn.com/").name, "CNN");
assert.equal(lookupMedia("https://www.leprogres.fr/").group, "EBRA (Crédit Mutuel)");

// Rien à afficher hors presse identifiée
assert.equal(lookupMedia("https://www.example.com/"), null);
assert.equal(lookupMedia("https://boutique-en-ligne.fr/panier"), null);
assert.equal(lookupMedia("pas-une-url"), null);
assert.equal(lookupMedia(""), null);

// Un domaine qui contient le nom d'un média sans en être un ne doit pas matcher
assert.equal(lookupMedia("https://lemonde.fr.phishing-example.com/"), null);

console.log(`${OUTLETS.length} médias vérifiés (${seen.size} domaines), recherche conforme.`);
