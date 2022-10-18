chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "src/pages/home/index.html" });
});