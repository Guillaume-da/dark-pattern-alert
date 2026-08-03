# Fiche Chrome Web Store — texte prêt à coller

Chaque section correspond à **un champ exact** du tableau de bord développeur.
Le compte de caractères est indiqué avec la limite imposée par Google.
Recopiez le bloc entre les délimiteurs, sans les délimiteurs.

Tableau de bord : <https://chrome.google.com/webstore/devconsole> → l’extension → **Store listing**.

---

## 1. Onglet « Store listing »

### Nom de l’extension — champ « Name »

> Limite : 75 caractères. Actuel : **18**.
> Ce champ est repris du manifeste et doit rester identique.

```
Dark Pattern Alert
```

### Résumé — champ « Summary »

> Limite : **132 caractères**. Actuel : **90**.
> Google reprend automatiquement la clé `description` du manifeste. Ne la modifiez
> ici que si vous modifiez aussi `manifest.json`, sinon la validation échoue.

```
Repère les interfaces trompeuses et explique le risque, directement dans votre navigateur.
```

### Description détaillée — champ « Description »

> Limite : 16 000 caractères. Actuel : **4 144**.
> Le champ n’accepte pas le Markdown : les tirets et les sauts de ligne ci-dessous
> sont déjà du texte brut, collez tel quel.
>
> Le Chrome Web Store n’a pas de champ « nouveautés » : la description est le seul
> endroit où annoncer un changement. Le bloc **NOUVEAUTÉS** ne vaut donc que pour
> la version en cours — le remplacer à chaque publication, et le retirer quand il
> n’apprend plus rien à personne.

```
Dark Pattern Alert répond à deux questions sur la page que vous avez sous les yeux : cette interface essaie-t-elle de m’influencer, et puis-je faire confiance à ce site ?

Tout est calculé dans votre navigateur, à votre demande. L’extension n’a pas de serveur, pas de compte, pas de télémétrie. Elle n’observe pas votre navigation : elle n’analyse une page que si vous cliquez sur son icône.

NOUVEAUTÉS — VERSION 0.1.1

• Correction majeure : la version 0.1.0 n’analysait aucune page. Le clic sur l’icône n’ouvrait pas l’accès à l’onglet et l’analyse s’arrêtait sur « Cette page est protégée par Chrome », sur tous les sites. C’est réparé.
• Autorisation durable, facultative : pour ne plus avoir à cliquer sur l’icône avant chaque analyse, vous pouvez accorder l’accès à un site, ou à tous. Cette autorisation n’est jamais accordée à l’installation, se révoque à tout moment, et ne change ni ce que l’extension lit, ni le fait qu’elle n’envoie rien.
• Messages d’erreur exacts : une page fermée à toute extension, un accès non accordé et une page qui ne répond pas ne se disent plus de la même façon.

CE QU’ELLE REPÈRE DANS LA PAGE

• Choix précochés — cases cochées par défaut, en particulier sur une option commerciale : newsletter, assurance, abonnement, garantie.
• Urgence artificielle — comptes à rebours, « dernière chance », « offre limitée » dans un contexte marchand.
• Interfaces trompeuses — refus culpabilisants du type « Non merci, je préfère payer plus cher », bouton d’acceptation nettement plus visible que le refus.
• Coûts ajoutés au dernier moment — frais de service, de dossier ou de livraison qui gonflent le total après le prix annoncé, mentions « hors frais » ou « + frais ». Quand un total figure sur la page, le rapport indique la part que ces frais représentent.
• Abonnement et résiliation — renouvellement automatique, résiliation exigeant un appel ou un courrier, résiliation en ligne impossible.

RÉPUTATION ET SÉCURITÉ DU SITE

Un second score, indépendant du premier, porte sur le site lui-même : connexion non chiffrée, adresse IP nue, domaine en punycode, imitation de marque (orthographe presque identique à une marque connue, ou nom de marque placé dans un domaine tiers), mot de passe ou carte bancaire demandés hors HTTPS, formulaire postant vers un autre domaine, contenu mixte, cadres tiers masqués, absence de mentions légales sur une page marchande.

Aucun service de réputation externe n’est interrogé. Les règles sont embarquées dans l’extension.

QUI POSSÈDE LE MÉDIA QUE VOUS LISEZ

Sur une soixantaine de titres français et internationaux, le panneau indique le propriétaire, le groupe et le mode de financement : capitaux privés, service public, coopérative, association, fonds de dotation. Ce sont des faits d’actionnariat, pas une opinion : l’extension ne classe aucun média sur un axe politique et n’apprécie pas sa ligne éditoriale.

CE QU’UNE SEULE PAGE NE PEUT PAS MONTRER

• Les compteurs sont comparés d’une visite à l’autre. Un décompte qui se réarme, ou qui ne suit pas le temps réel, devient un constat daté plutôt qu’un soupçon. Un compteur honnête est reconnu comme tel, et sa sévérité baisse.
• Les étapes d’une résiliation sont récapitulées : une résiliation étalée sur cinq pages est un obstacle en soi, invisible page par page.

VOUS GARDEZ LA MAIN

Chaque signal peut être jugé. Un signal que vous écartez disparaît de vos prochains rapports sur ce site et cesse de peser sur le score. Le jugement est réversible et reste chez vous.

Toutes les fonctions qui mémorisent quelque chose sont désactivables, et un bouton efface l’ensemble des données locales.

CE QUE CETTE EXTENSION N’EST PAS

Les résultats sont des indices explicables, pas des preuves. Un score de 100 en réputation signifie « rien d’anormal détectable localement », pas « site vérifié » : sans base de signalements ni WHOIS, l’extension ignore l’âge d’un domaine et les campagnes d’hameçonnage en cours. Les contenus rendus dans des cadres fermés lui échappent. Vérifiez toujours le contexte avant de décider.

Code source et politique de confidentialité : https://github.com/Guillaume-da/dark-pattern-alert
```

### Catégorie — champ « Category »

```
Privacy & Security
```

> Second choix acceptable : `Workflow & Planning`. `Privacy & Security` correspond mieux
> à l’objectif déclaré et aux permissions demandées.

### Langue — champ « Language »

```
Français
```

> L’interface est intégralement en français. Ne déclarez pas l’anglais : une fiche
> dont la langue ne correspond pas au contenu est un motif de rejet.

---

## 2. Onglet « Store listing » — visuels

Tous les fichiers sont dans `store/assets/`, générés par `npm run store:assets`.

| Champ du tableau de bord | Dimensions exigées | Fichier à téléverser | Obligatoire |
| --- | --- | --- | --- |
| Store icon | 128 × 128 | `../icons/icon-128.png` | oui |
| Screenshots (1 à 5) | 1280 × 800 | `01-rapport.png`, `02-reputation.png`, `03-medias.png`, `04-resiliation.png`, `05-confidentialite.png` | au moins 1 |
| Small promo tile | 440 × 280 | `promo-tile-440x280.png` | non, mais requise pour toute mise en avant |
| Marquee promo tile | 1440 × 560 | `marquee-1440x560.png` | non |

Téléversez les cinq captures **dans cet ordre** : la première est celle que Google
affiche en vignette de résultat de recherche.

---

## 3. Onglet « Privacy »

### Objectif unique — champ « Single purpose »

> Google refuse les extensions à objectifs multiples. Ce texte relie explicitement
> chaque fonction au même but.

```
Analyser, à la demande de l’utilisateur, la page qu’il consulte afin d’y signaler les procédés d’interface trompeurs et les signaux de sécurité qui pourraient l’induire en erreur, et lui expliquer chacun de ces signaux. Toutes les fonctions de l’extension servent cet unique objectif : détection des procédés trompeurs dans la page, vérification de l’identité du domaine et de la sécurité de la page, identification de l’éditeur d’un média, et restitution de ces éléments dans un panneau explicatif.
```

### Justification de `activeTab`

```
L’extension lit le contenu de l’onglet actif uniquement après que l’utilisateur a cliqué sur son icône, pour y chercher les procédés trompeurs et les signaux de sécurité qu’elle rapporte. Cette permission a été choisie précisément parce qu’elle n’accorde l’accès qu’après une action explicite de l’utilisateur, et sur le seul onglet concerné.
```

### Justification des permissions d’hôte facultatives (`http://*/*`, `https://*/*`)

```
Ces permissions ne sont pas demandées à l’installation : elles sont déclarées en optional_host_permissions et ne sont accordées que si l’utilisateur clique lui-même sur « Toujours autoriser » ou « Autoriser sur tous les sites ». L’accès obtenu par activeTab retombe à chaque navigation, ce qui oblige sinon à cliquer sur l’icône avant chaque page analysée. L’autorisation ne change ni la nature ni le moment de la lecture : l’analyse ne démarre qu’à la demande explicite de l’utilisateur, rien n’est observé en arrière-plan et aucune donnée n’est transmise.
```

### Justification de `scripting`

```
L’analyse s’exécute dans la page elle-même : l’extension y injecte ses détecteurs après le clic de l’utilisateur, car les procédés recherchés dépendent du rendu final (taille et contraste des boutons, éléments masqués, contenu chargé dynamiquement) et ne sont pas observables autrement. Elle injecte également une feuille de style qui encadre les éléments signalés dans la page.
```

### Justification de `sidePanel`

```
Le rapport d’analyse est affiché dans le panneau latéral, qui permet de lire les explications tout en gardant la page visible et en localisant chaque élément signalé. C’est la surface d’affichage principale de l’extension.
```

### Justification de `storage`

```
L’extension enregistre localement les préférences de l’utilisateur, ainsi que les relevés strictement nécessaires à deux fonctions : la valeur d’un compte à rebours, pour déterminer lors d’une visite ultérieure s’il s’est réarmé, et les signaux que l’utilisateur a jugés faux, pour ne plus les lui présenter sur ce site. Ces données ne quittent jamais le navigateur et un bouton des réglages les efface toutes.
```

### Justification de l’absence de code distant — champ « Remote code »

> Cochez **« No, I am not using remote code »**.

```
L’extension n’exécute aucun code distant. Tous ses scripts sont inclus dans le paquet et aucune requête réseau n’est émise.
```

### Utilisation des données — champ « Data usage »

Cochez les cases suivantes, exactement :

| Catégorie de données | À cocher ? | Pourquoi |
| --- | --- | --- |
| Personally identifiable information | **non** | aucune identité n’est lue ni conservée |
| Health information | **non** | — |
| Financial and payment information | **non** | la présence d’un champ de carte est détectée, sa valeur n’est jamais lue |
| Authentication information | **non** | la présence d’un champ de mot de passe est détectée, sa valeur n’est jamais lue |
| Personal communications | **non** | — |
| Location | **non** | — |
| Web history | **non** | voir la note ci-dessous |
| User activity | **non** | aucun clic ni frappe n’est enregistré |
| Website content | **non** | le contenu est analysé en mémoire et n’est ni conservé ni transmis |

> **Note sur « Web history ».** L’extension conserve localement le nom des domaines
> sur lesquels une analyse a été **explicitement lancée**, et le chemin des pages de
> résiliation analysées. Ces déclarations portent sur la **collecte**, c’est-à-dire la
> transmission hors de l’appareil : rien n’est transmis, donc rien n’est collecté au
> sens du formulaire. Ces mémorisations sont désactivables et effaçables, et elles
> sont décrites dans la politique de confidentialité.
> Si un examinateur vous interroge, la réponse tient en une phrase : *aucune donnée
> ne quitte l’appareil ; les relevés locaux sont facultatifs et effaçables depuis les réglages.*

Puis cochez les trois attestations finales :

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

### URL de la politique de confidentialité — champ « Privacy policy URL »

```
https://github.com/Guillaume-da/dark-pattern-alert/blob/main/PRIVACY.md
```

> Ce champ est **obligatoire** dès qu’une extension manipule des données
> utilisateur, ce qui est le cas ici même sans transmission. L’URL doit être
> publique et accessible sans connexion.

---

## 4. Onglet « Distribution »

| Champ | Valeur |
| --- | --- |
| Visibility | `Public` — ou `Unlisted` pour un premier essai sans référencement |
| Distribution | `All regions`, sauf raison de restreindre |
| Pricing | `Free` |

---

## 5. Ce qui reste à compléter avant de publier

Ces trois points ne peuvent pas être décidés à votre place.

1. ~~Coordonnées de l’éditeur dans `PRIVACY.md`.~~ **Fait** : section « Contact »,
   adresse `guillaume.dallolmo@gmail.com`.
2. ~~Adresse e-mail de contact vérifiée.~~ **Fait** : le compte développeur porte
   `guillaume.dallolmo@gmail.com`, sous le nom d’éditeur « Guillaume Dall Olmo ».
   Même adresse que dans `PRIVACY.md`, donc rien à opposer à l’examen.
3. ~~Numéro de version.~~ **Tranché** : première publication en `0.1.0`, assumée
   comme telle. Toute mise à jour devra porter un numéro strictement supérieur —
   un numéro publié ne pouvant jamais être réutilisé. La `0.1.1` corrige l’accès
   aux pages, que la `0.1.0` n’obtenait jamais : c’est elle que la fiche affiche.
