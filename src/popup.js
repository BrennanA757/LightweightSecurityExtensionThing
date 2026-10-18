document.getElementById("analyze").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let domain = null;
  try {
    domain = new URL(tab.url).hostname;
  } catch (e) {
    console.log("Invalid tab URL: ", tab.url);
  }
  chrome.runtime.sendMessage(
    { action: "analyzeCookies", url: tab.url, domain },
    (cookies) => {
      if (!cookies || !Array.isArray(cookies)) {
        document.getElementById("score").textContent = "N/A";
        console.log("No cookies found.");
        return;
      }

      let insecure = cookies.filter((c) => !c.secure || !c.httpOnly).length;
      let score = Math.max(0, 100 - insecure * 10);

      const scoreEl = document.getElementById("score");
      scoreEl.textContent = score;
      scoreEl.className = score > 80 ? "good" : score > 50 ? "medium" : "bad";

      const list = document.getElementById("cookieList");
      list.innerHTML = cookies
        .map((c) => `<li>${c.name} (${c.secure ? "Secure" : "Insecure"})</li>`)
        .join("");

      chrome.storage.local.set({ latestScore: score });
    },
  );
});

document.getElementById("openTab").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/dashboard.html") });
});
