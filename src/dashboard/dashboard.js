const toggle_elements = document.querySelectorAll(".theme_toggle");

document.addEventListener("DOMContentLoaded", async () => {
  updateScore();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  if(request.action==="finishedAnalysis"){
    updateScore();
  }
});

function updateScore(){
  chrome.storage.local.get("latestScore", (result) => {
    //Update score circle
    if (result.latestScore !== undefined) {
      updateScoreCircleUI(result.latestScore);
      updateScoreTextUI(result.latestScore);
    }
  });
}

function updateScoreCircleUI(score) {
  const circle = document.getElementById("score-circle");
  if (circle == null) {
    console.log("Cannot find score circle element.");
    return;
  }

  //Remove old classes from previous analysis and make new ones
  const matching_class = "over50";
  circle.classList.remove(matching_class);
  const old_p_class=[...circle.classList].filter(cls=>(cls.startsWith("p") && !(cls === "progress-circle")));
  if(old_p_class.length === 0){
    circle.classList.add(("p" + score));
  }
  else{
    circle.classList.replace(old_p_class[0], ("p" + score));
  }

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

function updateScoreTextUI(score) {
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

document.getElementById("toggle_theme_btn").addEventListener("click", ()=>{
  toggle_elements.forEach(e=>{
    e.classList.toggle("dark-mode");
  });

  const is_dark = toggle_elements[0].classList.contains('dark-mode');
  localStorage.setItem('theme', is_dark ? 'dark' : 'light');
});