document.addEventListener("DOMContentLoaded", async () => {
  //Update detected cookies list
  listCookies();

  //Update foundCookies Dictionary
  await updateFoundCookiesByDates();
});

async function updateFoundCookiesByDates() {
  try {
    await chrome.storage.local.get(
      ["found_cookies", "insecure_cookies"],
      async (result) => {
        //If found_cookies has not been set, create it
        // if (result.found_cookies == undefined) {
        //   chrome.storage.local.set({
        //     found_cookies: {},
        //   });
        //   result.found_cookies = {};
        // }

        chrome.storage.local.set({
          found_cookies: {},
        });
        result.found_cookies = {};

        today = new Date();
        if (!result.found_cookies.hasOwnProperty(today)) {
          result.found_cookies[today] = [];
        }

        if(result.insecure_cookies == undefined){
          return;
        }

        result.insecure_cookies.forEach((cookie) => {
          if (!result.found_cookies[today].includes(cookie.name)) {
            result.found_cookies[today].push(cookie.name);
          }
        });

        chrome.storage.local.set({
          found_cookies: result.found_cookies,
        });
      },
    );
  } catch (e) {
    console.log("Unable to update foundCookies dictionary: " + e.toString());
  }
}

function listCookies() {
  chrome.storage.local.get(
    ["cross_site_cookies", "insecure_cookies"],
    (result) => {
      if (result.cross_site_cookies !== undefined) {
        updateCookieList(result.cross_site_cookies);
      }
      if (result.insecure_cookies !== undefined) {
        updateCookieList(result.insecure_cookies);
      }
    },
  );
}

function updateCookieList(cookie_list) {
  cookie_container = document.getElementById("cookie_container");

  for (c in cookie_list) {
    //Create identifying string
    const cookie_string =
      cookie_list[c].name + " from " + cookie_list[c].domain + "\n";

    //Create and append new p element to the cookie container.
    let p_element = document.createElement("p");
    p_element.innerHTML = cookie_string;
    cookie_container.appendChild(p_element);
  }
}