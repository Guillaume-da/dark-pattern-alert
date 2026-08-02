const configureSidePanel = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.warn("Dark Pattern Alert:", error));
};

chrome.runtime.onInstalled.addListener(configureSidePanel);
chrome.runtime.onStartup.addListener(configureSidePanel);
configureSidePanel();
