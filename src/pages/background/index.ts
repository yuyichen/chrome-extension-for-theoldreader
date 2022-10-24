let tab;

chrome.action.onClicked.addListener(async () => {
  if (tab) {
    tab = await chrome.tabs.update(tab.id, { active: true });
  } else {
    tab = await chrome.tabs.create({ url: "src/pages/home/index.html" });
  }
});

chrome.tabs.onRemoved.addListener((tabId, info) => {
  if (tabId === tab.id) {
    tab = undefined;
  }
});

chrome.action.setBadgeBackgroundColor({ color: "#0000f5" });

const getUnreadCount = async () => {
  const response = await fetch(
    `https://theoldreader.com/reader/api/0/unread-count?output=json`,
    {
      credentials: "include",
    }
  );
  const data = await response.json();
  chrome.action.setBadgeText({
    text: data?.max ? `${data?.max > 99 ? "99+" : data.max}` : "",
  });
};

getUnreadCount();
setInterval(getUnreadCount, 15000);
