const assert = require("node:assert/strict");
const { registrableDomain, analyzeUrl, analyzePage, buildTrustReport } = require("./reputation-rules.js");

const ids = (signals) => signals.map((signal) => signal.id);
const domainIds = (url, options) => ids(analyzeUrl(url, options).signals);

// Extraction du domaine enregistré
assert.equal(registrableDomain("www.leboncoin.fr"), "leboncoin.fr");
assert.equal(registrableDomain("a.b.c.example.co.uk"), "example.co.uk");
assert.equal(registrableDomain("impots.gouv.fr"), "impots.gouv.fr");

// Transport
assert.ok(domainIds("http://boutique.example.com/").includes("no-tls"));
assert.ok(domainIds("https://boutique.example.com/").includes("tls"));

// Identité du domaine
assert.ok(domainIds("https://paypal.com/fr").includes("known-brand"));
assert.ok(domainIds("https://www.paypal.com/fr").includes("known-brand"));
assert.ok(domainIds("https://paypa1.com/login").includes("typosquat"));
assert.ok(domainIds("https://paypal.secure-checkout.net/").includes("brand-impersonation"));
assert.ok(domainIds("https://xn--pypal-4ve.com/").includes("punycode"));
assert.ok(domainIds("https://192.168.4.10/login").includes("ip-host"));
assert.ok(domainIds("https://verify-account-login.tk/").includes("lure-keywords"));
assert.ok(domainIds("https://promo.xyz/").includes("risky-tld"));
assert.ok(domainIds("https://a.b.c.d.example.com/").includes("deep-subdomains"));
assert.ok(domainIds("https://example.com:8443/").includes("unusual-port"));
assert.ok(domainIds("https://example.com/", { firstVisit: true }).includes("first-visit"));

// Faux positifs à éviter
const clean = domainIds("https://www.example.com/produits");
assert.deepEqual(clean.filter((id) => id !== "tls"), []);
assert.ok(!domainIds("https://orangetheory-fitness.com/").includes("brand-impersonation"));
assert.ok(!domainIds("https://pineapple-shop.fr/").includes("brand-impersonation"));
assert.ok(domainIds("https://orange-verification.net/").includes("brand-impersonation"));

// Sécurité de la page
assert.ok(
  ids(analyzePage({ protocol: "http:", passwordFields: 1 })).includes("password-on-http")
);
assert.ok(
  ids(analyzePage({ protocol: "http:", paymentFields: 2 })).includes("payment-on-http")
);
assert.ok(
  ids(analyzePage({ protocol: "https:", insecureFormActions: 1 })).includes("insecure-form-action")
);
assert.ok(
  ids(
    analyzePage({ protocol: "https:", crossOriginForms: 1, crossOriginCredentialForms: 1, crossOriginFormOrigins: ["collector.example"] })
  ).includes("cross-origin-credentials")
);
assert.ok(ids(analyzePage({ protocol: "https:", activeMixedContent: 2 })).includes("active-mixed-content"));
assert.ok(ids(analyzePage({ protocol: "https:", hiddenCrossOriginFrames: 1 })).includes("hidden-frames"));
assert.ok(ids(analyzePage({ protocol: "https:", obfuscatedInlineScripts: 1 })).includes("obfuscated-scripts"));
assert.ok(
  ids(analyzePage({ protocol: "https:", commercePage: true, legalLinks: {} })).includes("no-legal-pages")
);
assert.ok(
  ids(
    analyzePage({ protocol: "https:", commercePage: true, legalLinks: { legal: true, privacy: true, terms: true, contact: true } })
  ).includes("legal-pages")
);

// Score agrégé
const trustedReport = buildTrustReport({
  url: "https://www.leboncoin.fr/annonces",
  facts: {
    protocol: "https:",
    commercePage: true,
    legalLinks: { legal: true, privacy: true, terms: true, contact: true },
    thirdPartyScriptOrigins: ["cdn.leboncoin.fr"]
  }
});
assert.equal(trustedReport.score, 100);
assert.equal(trustedReport.level, "trusted");
assert.equal(trustedReport.alertCount, 0);

const phishingReport = buildTrustReport({
  url: "http://paypal.secure-login-verify.tk/session",
  facts: {
    protocol: "http:",
    passwordFields: 1,
    commercePage: false,
    legalLinks: {},
    crossOriginForms: 1,
    crossOriginCredentialForms: 1,
    crossOriginFormOrigins: ["collector.example"]
  },
  firstVisit: true
});
assert.equal(phishingReport.level, "risky");
assert.ok(phishingReport.score <= 20);
assert.ok(ids(phishingReport.signals).includes("brand-impersonation"));
assert.ok(ids(phishingReport.signals).includes("password-on-http"));
assert.equal(phishingReport.signals[0].severity, "high");

// Une URL invalide ne doit pas faire échouer l’analyse
assert.doesNotThrow(() => buildTrustReport({ url: "not-a-url", facts: { protocol: "https:" } }));

console.log("Règles de réputation vérifiées avec succès.");

// Contexte local : ni HTTP ni IP ne doivent alarmer sur la boucle locale
assert.ok(!domainIds("http://localhost:8080/demo/").includes("no-tls"));
assert.ok(!domainIds("http://127.0.0.1:8080/demo/").includes("ip-host"));
assert.ok(!ids(analyzePage({ protocol: "http:", secureContext: true, passwordFields: 1 })).includes("password-on-http"));
assert.ok(ids(analyzePage({ protocol: "http:", secureContext: false, passwordFields: 1 })).includes("password-on-http"));

console.log("Cas de boucle locale vérifiés.");
assert.ok(!domainIds("http://127.0.0.1:45001/demo/").includes("unusual-port"));
assert.ok(domainIds("https://boutique.example.com:45001/").includes("unusual-port"));
