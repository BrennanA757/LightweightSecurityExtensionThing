const trackerList = [
  "*://*.doubleclick.net/*",
  "*://*.facebook.com/*",
  "*://*.google-analytics.com/*",
  "*://*.googletagmanager.com/*",
  "*://*.adservice.google.com/*",
];

let whitelisted_sites = [
  "google.com",
  "fhsu.edu",
  "youtube.com",
  "joinhandshake.com",
];

let whitelisted_sites_regexes = [
  /.*google\.com/,
  /.*fhsu\.edu/,
  /.*youtube\.com/,
  /.*joinhandshake\.com/,
];

chrome.storage.local.set({
  whitelisted_sites: whitelisted_sites,
  whitelisted_sites_regexes: whitelisted_sites_regexes,
});

chrome.webNavigation.onCompleted.addListener((details) => {
  runAnalysis();
});

async function removeInsecureCookies(cookies) {
  //Remove insecure cookies
  for (const cookie of cookies) {
    if (!isSecure(cookie)) {
      let has_domain = false;
      for (let d in whitelisted_sites_regexes) {
        if (whitelisted_sites_regexes[d].test(cookie.domain)) {
          has_domain = true;
          break;
        }
      }

      if (has_domain) {
        continue;
      }

      let cookieUrl =
        cookie.url === undefined
          ? `https://${cookie.domain}${cookie.path}`
          : cookie.url;

      //commented out temporarily
      // await chrome.cookies.remove({ name: cookie.name, url: cookieUrl });
      //console.log("Removed: " + cookie.name + " from " + cookie.domain);
    }
  }
}

async function runAnalysis() {
  const [tab] = await chrome.tabs.query({});

  console.log(tab);
  let domain = null;
  try {
    domain = new URL(tab.url).hostname;
  } catch (e) {
    console.log(tabID);
  }

  const cookies = await getCookies();
  await removeInsecureCookies(cookies);

  if (!cookies || !Array.isArray(cookies)) {
    document.getElementById("score").textContent = "N/A";
    return;
  }

  const cross_site_cookies = cookies.filter((c) => !c.sameSite);
  const insecure_cookies = cookies.filter((c) => !c.secure || !c.httpOnly);

  let insecure = cross_site_cookies.length + insecure_cookies.length;
  let score = Math.max(0, 100 - insecure * 10);

  chrome.storage.local.set({
    latestScore: score,
    cross_site_cookies: cross_site_cookies,
    insecure_cookies: insecure_cookies,
  });
}

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

// async function manageCookies(sendResponse) {
//   const cookies = await getCookies();
//   const analysis = cookies.map((c) => ({
//     name: c.name,
//     secure: c.secure,
//     httpOnly: c.httpOnly,
//     sameSite: c.sameSite,
//     domain: c.domain,
//     url: c.url,
//   }));

//   sendResponse(analysis);

//   await removeInSecureCookies(cookies);
// }

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg.action === "analyzeCookies") {
//     //Analyze all cookies and filter insecure ones
//     manageCookies(sendResponse);
//     return true; //keep channel open for async response
//   }
// });
