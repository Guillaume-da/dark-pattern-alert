const assert = require("node:assert/strict");
const { patterns } = require("./detector-rules.js");

const shouldMatch = [
  [patterns.sensitiveChoice, "Recevoir les offres marketing de nos partenaires"],
  [patterns.timer, "Plus que 00:09:42"],
  [patterns.urgency, "Dernière chance, cette offre expire bientôt"],
  [patterns.confirmShaming, "Non merci, je préfère payer plus cher"],
  [patterns.acceptControl, "Tout accepter"],
  [patterns.rejectControl, "Tout refuser"],
  [patterns.cancellationFriction, "Pour résilier votre abonnement, contactez le service client par téléphone"],
  [patterns.autoRenew, "Votre abonnement sera renouvelé automatiquement"],
  [patterns.onlineCancellationBlock, "Impossible de résilier en ligne"]
];

const shouldNotMatch = [
  [patterns.timer, "Livraison prévue le 12 août"],
  [patterns.urgency, "Découvrez notre nouvelle collection"],
  [patterns.confirmShaming, "Non merci"],
  [patterns.cancellationFriction, "Vous pouvez résilier en un clic depuis votre compte"]
];

for (const [pattern, sample] of shouldMatch) assert.match(sample, pattern);
for (const [pattern, sample] of shouldNotMatch) assert.doesNotMatch(sample, pattern);

console.log(`${shouldMatch.length + shouldNotMatch.length} règles vérifiées avec succès.`);

const extraNoMatch = [
  [patterns.urgency, "Les conseils de l'IA pour éviter le blues de la rentrée"],
  [patterns.urgency, "Il roulait à vitesse réduite"],
  [patterns.urgency, "Leftover budget for next year"]
];
for (const [pattern, sample] of extraNoMatch) assert.doesNotMatch(sample, pattern);
console.log(`${extraNoMatch.length} pièges de frontière de mot écartés.`);

// Formes de compteur : l'horloge est un décompte, la durée non
assert.match("00:09:42", patterns.clock);
assert.doesNotMatch("3 min", patterns.clock);
assert.match("3 min", patterns.duration);
assert.match("Temps de lecture : 4 min", patterns.readingTime);
assert.doesNotMatch("Plus que 2 min avant la fin de l'offre", patterns.readingTime);
console.log("Formes horloge, durée et temps de lecture distinguées.");

// Lecture des montants, formats français et anglais
const { parseAmount } = require("./detector-rules.js");
assert.equal(parseAmount("Frais de service 4,90 €"), 4.9);
assert.equal(parseAmount("Total 1 234,56 €"), 1234.56);
assert.equal(parseAmount("$1,234.56"), 1234.56);
assert.equal(parseAmount("€29.90"), 29.9);
assert.equal(parseAmount("Frais de dossier 12€"), 12);
assert.equal(parseAmount("Livraison offerte"), null);
assert.equal(parseAmount("06 12 34 56 78"), null);
assert.equal(parseAmount(""), null);

// Frais opaques contre frais attendus
assert.match("Frais de service", patterns.opaqueFee);
assert.match("Frais de dossier", patterns.opaqueFee);
assert.match("Booking fee", patterns.opaqueFee);
assert.match("Supplément bagage", patterns.opaqueFee);
assert.match("Frais de livraison", patterns.expectedFee);
assert.doesNotMatch("Frais de livraison", patterns.opaqueFee);
assert.doesNotMatch("Sans frais cachés", patterns.opaqueFee);

// Total et mentions de prix incomplet
assert.match("Total à payer", patterns.totalLabel);
assert.match("Montant dû", patterns.totalLabel);
assert.match("Prix hors frais de service", patterns.hiddenCostMention);
assert.match("À partir de 19 € + frais", patterns.hiddenCostMention);
assert.doesNotMatch("Tous frais inclus", patterns.hiddenCostMention);

console.log("Lecture des montants et règles de frais vérifiées.");

// Horaires contre décomptes
assert.match("aujourd’hui à 21:00", patterns.scheduleMarker);
assert.match("7 août, 23:59 (CET)", patterns.scheduleMarker);
assert.match("Jusqu'au 12/09/2026", patterns.scheduleMarker);
assert.doesNotMatch("00:09:42", patterns.scheduleMarker);
assert.doesNotMatch("Plus que 02:15", patterns.scheduleMarker);
console.log("Horaires distingués des décomptes.");

// Lecture d'un décompte
const { parseCountdown, compareCounter, calculateScore } = require("./detector-rules.js");
assert.equal(parseCountdown("00:09:42"), 582);
assert.equal(parseCountdown("09:42"), 582);
assert.equal(parseCountdown("Plus que 01:00:00"), 3600);
assert.equal(parseCountdown("aucun chiffre"), null);
assert.equal(parseCountdown("00:00"), null);

// Comparaison entre deux visites
const t0 = 1_700_000_000_000;
const at = (minutes) => t0 + minutes * 60_000;
const before = (seconds, minutes) => ({ seconds, observedAt: at(-minutes) });

assert.equal(compareCounter(null, 600, t0).verdict, "first");
assert.equal(compareCounter(before(600, 0.5), 600, t0).verdict, "too-soon");
// Décompte honnête : il perd exactement le temps écoulé
assert.equal(compareCounter(before(900, 5), 600, t0).verdict, "consistent");
// Il en affiche davantage qu'à la visite précédente
assert.equal(compareCounter(before(600, 5), 900, t0).verdict, "reset");
// Il aurait dû atteindre zéro depuis longtemps et tourne encore
assert.equal(compareCounter(before(600, 20), 300, t0).verdict, "restarted");
// Il n'a pas bougé alors que le temps a passé
assert.equal(compareCounter(before(900, 10), 880, t0).verdict, "stalled");
// Il descend plus vite que le temps réel
assert.equal(compareCounter(before(3600, 5), 60, t0).verdict, "faster");
// La tolérance absorbe un écart de quelques secondes
assert.equal(compareCounter(before(900, 5), 590, t0).verdict, "consistent");

// Le score doit refléter une requalification en sévérité basse
const withHigh = [{ category: "urgency", severity: "high", confidence: 0.9 }];
const withLow = [{ category: "urgency", severity: "low", confidence: 0.88 }];
assert.ok(calculateScore(withHigh) > calculateScore(withLow));
assert.equal(calculateScore([]), 0);

console.log("Décomptes lus et comparés entre deux visites.");
