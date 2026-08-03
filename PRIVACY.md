# Politique de confidentialité — Dark Pattern Alert

Dernière mise à jour : 3 août 2026

Dark Pattern Alert analyse la page active uniquement lorsque l’utilisateur lance explicitement une analyse. Le contenu de la page et les résultats restent dans le navigateur et ne sont transmis à aucun serveur.

L’analyse de réputation et de sécurité du site suit la même règle : l’identité du domaine, le chiffrement et les formulaires sont évalués dans le navigateur, à partir de règles embarquées dans l’extension. Aucune URL, aucun domaine et aucun résultat ne sont transmis à un service de réputation externe.

L’identification de l’éditeur d’un média repose sur une table embarquée dans l’extension : le nom de domaine est comparé localement à cette liste. Aucune requête n’est émise et aucune information sur les articles consultés n’est conservée.

L’extension enregistre localement huit préférences : l’affichage des signaux à confiance modérée, l’activation du surlignage automatique, l’activation de l’analyse de sécurité, l’affichage de l’éditeur d’un média, la comparaison des compteurs entre deux visites, le suivi des parcours de résiliation, la prise en compte des retours de l’utilisateur et la mémorisation des domaines analysés. Elle ne collecte ni identité, ni données d’utilisation, ni communications personnelles.

Lorsque l’option **Mémoriser les domaines analysés** est active, l’extension conserve dans le stockage local la liste des noms de domaine sur lesquels une analyse a été lancée, dans la limite des 500 derniers. Cette liste sert uniquement à indiquer qu’un domaine est analysé pour la première fois. Elle ne contient ni URL complète, ni horodatage, ni contenu de page, ne couvre pas la navigation ordinaire, et peut être effacée à tout moment depuis les réglages ou désactivée avant toute analyse.

Lorsque l’option **Comparer les compteurs** est active, l’extension enregistre, pour les pages où un décompte a été détecté, l’adresse de la page sans ses paramètres, la valeur relevée du compteur et la date du relevé, dans la limite des 200 dernières pages. Ces relevés servent uniquement à établir, lors d’une analyse ultérieure, si le compteur s’est réarmé. Ils ne contiennent aucun contenu de page et ne sont créés que sur les pages analysées à la demande. Ils s’effacent avec le bouton **Effacer les données locales**, qui vide aussi la liste des domaines analysés.

Lorsque l’option **Tenir compte de mes retours** est active, l’extension enregistre les signaux que l’utilisateur a confirmés ou écartés, par nom de domaine et dans la limite des 300 derniers sites. Chaque retour est conservé sous forme d’empreinte — catégorie, intitulé et extrait déclencheur dont les chiffres sont neutralisés — et jamais sous forme de contenu de page. Ces retours ne servent qu’à l’utilisateur qui les a donnés : ils ne sont transmis à aucun serveur et n’alimentent aucune base partagée. Ils s’effacent avec le bouton **Effacer les données locales**.

Lorsque l’option **Suivre les parcours de résiliation** est active, l’extension enregistre, pour au plus 100 sites et 30 étapes par site, le chemin des pages de résiliation qui ont été analysées et les obstacles qui y ont été relevés. Ce suivi ne repose sur aucune observation de la navigation : une page n’y figure que si l’utilisateur a explicitement lancé une analyse dessus. Aucun contenu de page n’est conservé. Ces étapes s’effacent avec le bouton **Effacer les données locales**.

La permission `activeTab` donne un accès temporaire à la page ouverte après une action de l’utilisateur — le clic sur l’icône de l’extension — et cet accès retombe dès que la page change. La permission `scripting` permet d’y exécuter les détecteurs. La permission `sidePanel` affiche le rapport. La permission `storage` conserve les préférences locales.

L’extension déclare en outre des **permissions d’hôte facultatives** (`http://*/*`, `https://*/*`), qui ne sont **jamais accordées à l’installation**. L’utilisateur peut les accorder lui-même, pour un seul site ou pour tous, afin de ne plus avoir à cliquer sur l’icône avant chaque analyse. Cette autorisation ne change ni ce que l’extension lit, ni quand elle le lit : l’analyse ne démarre toujours qu’à la demande explicite de l’utilisateur, et aucune donnée n’est envoyée. Elle se révoque depuis `chrome://extensions`.

La suppression de l’extension efface ces préférences et l’ensemble des données locales décrites ci-dessus.

## Contact

Éditeur : Guillaume Dall Olmo.

Pour toute question sur cette politique, pour exercer un droit prévu par le RGPD ou pour signaler un problème : **guillaume.dallolmo@gmail.com**.

Le code source est public et publié sous licence MIT : <https://github.com/Guillaume-da/dark-pattern-alert>. Les affirmations de cette politique y sont vérifiables — aucune requête réseau n’est émise par l’extension, et les données citées sont celles écrites dans `chrome.storage.local`.

## Modifications

Toute évolution de cette politique sera publiée dans ce fichier, dont l’historique est consultable dans le dépôt. La date de dernière mise à jour figure en tête.
