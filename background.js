// Le panneau ne doit PAS s'ouvrir tout seul au clic sur l'icône : ce chemin ne
// déclenche pas `action.onClicked`, donc Chrome n'accorde pas `activeTab`.
// L'extension se retrouve alors sans accès — `chrome.tabs` ne rend même pas
// l'URL de l'onglet et l'injection est refusée. On écoute donc le clic, ce qui
// vaut geste utilisateur et ouvre l'accès à l'onglet visé.
const configureSidePanel = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.warn("Dark Pattern Alert:", error));
};

chrome.runtime.onInstalled.addListener(configureSidePanel);
chrome.runtime.onStartup.addListener(configureSidePanel);
configureSidePanel();

chrome.action.onClicked.addListener((tab) => {
  // Ouvrir sans `await` préalable : toute attente consommerait le geste
  // utilisateur, et `sidePanel.open` serait rejeté.
  chrome.sidePanel
    .open(tab.windowId ? { windowId: tab.windowId } : { tabId: tab.id })
    .catch((error) => console.warn("Dark Pattern Alert:", error));

  // Le panneau, s'il est déjà ouvert, réessaie l'analyse maintenant qu'il a accès.
  chrome.runtime.sendMessage({ type: "DPA_ACCESS_GRANTED", tabId: tab.id }).catch(() => {
    // Aucun panneau à l'écoute : il lira l'onglet à sa prochaine ouverture.
  });
});
