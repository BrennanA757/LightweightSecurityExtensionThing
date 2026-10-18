function updateCircularScore(score) {
  const circle = document.getElementById("score-circle");
  if (circle == null) {
    console.log("Cannot find score circle element.");
    return;
  }
  circle.classList.add("p" + score);
  console.log("Updating circle fill amount to " + score);
}

function updateScoreText(score) {
  const text = document.getElementById("scoreText");
  if (text == null) {
    console.log("Cannot find score text.");
    return;
  }
  text.innerHTML = (score + "%").toString();
  console.log("Updating score text to " + score);
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

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("latestScore", (result) => {
    if (result.latestScore !== undefined) {
      updateCircularScore(result.latestScore);
      updateScoreText(result.latestScore);
      console.log("Updating Score to " + result.latestScore);
    }
    console.log("Result: ", JSON.stringify(result));
  });

  // if (latestScore) {
  //   updateCircularScore(latestScore);
  //   updateScoreText(latestScore);
  //   console.log("Updating score");
  // }

  // const btn = document.getElementById("toggleThemeBtn");
  // btn.addEventListener("click", () => {
  //   const isDark = document.documentElement.classList.toggle("dark");
  //   localStorage.theme = isDark ? "dark" : "light";
  // });

  // toggleLightDarkTheme();

  console.log("DOM fully loaded");
});
