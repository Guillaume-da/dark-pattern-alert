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
