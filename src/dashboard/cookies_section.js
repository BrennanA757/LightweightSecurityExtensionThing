document.addEventListener("DOMContentLoaded", async () => {
  //Update detected cookies list
  await listCookies();
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

  for (c in cookie_list) {
    //Create identifying string
    const cookie_string =
      cookie_list[c].name + " from " + cookie_list[c].domain + "\n";

    const is_secure = !bad_cookies_list.includes(c);

    //Create and append new p element to the cookie container.
    let p_element = document.createElement("p");
    p_element.innerHTML = cookie_string;
    if(!is_secure) p_element.style.color="red";
    else p_element.style.color="black";
    cookie_container.appendChild(p_element);
  }
}