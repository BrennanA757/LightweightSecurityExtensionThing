const WHITELIST_KEY="whitelisted_sites"
const WHITELIST_REGEX_KEY="whitelisted_sites_regexes";
const FOUND_COOKIES_KEY="found_cookies";
const BAD_COOKIES_KEY="bad_cookies";

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

chrome.webNavigation.onCompleted.addListener((details) => {
  runAnalysis();
});

async function runAnalysis() {
  const response = await chrome.storage.local.get([WHITELIST_KEY, WHITELIST_REGEX_KEY, FOUND_COOKIES_KEY]);

  //Null check
  if(response.whitelisted_sites == undefined || response.whitelisted_sites_regexes == undefined){
      await chrome.storage.local.set({
      whitelisted_sites: whitelisted_sites,
      whitelisted_sites_regexes: whitelisted_sites_regexes,
    });
  }
  if(response.found_cookies == undefined){
    await chrome.storage.local.set({
      found_cookies: {}
    })
  }

  const cookies = await getCookies();
  
  //Null check for cookies
  if (!cookies || !Array.isArray(cookies)) {
    document.getElementById("score").textContent = "N/A";
    return;
  }
  
  const bad_cookies = cookies.filter(c=> 
    (!c.secure || 
    !c.sameSite || 
    !c.httpOnly) && 
    !getIsCookieWhitelisted(c, response.whitelisted_sites_regexes));

  let bad_cookies_num = bad_cookies.length;
  
  let score = Math.round(((cookies.length - bad_cookies_num) / cookies.length) * 100);
  
  await chrome.storage.local.set({
    latestScore: score,
    cookies: cookies,
    bad_cookies: bad_cookies,
  });

  await updateFoundCookiesByDates(response.found_cookies, bad_cookies);

  await removeInsecureCookies(cookies);
}

async function updateFoundCookiesByDates(found_cookies, bad_cookies) {
  //Creates new cookie list for today
  today = new Date().toDateString();
  if (!found_cookies.hasOwnProperty(today)) {
    found_cookies[today] = [];
  }

  if(bad_cookies == undefined){
    return;
  }

  //Updates cookie list when new, distinct insecure cookie is found
  bad_cookies.forEach((cookie) => {
    if (!found_cookies[today].includes(cookie.name)) {
      found_cookies[today].push(cookie.name);
    }
  });

  await chrome.storage.local.set({
    found_cookies: found_cookies,
  });
}

function getIsCookieWhitelisted(cookie, whitelist){
  whitelist.some(w=>{

    let cookie_url =
        cookie.url === undefined
          ? `https://${cookie.domain}${cookie.path}`
          : cookie.url;

    const regex = new RegExp(w);

    if(regex.test(cookie_url)){
      return true;
    }
  });

  return false;
}

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

      

      //commented out temporarily
      // await chrome.cookies.remove({ name: cookie.name, url: cookieUrl });
      //console.log("Removed: " + cookie.name + " from " + cookie.domain);
    }
  }
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
