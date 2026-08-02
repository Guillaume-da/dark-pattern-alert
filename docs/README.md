# Captures d’écran

Ces captures sont générées localement à partir de l’extension et de sa page de démonstration. Elles peuvent être réutilisées dans le README principal, une page produit ou la fiche du Chrome Web Store.

## Écran d’accueil

Le panneau explique immédiatement ce qui est analysé et rappelle que les données restent dans le navigateur.

![Accueil du panneau Dark Pattern Alert](screenshots/01-extension-welcome.png)

## Page de démonstration

La page de test rassemble des choix commerciaux précochés, un compteur d’urgence, un récapitulatif qui ajoute des frais au prix annoncé, des conditions d’abonnement volontairement contraignantes, un formulaire de paiement envoyé en HTTP vers un domaine tiers et un cadre de suivi masqué.

![Page de démonstration contenant plusieurs dark patterns](screenshots/02-demo-page.png)

## Surlignage dans la page

Chaque élément signalé est encadré pour permettre à l’utilisateur de le retrouver immédiatement.

![Éléments suspects surlignés dans la page](screenshots/03-page-highlights.png)

## Rapport d’analyse

Le rapport s’ouvre sur la confiance accordée au site — identité du domaine, chiffrement, formulaires, cadres tiers, informations légales — puis présente un score indicatif, les catégories observées, le niveau de sévérité et la confiance de chaque détection.

![Rapport détaillé produit par l’extension](screenshots/04-analysis-results.png)

## Réputation et sécurité du site

La carte de confiance ouvre le rapport et détaille chaque vérification : identité du domaine, chiffrement, formulaires, cadres tiers, informations légales.

![Carte de réputation et de sécurité](screenshots/05-site-reputation.png)

## Éditeur et financement

Sur les sites de presse répertoriés, une carte indique qui possède le titre et comment il est financé. Aucune appréciation de la ligne éditoriale, aucun effet sur les scores.

![Carte éditeur et financement](screenshots/07-media-ownership.png)

## Réglages

Les quatre réglages tiennent dans un seul panneau, dont l’analyse de sécurité et la mémorisation des domaines analysés, effaçable d’un clic.

![Panneau de réglages](screenshots/06-settings.png)

## Régénérer les captures

`npm run capture` recrée les sept images avec le Chromium de Playwright, `npm run capture:system-chrome` avec un Chrome installé localement. Il utilise la page de démonstration et le moteur de détection réels, sans réseau ni données externes.
