const WHITELIST_KEY="whitelisted_sites"
const WHITELIST_REGEX_KEY="whitelisted_sites_regexes";
const FOUND_COOKIES_KEY="found_cookies";
const BAD_COOKIES_KEY="bad_cookies";

const dashboard_url = "chrome-extension://bakchdppgdekllffihgfcofipjopceaa/src/dashboard/dashboard.html";

let whitelisted_sites = [
  "google.com",
  "fhsu.edu",
  "youtube.com",
  "joinhandshake.com",
];

let whitelisted_sites_regexes = [
  "/.*google\\.com/",
  "/.*fhsu\\.edu/",
  "/.*youtube\\.com/",
  "/.*joinhandshake\\.com/",
];

//Initialize whitelist dictionaries on first install
chrome.runtime.onInstalled.addListener((details)=>{
  if(details.reason === "install"){
    chrome.storage.local.set({
      whitelisted_sites: whitelisted_sites,
      whitelisted_sites_regexes: whitelisted_sites_regexes,
      found_cookies: {}
    });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  runAnalysis();
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=>{
  if(request.action === "runAnalysis"){
    await runAnalysis();
  }
  return true;
});

async function runAnalysis() {
  const { whitelisted_sites_regexes, found_cookies } = await chrome.storage.local.get([WHITELIST_REGEX_KEY, FOUND_COOKIES_KEY]);

  const cookies = await getCookies();
  
  //Null check for cookies
  if (!cookies || !Array.isArray(cookies)) {
    document.getElementById("score").textContent = "N/A";
    return;
  }

  const bad_cookies = await removeInsecureCookies(cookies, whitelisted_sites_regexes);
  await updateFoundCookiesByDates(found_cookies, bad_cookies);

  const bad_cookies_num = bad_cookies.length;
  const cookies_num = cookies.length;

  const score = Math.round(((cookies_num - bad_cookies_num) / cookies_num) * 100);
  
  await chrome.storage.local.set({
    latestScore: score,
    cookies: cookies,
    bad_cookies: bad_cookies,
  });

  //Notify of finished analysis
  chrome.tabs.query({ active: true, currentWindow: true}, (tabs)=>{
    const activeTab = tabs[0];

    if (activeTab && activeTab.url?.includes(dashboard_url)){
      chrome.runtime.sendMessage({
        action: "finishedAnalysis"
      });
    }
  });
}

async function removeInsecureCookies(cookies, whitelisted_sites_regexes) {

  let bad_cookies=[];

  //Remove insecure cookies
  for (const cookie of cookies) {
    const cookie_url =
      cookie.url === undefined
        ? `https://${cookie.domain}${cookie.path}`
        : cookie.url;

        
    //Remove potentially dangerous cookies
    if (!isSecure(cookie, cookie_url, whitelisted_sites_regexes) && !isUsernameOrPassword(cookie)) {
      await chrome.cookies.remove({ name: cookie.name, url: cookie_url });
      console.log("Removed: " + cookie.name + " from " + cookie.domain);

      bad_cookies.push(cookie);
    }
  }

  return bad_cookies;
}

function isSecure(cookie, cookie_url, whitelisted_sites_regexes) {
  if ((!cookie.isSecure || !cookie.httpOnly || !cookie.sameSite) && !getIsCookieWhitelisted(cookie_url, whitelisted_sites_regexes)) {
    return false;
  }
  return true;
}

function isUsernameOrPassword(cookie){
  const potential_names=/user|name|login|email|pass|pwd|auth|token|sess/i;

  if(potential_names.test(cookie.name)){
    return true;
  }

  return false;
}

async function updateFoundCookiesByDates(found_cookies, bad_cookies) {
  //Creates new cookie list for today
  today = new Date().toDateString();
  if (!found_cookies.hasOwnProperty(today)) {
    found_cookies[today] = [];
  }

  if(bad_cookies == undefined){
    console.log("No bad cookies found. Aborting updating found_cookies.");
    return;
  }

  //Updates cookie list when a new, distinct insecure cookie is found
  bad_cookies.forEach((cookie) => {
    if (!found_cookies[today].includes(cookie.name)) {
      found_cookies[today].push(cookie.name);
    }
  });

  await chrome.storage.local.set({
    found_cookies: found_cookies,
  });
}

function getIsCookieWhitelisted(cookie_url, whitelisted_sites_regexes){

  const regex_list = Object.values(whitelisted_sites_regexes || {});

  for(const w of regex_list){
    const regex = new RegExp(w);

    if(regex.test(cookie_url)){
      return true;
    }
  }

  return false;
}

async function getCookies() {
  const cookies = await chrome.cookies.getAll({});
  return cookies;
}
