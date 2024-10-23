let detectionData = {};
let thirdPartyConnections = {};

// Monitor third-party connections
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.tabId >= 0 && details.type !== 'main_frame') {
      const tabId = details.tabId;
      const requestUrl = new URL(details.url);
      const requestDomain = requestUrl.hostname;

      browser.tabs.get(tabId).then((tab) => {
        if (tab && tab.url) {
          const tabUrl = new URL(tab.url);
          const tabDomain = tabUrl.hostname;

          // Check if the request domain is different from the tab domain
          if (!requestDomain.endsWith(tabDomain) && !tabDomain.endsWith(requestDomain)) {
            if (!thirdPartyConnections[tabId]) {
              thirdPartyConnections[tabId] = new Set();
            }
            thirdPartyConnections[tabId].add(requestDomain);
          }
        }
      }).catch((error) => {
        // Handle error silently
      });
    }
  },
  { urls: ["<all_urls>"] },
  []
);

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab ? sender.tab.id : null;
  if (!tabId) return;

  if (!detectionData[tabId]) {
    detectionData[tabId] = {
      canvasFingerprintingEvents: [],
      hijackAttempts: [],
      localStorageItems: 0
    };
  }

  switch (message.action) {
    case 'canvasFingerprintEvent':
      detectionData[tabId].canvasFingerprintingEvents.push({
        method: message.method,
        url: sender.url
      });
      break;
    case 'hijackAttempt':
      detectionData[tabId].hijackAttempts.push({
        method: message.method,
        url: sender.url
      });
      break;
    case 'localStorageData':
      detectionData[tabId].localStorageItems = message.count;
      break;
    default:
      break;
  }
});

// Provide data to popup when requested
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDetectionData') {
    const tabId = message.tabId;
    const data = detectionData[tabId] || {
      canvasFingerprintingEvents: [],
      hijackAttempts: [],
      localStorageItems: 0
    };
    data.thirdPartyDomains = thirdPartyConnections[tabId] ? Array.from(thirdPartyConnections[tabId]) : [];
    sendResponse(data);
  }
});

// Clean up data when tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  delete detectionData[tabId];
  delete thirdPartyConnections[tabId];
});
