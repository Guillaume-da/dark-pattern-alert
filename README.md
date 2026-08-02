# Dark Pattern Alert

Extension Chrome Manifest V3 qui repère des signaux d’interfaces trompeuses et les explique dans un panneau latéral.

## MVP

- choix et options commerciales précochés ;
- compteurs d’urgence suspects ;
- formulations culpabilisantes et choix visuellement déséquilibrés ;
- renouvellements automatiques et démarches de résiliation contraignantes ;
- score indicatif, niveau de confiance et surlignage dans la page ;
- rapport copiable ;
- traitement entièrement local, à la demande.

## Réputation et sécurité du site

Chaque analyse produit aussi un score de confiance sur 100 pour le site lui-même, calculé sans aucun appel réseau.

Identité du domaine :

- connexion non chiffrée (HTTP), port inhabituel, identifiants intégrés à l’URL ;
- adresse IP nue au lieu d’un nom de domaine ;
- domaine en punycode (`xn--`), qui permet les attaques homographes ;
- imitation de marque : orthographe très proche d’une marque connue, ou nom de marque placé dans un domaine tiers (`paypal.secure-checkout.net`) ;
- accumulation de mots d’appât (`verify`, `login`, `compte`…), extension à faible réputation, empilement de sous-domaines.

Sécurité de la page :

- mot de passe ou champs de carte bancaire demandés hors HTTPS ;
- formulaire postant en HTTP ou vers un autre domaine, en particulier avec des identifiants ;
- contenu mixte actif (scripts ou feuilles de style en HTTP sur une page HTTPS) ;
- iframes tierces masquées, nombre de domaines tiers exécutant du code, scripts embarqués obfusqués ;
- absence de mentions légales, CGV ou contact sur une page marchande.

Le détail des vérifications se déplie dans le panneau et figure dans le rapport copié. Deux réglages encadrent la fonctionnalité : **Analyse de sécurité du site** (activable/désactivable) et **Mémoriser les domaines analysés**, qui sert uniquement à signaler une première visite et se vide depuis les réglages.

## Tests

```sh
npm test                 # les deux suites
node test-rules.js       # règles de détection des dark patterns
node test-reputation.js  # règles de réputation et de sécurité
```

Les captures de `docs/` se régénèrent avec `npm install && npm run capture` (Playwright), ou `npm run capture:system-chrome` pour réutiliser un Chrome déjà installé.

## Installer en mode développeur

1. Ouvrir `chrome://extensions` dans Chrome.
2. Activer **Mode développeur**.
3. Cliquer sur **Charger l’extension non empaquetée**.
4. Choisir le dossier `dark-pattern-alert`.
5. Épingler l’extension, ouvrir une page web, puis cliquer sur son icône.

Pour tester tous les détecteurs, ouvrir `demo/index.html` via un petit serveur local. Par exemple, depuis le dossier du projet :

```sh
python3 -m http.server 8080
```

Puis visiter `http://localhost:8080/dark-pattern-alert/demo/`.

## Architecture

- `background.js` ouvre le panneau latéral depuis l’icône Chrome ;
- `sidepanel.*` contient l’interface et orchestre l’analyse ;
- `content-scanner.js` applique les règles de détection dans la page ;
- `content-overlay.css` affiche les éléments signalés ;
- `site-probe.js` relève les faits de sécurité observables (formulaires, cadres, scripts, liens légaux) sans les interpréter ;
- `reputation-rules.js` calcule le score de confiance à partir de l’URL et de ces faits ; logique pure, testable hors navigateur.

L’extension utilise seulement `activeTab`, `scripting`, `sidePanel` et `storage`. Elle n’observe pas la navigation en arrière-plan et n’envoie aucun contenu à un serveur.

## Limites assumées

Les résultats sont des indices explicables, pas des preuves. Un compteur ne peut notamment pas être qualifié de faux à partir d’un seul instantané : l’extension invite donc l’utilisateur à le vérifier. Les sites rendus dans des iframes ou des composants fermés peuvent aussi échapper à l’analyse.

L’analyse de réputation hérite des limites du choix « tout local » : sans base de signalements ni WHOIS, elle ne connaît ni l’âge du domaine ni les campagnes de phishing en cours. Un score de 100 signifie « aucune anomalie détectable localement », pas « site vérifié ». La liste de marques est restreinte et le domaine enregistré est extrait avec une table de suffixes abrégée, ce qui laisse passer des imitations et peut signaler à tort un domaine légitime portant un nom de marque (filiale, revendeur, partenaire).

## Prochaines étapes produit

- comparer le comportement d’un compteur entre deux visites ;
- détecter les coûts ajoutés au dernier moment ;
- analyser les parcours de résiliation sur plusieurs pages ;
- permettre de confirmer ou d’infirmer un signal pour améliorer les règles localement ;
- préparer les captures, la fiche Store et une politique de confidentialité publique.
