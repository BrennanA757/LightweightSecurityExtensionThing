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

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("latestScore", (result) => {
    if (result.latestScore !== undefined) {
      updateCircularScore(result.latestScore);
      updateScoreText(result.latestScore);
    }
  });
  listCookies();
});

document.getElementById("home_menu_btn").addEventListener("click", () => {
  console.log("Home btn clicked.");
});

document.getElementById("analytics_btn").addEventListener("click", () => {
  console.log("Analytics btn clicked.");
});
