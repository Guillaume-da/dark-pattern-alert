# Politique de confidentialité — Dark Pattern Alert

Dernière mise à jour : 2 août 2026

Dark Pattern Alert analyse la page active uniquement lorsque l’utilisateur lance explicitement une analyse. Le contenu de la page et les résultats restent dans le navigateur et ne sont transmis à aucun serveur.

L’analyse de réputation et de sécurité du site suit la même règle : l’identité du domaine, le chiffrement et les formulaires sont évalués dans le navigateur, à partir de règles embarquées dans l’extension. Aucune URL, aucun domaine et aucun résultat ne sont transmis à un service de réputation externe.

L’identification de l’éditeur d’un média repose sur une table embarquée dans l’extension : le nom de domaine est comparé localement à cette liste. Aucune requête n’est émise et aucune information sur les articles consultés n’est conservée.

L’extension enregistre localement cinq préférences : l’affichage des signaux à confiance modérée, l’activation du surlignage automatique, l’activation de l’analyse de sécurité, l’affichage de l’éditeur d’un média et la mémorisation des domaines analysés. Elle ne collecte ni identité, ni données d’utilisation, ni communications personnelles.

Lorsque l’option **Mémoriser les domaines analysés** est active, l’extension conserve dans le stockage local la liste des noms de domaine sur lesquels une analyse a été lancée, dans la limite des 500 derniers. Cette liste sert uniquement à indiquer qu’un domaine est analysé pour la première fois. Elle ne contient ni URL complète, ni horodatage, ni contenu de page, ne couvre pas la navigation ordinaire, et peut être effacée à tout moment depuis les réglages ou désactivée avant toute analyse.

La permission `activeTab` donne un accès temporaire à la page ouverte après une action de l’utilisateur. La permission `scripting` permet d’y exécuter les détecteurs. La permission `sidePanel` affiche le rapport. La permission `storage` conserve les préférences locales.

La suppression de l’extension efface ces préférences. Cette politique devra être complétée avec les coordonnées de l’éditeur avant une publication sur le Chrome Web Store.
