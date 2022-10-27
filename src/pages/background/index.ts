chrome.action.onClicked.addListener(async () => {
  const tab = await chrome.tabs.query({
    title: "chrome-extension-for-theoldreader",
  });
  if (Array.isArray(tab) && tab.length > 0) {
    await chrome.tabs.update(tab[0].id, { active: true });
  } else {
    await chrome.tabs.create({ url: "src/pages/home/index.html" });
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

chrome.alarms.create("getUnreadCount", {
  periodInMinutes: 1,
  delayInMinutes: 0,
});
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case "getUnreadCount":
      getUnreadCount();
      break;
  }
});
