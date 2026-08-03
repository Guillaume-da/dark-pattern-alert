# Publier sur le Chrome Web Store — marche à suivre

Le texte à coller dans chaque champ est dans [`LISTING.md`](LISTING.md).
Ce document décrit **où cliquer, dans quel ordre, et ce qui bloque**.

---

## Avant de commencer

Le compte développeur existe déjà : les 5 $ d’inscription et la création de compte
sont derrière vous. Restent quatre vérifications, dans l’onglet **Account**
du tableau de bord.

| Élément | Valeur | État |
| --- | --- | --- |
| Nom d’éditeur affiché | **Guillaume Dall Olmo** | confirmé — c’est ce qui apparaîtra sous le nom de l’extension |
| Adresse e-mail de contact | **guillaume.dallolmo@gmail.com** | confirmée, et identique à celle de `PRIVACY.md` |
| Statut de l’adresse | *verified* | à confirmer dans l’onglet **Account** : une adresse non vérifiée bloque la soumission sans toujours le dire clairement |
| Vérification d’identité | — | Pour un éditeur situé dans l’Union européenne, le règlement sur les services numériques impose l’affichage de coordonnées de commerçant. Si Google ne l’a pas encore demandée, elle peut l’être à la première soumission : pièce d’identité ou adresse postale, quelques jours de délai. |

Politique de confidentialité à coller dans la fiche :
<https://github.com/Guillaume-da/dark-pattern-alert/blob/main/PRIVACY.md>

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
2. **Privacy** — objectif unique, les cinq justifications de permission — dont
   celle des permissions d’hôte facultatives, champ apparu avec la `0.1.1` —, la
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

## Points tranchés

1. ~~`PRIVACY.md` n’a pas de coordonnées d’éditeur.~~ **Réglé** : le fichier porte
   une section « Contact » avec l’adresse `guillaume.dallolmo@gmail.com`.
2. ~~Adresse de contact du compte développeur.~~ **Réglé** : le compte porte
   `guillaume.dallolmo@gmail.com`, la même adresse que `PRIVACY.md`, sous le nom
   d’éditeur **Guillaume Dall Olmo**. Reste à vérifier d’un coup d’œil que Google
   la marque bien *verified*.
3. ~~Version `0.1.0`.~~ **Tranché** : on publie en `0.1.0`. Le numéro est cohérent
   avec l’état du projet et annonce honnêtement une première version. Conséquence à
   retenir : `0.1.0` est désormais brûlé, la prochaine soumission devra porter un
   numéro strictement supérieur.
4. ~~`0.1.0` n’analysait aucune page.~~ **Corrigé en `0.1.1`** : le panneau
   s’ouvrait par `setPanelBehavior({ openPanelOnActionClick: true })`, chemin qui ne
   déclenche pas `action.onClicked` et n’accorde donc pas `activeTab` ; Chrome
   masquait jusqu’à l’URL de l’onglet et toute injection était refusée, sur tous les
   sites. Le clic sur l’icône est désormais écouté puis suivi de `sidePanel.open()`,
   et des permissions d’hôte **facultatives** permettent d’accorder un accès durable,
   par site ou pour tous. Un champ de justification supplémentaire est donc à remplir
   dans l’onglet Confidentialité (texte prêt dans `LISTING.md`), et
   `minimum_chrome_version` passe à `116`. La description de la fiche est également à
   recoller : elle porte le bloc **NOUVEAUTÉS — VERSION 0.1.1**, seul endroit où le
   Web Store permet d’annoncer un changement.

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
