const form = document.querySelector("#whitelist_form");
let edit_whitelist = "";

document.addEventListener("DOMContentLoaded", async () => {
  await chrome.storage.local.get("whitelisted_sites", result=>{
    updateWhitelistedDomains(result.whitelisted_sites);
  });
});

function updateWhitelistedDomains(whitelisted_sites) {
  whitelist_container = document.getElementById("whitelist_list");
  whitelist_container.replaceChildren();

  const p_elements = whitelist_container.querySelectorAll(
    ".whitelisted_domain",
  );
  p_elements.forEach((e) => {
    e.remove();
  });

  for (const i in whitelisted_sites) {
    let element;
    if(i != edit_whitelist){
      element = createWhitelistElement(i);
    }
    else{
      element = createInputField(i);
    }

    whitelist_container.appendChild(element);
  }
}

function createWhitelistElement(name){
  let div = document.createElement("div");
  div.style.display="flex";
  div.style.flexDirection="row";
  div.style.gap="10px";
  div.classList.add("whitelist_row");

  let edit_btn = document.createElement("button");
  edit_btn.onclick=selectWhiteList;
  edit_btn.type="button";

  let image = document.createElement("img");
  image.src = "../../icons/icons8-edit-pencil-50.png";
  image.style.maxWidth = "15px";
  image.style.maxHeight = "15px";
  image.classList.add("editIcon");
  edit_btn.appendChild(image);

  let p_element = document.createElement("p");
  p_element.innerHTML = name;
  p_element.classList.add("whitelisted_domain");

  div.appendChild(p_element);
  div.appendChild(edit_btn);
  return div;

  //TODO: Fix bug with whitelists showing numbers instead of names and finish update logic.
}

function createInputField(name){
  let div = document.createElement("div");
  div.style.display="flex";
  div.style.flexDirection="row";
  div.style.gap="10px";
  div.classList.add("whitelist_row");

  let input = document.createElement("input");
  input.id="edit_whitelist";
  input.defaultValue=name;

  let save=document.createElement("button");
  save.innerHTML="Edit";
  save.onclick=updateWhiteList;

  return div;
}

function selectWhiteList(whitelist){
  edit_whitelist=whitelist;
  updateWhitelistedDomains();
}

async function updateWhiteList(){
  const input=document.getElementById("edit_whitelist");
  const new_whitelist=input.value;

  await chrome.storage.local.get("whitelisted_sites", result=>{

    //Null check
    if(result.whitelisted_sites == undefined){
      console.log("Unable to get whitelisted_sites. Aborting.");
      return;
    }

    let whitelisted_sites = result.whitelisted_sites;
    if(whitelisted_sites.includes(edit_whitelist)){
      console.log("Removing " + edit_whitelist + " from whitelist.");
      whitelisted_sites.remove(edit_whitelist);
    }

    console.log("Adding " + new_whitelist + " to whitelist.");
    whitelisted_sites.add(new_whitelist);

    chrome.storage.local.set({
      whitelisted_sites
    });
  });
}


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

  //Update whitelisted sites list
  try {
    chrome.storage.local.get("whitelisted_sites", (result) => {
      updateWhitelistedDomains(result.whitelisted_sites);
    });
  } catch (e) {
    console.log("Unable to find whitelisted domain dictionary: " + e);
  }
});