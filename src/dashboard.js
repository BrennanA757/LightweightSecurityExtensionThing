document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("latestScore", (result) => {
    //Update score circle
    if (result.latestScore !== undefined) {
      updateCircularScore(result.latestScore);
      updateScoreText(result.latestScore);
    }
  });

  //Update detected cookies list
  listCookies();

  //Update whitelisted sites list
  try {
    chrome.storage.local.get("whitelisted_sites", (result) => {
      updateWhitelistedDomains(result.whitelisted_sites);
    });
  } catch (e) {
    console.log("Unable to find whitelisted domain dictionary: " + e);
  }

  //Update foundCookies Dictionary
  await updateFoundCookiesByDates();

  //Update graph in analytics section
  await updateGraph();
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
    console.log("Unable to update foundCookies dictionary: " + e);
  }
}

function updateCircularScore(score) {
  const circle = document.getElementById("score-circle");
  if (circle == null) {
    console.log("Cannot find score circle element.");
    return;
  }
  circle.classList.add("p" + score);

  const value_bar = document.getElementById("value-bar");
  const first50_bar = document.getElementById("first50-bar");
  if (first50_bar == null) console.log("Cannot find first50 bar.");
  if (value_bar == null) {
    console.log("Cannot find value bar.");
  } else {
    if (score > 50) {
      circle.classList.add("over50");
    }

    let color = "";
    if (score > 70) {
      color = "good";
    } else if (score > 40) {
      color = "medium";
    } else {
      color = "bad";
    }
    value_bar.classList.remove("good", "medium", "bad");
    first50_bar.classList.remove("good", "medium", "bad");
    value_bar.classList.add(color);
    first50_bar.classList.add(color);
  }
}

function updateScoreText(score) {
  const text = document.getElementById("scoreText");
  if (text == null) {
    console.log("Cannot find score text.");
    return;
  }
  text.innerHTML = ("Score: " + score + "%").toString();
}

function toggleLightDarkTheme() {
  if (
    localStorage.theme === "dark" ||
    (!localStorage.theme &&
      window.matchMedia("(prefers-color-scheme: dark").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
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

function updateWhitelistedDomains(whitelisted_sites) {
  whitelist_container = document.getElementById("whitelist_list");

  const p_elements = whitelist_container.querySelectorAll(
    ".whitelisted_domain",
  );
  p_elements.forEach((e) => {
    e.remove();
  });

  for (const i in whitelisted_sites) {
    let p_element = document.createElement("p");
    p_element.innerHTML = whitelisted_sites[i];
    p_element.classList.add("whitelisted_domain");
    whitelist_container.appendChild(p_element);
  }
}

async function updateGraph() {
  const { found_cookies } = await chrome.storage.local.get("found_cookies");
  const keys = Object.keys(found_cookies);

  let xValues = [];
  let yValues = [];

  for (let i = 0; i < 10 && i < keys.length; i++) {
    const date = new Date(keys[i]);
    console.log("Getting cookies for " + date);
    const date_string = date.getMonth() + 1 + "/" + date.getDate();

    xValues.push(date_string);
    yValues.push(found_cookies[keys[i]].length);
  }

  const chart = document.getElementById("insecure_cookies_chart");
  const insecure_cookies_chart = new Chart(chart, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgbs(0,0,255,1.0)",
          data: yValues,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Insecure Cookies over time",
          font: { size: 16 },
          color: "black",
        },
      },
      scales: {
        x: {
          ticks: {
            color: "black",
          },
          title: {
            display: true,
            text: "Date",
            color: "black",
          },
        },
        y: {
          ticks: {
            color: "black",
          },
          title: {
            display: true,
            text: "# of Cookies",
            color: "black",
          },
        },
      },
    },
  });
}

document.getElementById("home_menu_btn").addEventListener("click", () => {
  const views = document.querySelectorAll(".view");
  views.forEach((v) => v.classList.remove("active"));
  document.getElementById("home_view").classList.toggle("active");
});

document.getElementById("analytics_btn").addEventListener("click", () => {
  const views = document.querySelectorAll(".view");
  views.forEach((v) => v.classList.remove("active"));
  document.getElementById("analytics_view").classList.toggle("active");
});

const form = document.querySelector("#whitelist_form");
form.addEventListener("submit", async function (event) {
  event.preventDefault(); //Stop from submitting normally

  const formData = new FormData(event.target); //Pass form element
  const data = formData.get("domain_input"); //Get data from input element inside form

  //Create new regex pattern
  const regex_string = "/*." + data.replace(".", "\\.") + "/";
  const regex = new RegExp(regex_string);

  let result = await chrome.storage.local.get("whitelisted_sites");
  result.whitelisted_sites.push(data);

  let regex_result = await chrome.storage.local.get(
    "whitelisted_sites_regexes",
  );
  regex_result.whitelisted_sites_regexes.push(regex);

  chrome.storage.local.set({
    whitelisted_sites: result.whitelisted_sites,
    whitelisted_sites_regexes: regex_result.whitelisted_sites_regexes,
  });

  updateWhitelistedDomains(result.whitelisted_sites);
});
