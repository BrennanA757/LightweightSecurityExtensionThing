window.addEventListener("load", async () => {
  const { latestScore } = await chrome.storage.local.get("latestScore");
  const scoreEl = document.getElementById("score");
  if (latestScore !== undefined) {
    scoreEl.textContent = latestScore;
    scoreEl.className =
      latestScore > 80 ? "good" : latestScore > 50 ? "medium" : "bad";
  } else {
    scoreEl.textContent = "100%";
  }
});

document.getElementById("openTab").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("./src/dashboard.html") });
});
