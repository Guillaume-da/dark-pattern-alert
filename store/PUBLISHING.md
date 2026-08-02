# Publier sur le Chrome Web Store — marche à suivre

Le texte à coller dans chaque champ est dans [`LISTING.md`](LISTING.md).
Ce document décrit **où cliquer, dans quel ordre, et ce qui bloque**.

---

## Avant de commencer

| Prérequis | Détail |
| --- | --- |
| Compte Google | Celui qui possédera l’extension. Un transfert ultérieur est possible mais pénible : choisissez-le maintenant. |
| Frais d’inscription | **5 $ US, une seule fois**, par compte développeur, non remboursables. |
| Vérification d’identité | Google demande une adresse e-mail vérifiée, et parfois une pièce d’identité ou une adresse postale pour les comptes publiant en Europe. Comptez quelques jours si la vérification est déclenchée. |
| Politique de confidentialité publique | `PRIVACY.md` du dépôt, **complété de vos coordonnées** (voir point 1 des blocages ci-dessous). |

Inscription : <https://chrome.google.com/webstore/devconsole> → *Register as a developer*.

---

## Étape 1 — Construire l’archive

```sh
npm run package
```

Produit `store/dark-pattern-alert-<version>.zip`. Le script :

- n’embarque que les onze fichiers exécutés plus le dossier `icons/` — ni tests,
  ni captures, ni scripts de build, ni `node_modules` ;
- refuse de produire l’archive si le résumé dépasse 132 caractères, si le nom
  dépasse 75 caractères, ou si une taille d’icône manque au manifeste ;
- neutralise les horodatages, donc deux exécutions donnent une archive identique.

L’archive fait environ 54 Ko. Vérifiez la liste affichée : elle doit contenir
**15 entrées** et rien d’autre.

## Étape 2 — Régénérer les visuels si le panneau a changé

```sh
npm run capture        # captures du panneau
npm run store:assets   # visuels de la fiche, à partir des captures
npm run icons          # icônes 16/32/48/128, si la palette a changé
```

`store:assets` échoue explicitement si les captures manquent, plutôt que de
produire des visuels vides.

## Étape 3 — Créer l’élément

1. Tableau de bord → **Items** → **Add new item**.
2. Téléverser le `.zip` de l’étape 1.
3. Google analyse le manifeste et crée la fiche. Les erreurs de manifeste
   apparaissent immédiatement.

## Étape 4 — Remplir la fiche

Dans l’ordre des onglets, avec `LISTING.md` ouvert à côté :

1. **Store listing** — nom, résumé, description, catégorie, langue, puis les
   visuels du tableau de la section 2.
2. **Privacy** — objectif unique, les quatre justifications de permission, la
   déclaration d’absence de code distant, les cases d’utilisation des données,
   les trois attestations, l’URL de la politique de confidentialité.
3. **Distribution** — visibilité, régions, gratuité.

Un onglet incomplet empêche la soumission et le bouton indique lequel.

## Étape 5 — Soumettre

**Submit for review**. Puis :

- délai habituel : de quelques heures à quelques jours ; comptez plus long pour
  une première soumission, la vérification du compte s’y ajoutant ;
- l’état passe par *Pending review*, puis *Published* ou *Rejected* ;
- un rejet arrive par e-mail avec le motif et la clause de règlement en cause. La
  correction se fait sur la même fiche, sans nouveaux frais.

---

## Ce qui bloque aujourd’hui

1. **`PRIVACY.md` n’a pas de coordonnées d’éditeur.** Sa dernière phrase le dit
   elle-même. Une politique sans moyen de contact est un motif de rejet fréquent.
2. **Aucune adresse de contact vérifiée** n’est encore renseignée dans un compte
   développeur — il n’y a pas encore de compte.
3. **Version `0.1.0`.** Rien ne l’interdit, mais une première publication est
   généralement en `1.0.0`. Décidez avant de construire l’archive : le numéro
   figure dans son nom, et une version publiée ne peut jamais être réutilisée.

---

## Motifs de rejet à surveiller pour cette extension en particulier

| Risque | Pourquoi il concerne ce projet | Parade |
| --- | --- | --- |
| Objectif multiple | La fiche présente quatre familles de fonctions : dark patterns, sécurité, éditeur d’un média, parcours de résiliation. | Le texte « Single purpose » de `LISTING.md` les rattache explicitement au même but : expliquer à l’utilisateur ce que la page cherche à obtenir de lui. |
| Justification de permission jugée vague | `scripting` est la permission la plus scrutée. | La justification fournie explique *pourquoi le rendu final est nécessaire* — contraste et taille des boutons, éléments masqués — et pas seulement ce que fait l’extension. |
| Déclaration de données contredite par le code | L’extension écrit des noms de domaine et des chemins de page dans `chrome.storage`. | La note « Web history » de `LISTING.md` donne la réponse exacte : rien n’est transmis, les relevés sont facultatifs et effaçables. Ne cochez pas les cases : elles portent sur la collecte. |
| Nom de marque dans les visuels | Les captures montrent la carte éditeur du *Monde* et un faux domaine `paiement-securise-verification.example`. | Le domaine est en `.example`, réservé à la documentation. La carte éditeur n’affiche que des faits d’actionnariat, sans logo ni charte du titre. |
| Capture non représentative | Les visuels sont composés, avec un texte de présentation à côté du panneau. | C’est admis tant que l’interface montrée est authentique : elle l’est, les captures sortent du panneau réel rendu par Chromium. |

---

## Après publication

- **Mise à jour** : incrémentez `version` dans `manifest.json`, `npm run package`,
  puis *Package* → *Upload new package* sur la fiche existante. Chaque mise à jour
  repasse en revue.
- **Table des médias** : `media-ownership.js` est un instantané daté. Un rachat
  rend une entrée fausse ; c’est le fichier le plus susceptible d’exiger une mise
  à jour, indépendamment du code.
- **Statistiques** : le tableau de bord ne donne que des installations et des
  désinstallations. L’extension n’émettant aucune télémétrie, il n’y a pas d’autre
  source — c’est le prix, assumé, du fonctionnement entièrement local.
