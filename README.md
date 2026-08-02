# Dark Pattern Alert

Extension Chrome (Manifest V3) qui répond à deux questions sur la page ouverte :

1. **Cette interface essaie-t-elle de m’influencer ?** — cases précochées, faux compteurs, boutons déséquilibrés, résiliation piégée.
2. **Puis-je faire confiance à ce site ?** — identité du domaine, chiffrement, formulaires, cadres tiers, mentions légales.

Tout est calculé **dans le navigateur, à la demande**. Aucune donnée n’est envoyée nulle part, aucun service de réputation externe n’est interrogé.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/01-extension-welcome.png" alt="Écran d’accueil du panneau latéral" /></td>
    <td width="50%"><img src="docs/screenshots/05-site-reputation.png" alt="Carte de réputation et de sécurité du site" /></td>
  </tr>
  <tr>
    <td align="center"><em>L’analyse ne démarre qu’à votre demande.</em></td>
    <td align="center"><em>Chaque signal est expliqué, jamais un simple verdict.</em></td>
  </tr>
</table>

## Installer en mode développeur

1. Ouvrir `chrome://extensions`.
2. Activer **Mode développeur**.
3. Cliquer sur **Charger l’extension non empaquetée**.
4. Choisir le dossier `dark-pattern-alert`.
5. Épingler l’extension, ouvrir un site, cliquer sur son icône : le panneau latéral s’ouvre.

Chrome 114 minimum (API `sidePanel`).

## Ce que l’extension repère

### 1. Interfaces trompeuses

| Catégorie | Exemples détectés |
| --- | --- |
| **Choix précoché** | case cochée par défaut, surtout sur une option commerciale (newsletter, assurance, abonnement) |
| **Urgence artificielle** | compte à rebours, « dernière chance », « offre limitée » dans un contexte marchand |
| **Interface trompeuse** | refus culpabilisant (« Non merci, je préfère payer plus cher »), bouton d’acceptation nettement plus visible que le refus |
| **Abonnement et résiliation** | renouvellement automatique, résiliation exigeant un appel ou un courrier, résiliation en ligne impossible |
| **Coûts ajoutés** | frais de service, de dossier ou de livraison qui gonflent le total après le prix annoncé ; mentions « hors frais », « + frais » ; part des frais dans le total |

Chaque détection porte une **sévérité**, un **niveau de confiance** et l’extrait de page qui l’a déclenchée. Le bouton « Voir dans la page » fait défiler jusqu’à l’élément et l’encadre.

### 2. Réputation et sécurité du site

**Identité du domaine**

- connexion non chiffrée (HTTP), port inhabituel, identifiants intégrés à l’URL ;
- adresse IP nue au lieu d’un nom de domaine ;
- domaine en punycode (`xn--`), qui permet les attaques homographes ;
- **imitation de marque** : orthographe très proche d’une marque connue (`paypa1.com`), ou nom de marque placé dans un domaine tiers (`paypal.secure-checkout.net`) ;
- accumulation de mots d’appât (`verify`, `login`, `compte`…), extension à faible réputation, empilement de sous-domaines.

**Sécurité de la page**

- mot de passe ou champs de carte bancaire demandés hors HTTPS ;
- formulaire postant en HTTP ou vers un autre domaine, en particulier avec des identifiants ;
- contenu mixte actif (scripts ou feuilles de style en HTTP sur une page HTTPS) ;
- cadres tiers masqués, nombre de domaines tiers exécutant du code, scripts embarqués réellement obfusqués ;
- absence de mentions légales, CGV ou contact sur une page marchande.

Le score de confiance part de 100 et descend selon les signaux trouvés : **≥ 80** aucun signal d’alerte, **55–79** prudence recommandée, **< 55** signaux préoccupants.

### 3. Éditeur et financement, sur les sites de presse

<table>
  <tr>
    <td width="46%"><img src="docs/screenshots/07-media-ownership.png" alt="Carte éditeur et financement" /></td>
    <td width="54%" valign="top">
      <p>Sur les médias répertoriés (~70 titres français et internationaux), le panneau indique <strong>qui possède le titre</strong>, à quel groupe il appartient et <strong>comment il est financé</strong> : capitaux privés, service public, coopérative, association, fonds de dotation.</p>
      <p>Ces informations sont <strong>strictement factuelles</strong>. L’extension ne classe aucun média sur un axe politique et ne note pas sa ligne éditoriale : elle donne de quoi se faire soi-même une opinion. La carte n’entre dans aucun score.</p>
    </td>
  </tr>
</table>

Les données sont un instantané daté, embarqué dans `media-ownership.js`. L’actionnariat des médias change souvent : la carte affiche sa date d’arrêt et invite à vérifier.

## Le rapport

<table>
  <tr>
    <td width="58%"><img src="docs/screenshots/04-analysis-results.png" alt="Rapport complet dans le panneau latéral" /></td>
    <td width="42%" valign="top">
      <p>Le panneau ouvre sur la <strong>confiance accordée au site</strong>, puis liste les procédés trompeurs de la page.</p>
      <p>Les signaux se filtrent par catégorie, se surlignent dans la page, et le rapport entier se copie en texte brut — pratique pour un signalement ou une capture d’historique.</p>
    </td>
  </tr>
</table>

Les éléments signalés sont encadrés directement dans la page :

<img src="docs/screenshots/03-page-highlights.png" alt="Éléments suspects surlignés dans la page de démonstration" width="720" />

## Vie privée

<table>
  <tr>
    <td width="46%"><img src="docs/screenshots/06-settings.png" alt="Panneau de réglages" /></td>
    <td width="54%" valign="top">
      <p>L’extension demande <code>activeTab</code>, <code>scripting</code>, <code>sidePanel</code> et <code>storage</code> — rien de plus. Elle n’observe pas la navigation en arrière-plan et n’ouvre aucune connexion réseau.</p>
      <p><strong>Mémoriser les domaines analysés</strong> conserve au plus 500 noms de domaine sur lesquels une analyse a été explicitement lancée, uniquement pour signaler une première visite. Ni URL complète, ni horodatage, ni contenu de page. Désactivable avant toute analyse, effaçable d’un clic.</p>
    </td>
  </tr>
</table>

Détail complet dans [`PRIVACY.md`](PRIVACY.md).

## Page de démonstration

`demo/index.html` rassemble volontairement des cases précochées, un compteur d’urgence, un récapitulatif qui ajoute 13,30 € de frais à un prix annoncé de 29,90 €, une résiliation par téléphone, un formulaire de paiement envoyé en HTTP vers un domaine tiers et un cadre de suivi masqué.

Depuis le dossier **parent** du projet :

```sh
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/dark-pattern-alert/demo/` et lancer l’analyse.

<img src="docs/screenshots/02-demo-page.png" alt="Page de démonstration" width="720" />

## Développement

```sh
npm test                 # les deux suites de règles
npm run capture          # régénère les captures de docs/ (Playwright)
npm run capture:system-chrome   # idem, avec un Chrome déjà installé
```

| Fichier | Rôle |
| --- | --- |
| `background.js` | ouvre le panneau latéral au clic sur l’icône |
| `sidepanel.html` / `.js` / `.css` | interface, orchestration de l’analyse, rendu du rapport |
| `content-scanner.js` | applique les règles de dark patterns dans la page |
| `content-overlay.css` | encadre les éléments signalés |
| `site-probe.js` | relève les faits de sécurité observables, sans les interpréter |
| `reputation-rules.js` | calcule le score de confiance ; logique pure, testable hors navigateur |
| `media-ownership.js` | table d’actionnariat et de financement des médias, et sa recherche par domaine |
| `detector-rules.js` | source unique des expressions de détection, lue par le scanner et vérifiée par les tests |

Séparer la collecte (`site-probe.js`) de l’évaluation (`reputation-rules.js`) permet de tester tout le raisonnement sous Node, sans navigateur.

## Limites assumées

Les résultats sont des **indices explicables, pas des preuves**.

- Un compteur ne peut pas être qualifié de faux à partir d’un seul instantané : l’extension invite à le vérifier plutôt qu’à conclure.
- Les frais sont lus dans le récapitulatif affiché : sur un tunnel où ils n’apparaissent qu’à l’étape suivante, l’extension ne peut rien voir avant d’y arriver. Un horaire de rendez-vous ou une date limite ne sont pas comptés comme des décomptes.
- Les contenus rendus dans des iframes ou des composants fermés échappent à l’analyse.
- Sans base de signalements ni WHOIS, l’analyse de réputation ignore l’âge du domaine et les campagnes d’hameçonnage en cours. **Un score de 100 signifie « rien d’anormal détectable localement », pas « site vérifié ».**
- La table des médias est un instantané embarqué : un rachat récent n’y figure pas, et un titre absent de la liste n’affiche aucune carte. Elle décrit l’actionnariat, jamais l’indépendance réelle d’une rédaction.
- La liste de marques est restreinte et le domaine enregistré est extrait avec une table de suffixes abrégée : des imitations passent, et un domaine légitime portant un nom de marque (filiale, revendeur) peut être signalé à tort.

## Prochaines étapes produit

- comparer le comportement d’un compteur entre deux visites ;
- détecter les coûts ajoutés au dernier moment ;
- analyser les parcours de résiliation sur plusieurs pages ;
- permettre de confirmer ou d’infirmer un signal pour affiner les règles localement ;
- préparer la fiche Chrome Web Store et compléter la politique de confidentialité avec les coordonnées de l’éditeur.
