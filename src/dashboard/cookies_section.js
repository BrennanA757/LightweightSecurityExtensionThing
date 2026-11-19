document.addEventListener("DOMContentLoaded", async () => {
  //Update detected cookies list
  await listCookies();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
  if(request.action === "finishedAnalysis"){
    console.log("Updating cookies list based on new analysis");
    listCookies();
  }
});

async function listCookies() {
  const response = await chrome.storage.local.get(["cookies", "bad_cookies"]);

  //Null check
  if(response.cookies == undefined || response.bad_cookies == undefined){
    console.log("A list is undefined. Aborting");
    console.log(response.cookies_list);
    console.log(response.bad_cookies);
    return;
  }
  updateCookieList(response.cookies, response.bad_cookies);
}

function updateCookieList(cookie_list, bad_cookies_list) {
  cookie_container = document.getElementById("cookie_container");

  //Clear cookies list
  const p_elements = cookie_container.querySelectorAll(
    ".cookie",
  );
  p_elements.forEach((e) => {
    console.log("Removing cookie: ", e.innerHTML);
    e.remove();
  });

  //Append newly found cookies
  for (c in cookie_list) {
    //Create identifying string
    const cookie_string =
      cookie_list[c].name + " from " + cookie_list[c].domain + "\n";

    const is_secure = !bad_cookies_list.some(b=>cookie_list[c].name === b.name);

    //Create and append new p element to the cookie container.
    let p_element = document.createElement("p");
    p_element.innerHTML = cookie_string;
    p_element.classList.add("cookie");
    if(!is_secure) p_element.style.color="#6d0000";
    else p_element.style.color="black";
    cookie_container.appendChild(p_element);
  }
}