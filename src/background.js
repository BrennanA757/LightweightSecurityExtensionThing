const trackerList = [
  "*://*.doubleclick.net/*",
  "*://*.facebook.com/*",
  "*://*.google-analytics.com/*",
  "*://*.googletagmanager.com/*",
  "*://*.adservice.google.com/*",
];

function isSecure(cookie) {
  if (!cookie.isSecure || !cookie.httpOnly || !cookie.sameSite) {
    return false;
  }
  return true;
}

async function getCookies() {
  const cookies = await chrome.cookies.getAll({});
  return cookies;
}

async function removeInSecureCookies(cookies) {
  //Remove insecure cookies
  for (const cookie of cookies) {
    if (!isSecure(cookie)) {
      let cookieUrl =
        cookie.url === undefined
          ? `https://${cookie.domain}${cookie.path}`
          : cookie.url;
      await chrome.cookies.remove({ name: cookie.name, url: cookieUrl });
      console.log("Removed: " + cookie.name);
    }
  }
}

async function manageCookies(sendResponse) {
  const cookies = await getCookies();
  const analysis = cookies.map((c) => ({
    name: c.name,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    domain: c.domain,
    url: c.url,
  }));

  sendResponse(analysis);

  await removeInSecureCookies(cookies);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "analyzeCookies") {
    //Analyze all cookies and filter insecure ones
    manageCookies(sendResponse);
    return true; //keep channel open for async response
  }
});
