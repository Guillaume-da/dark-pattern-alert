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
- `content-overlay.css` affiche les éléments signalés.

L’extension utilise seulement `activeTab`, `scripting`, `sidePanel` et `storage`. Elle n’observe pas la navigation en arrière-plan et n’envoie aucun contenu à un serveur.

## Limites assumées

Les résultats sont des indices explicables, pas des preuves. Un compteur ne peut notamment pas être qualifié de faux à partir d’un seul instantané : l’extension invite donc l’utilisateur à le vérifier. Les sites rendus dans des iframes ou des composants fermés peuvent aussi échapper à l’analyse.

## Prochaines étapes produit

- comparer le comportement d’un compteur entre deux visites ;
- détecter les coûts ajoutés au dernier moment ;
- analyser les parcours de résiliation sur plusieurs pages ;
- permettre de confirmer ou d’infirmer un signal pour améliorer les règles localement ;
- préparer les captures, la fiche Store et une politique de confidentialité publique.
