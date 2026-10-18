const trackerList = [
  "*://*.doubleclick.net/*",
  "*://*.facebook.com/*",
  "*://*.google-analytics.com/*",
  "*://*.googletagmanager.com/*",
  "*://*.adservice.google.com/*",
];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "analyzeCookies") {
    chrome.cookies.getAll({ domain: msg.domain }, (cookies) => {
      const analysis = cookies.map((c) => ({
        name: c.name,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
      }));
      sendResponse(analysis);
    });

    return true; //keep channel open for async response
  }
});
