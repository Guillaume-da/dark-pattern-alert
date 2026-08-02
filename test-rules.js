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
