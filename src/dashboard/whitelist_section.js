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