function updateCircularScore(score) {
  const circle = document.querySelector(".ring-fill");
  const text = document.getElementById("scoreText");

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = circumference;

  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  text.innerHTML = score + "%";

  if (score > 80) {
    circle.style.stroke = "#4caf50";
  } else if (score > 50) {
    circle.style.stroke = "#adaf4c";
  } else {
    circle.style.stroke = "#e82424";
  }
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
  const { latestScore } = await chrome.storage.local.get("latestScore");

  if (latestScore) {
    updateCircularScore(latestScore);
  }

  const btn = document.getElementById("toggleThemeBtn");
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDark ? "dark" : "light";
  });

  toggleLightDarkTheme();
});
