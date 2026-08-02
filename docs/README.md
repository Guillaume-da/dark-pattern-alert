# Captures d’écran

Ces captures sont générées localement à partir de l’extension et de sa page de démonstration. Elles peuvent être réutilisées dans le README principal, une page produit ou la fiche du Chrome Web Store.

## Écran d’accueil

Le panneau explique immédiatement ce qui est analysé et rappelle que les données restent dans le navigateur.

![Accueil du panneau Dark Pattern Alert](screenshots/01-extension-welcome.png)

## Page de démonstration

La page de test rassemble des choix commerciaux précochés, un compteur d’urgence et des conditions d’abonnement volontairement contraignantes.

![Page de démonstration contenant plusieurs dark patterns](screenshots/02-demo-page.png)

## Surlignage dans la page

Chaque élément signalé est encadré pour permettre à l’utilisateur de le retrouver immédiatement.

![Éléments suspects surlignés dans la page](screenshots/03-page-highlights.png)

## Rapport d’analyse

Le rapport présente un score indicatif, les catégories observées, le niveau de sévérité et la confiance de chaque détection.

![Rapport détaillé produit par l’extension](screenshots/04-analysis-results.png)

## Régénérer les captures

Le script `scripts/capture-docs-with-system-chrome.cjs` recrée les quatre images avec Chrome installé localement. Il utilise la page de démonstration et le moteur de détection réels, sans réseau ni données externes.
