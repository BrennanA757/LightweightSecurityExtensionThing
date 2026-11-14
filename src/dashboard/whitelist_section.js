const form = document.querySelector("#whitelist_form");
let edit_index = "";

document.addEventListener("DOMContentLoaded", async () => {
  await chrome.storage.local.get("whitelisted_sites", result=>{
    updateWhitelistedDomains(result.whitelisted_sites);
  });
});

function updateWhitelistedDomains(whitelisted_sites) {
  let whitelist_container = document.getElementById("whitelist_list");
  whitelist_container.replaceChildren();

  const p_elements = whitelist_container.querySelectorAll(
    ".whitelisted_domain",
  );
  p_elements.forEach((e) => {
    e.remove();
  });

  for (const i in whitelisted_sites) {
    let element;
    if(i != edit_index){
      element = createWhitelistElement(whitelisted_sites[i], i);
    }
    else{
      element = createInputField(whitelisted_sites[i]);
    }

    whitelist_container.appendChild(element);
  }
}

function createWhitelistElement(name, index){

  //Create div container
  let div = document.createElement("div");
  div.style.display="flex";
  div.style.flexDirection="row";
  div.style.gap="10px";
  div.classList.add("whitelist_row");

  //Create edit button
  let edit_btn = document.createElement("button");
  edit_btn.id=index;
  edit_btn.onclick=()=>selectWhiteList(index); //Be sure to use arrow function or else this calls the function!
  edit_btn.type="button";

  //Create edit image
  let image = document.createElement("img");
  image.src = "../../icons/icons8-edit-pencil-50.png";
  image.style.maxWidth = "15px";
  image.style.maxHeight = "15px";
  image.classList.add("editIcon");
  edit_btn.appendChild(image);

  //Whitelisted domain name
  let p_element = document.createElement("p");
  p_element.innerHTML = name;
  p_element.classList.add("whitelisted_domain");

  //Append children to container and return
  div.appendChild(p_element);
  div.appendChild(edit_btn);
  return div;
}

function createInputField(name){

  //Create div container
  let div = document.createElement("div");
  div.style.display="flex";
  div.style.flexDirection="row";
  div.style.gap="10px";
  div.classList.add("whitelist_row");

  //Create input field
  let input = document.createElement("input");
  input.id="edit_index";
  input.defaultValue=name;

  //Create save button
  let save=document.createElement("button");
  save.type="button";
  save.innerHTML="Edit";
  save.style.cursor="pointer";
  save.onclick=()=>updateWhiteList();

  //Create delete button
  let delete_button = document.createElement("button");
  delete_button.type="button";
  delete_button.innerHTML="Delete";
  delete_button.style.cursor="pointer";
  delete_button.style.color="red";
  delete_button.onclick=()=>removeWhiteList();

  //Append children to container and return div
  div.appendChild(input);
  div.appendChild(save);
  div.appendChild(delete_button);
  return div;
}

async function selectWhiteList(index){
  edit_index=index;

  await chrome.storage.local.get("whitelisted_sites", result=>{
    updateWhitelistedDomains(result.whitelisted_sites);
  });
}

async function updateWhiteList(){
  const input=document.getElementById("edit_index");
  const new_whitelist=input.value;

  await chrome.storage.local.get("whitelisted_sites", result=>{

    //Null check
    if(result.whitelisted_sites == undefined){
      console.log("Unable to get whitelisted_sites. Aborting.");
      return;
    }

    let whitelisted_sites = result.whitelisted_sites;
    console.log("Removing " + edit_index + " from whitelist.");
      whitelisted_sites.splice(edit_index, 1);

    console.log("Adding " + new_whitelist + " to whitelist.");
    whitelisted_sites.push(new_whitelist);

    //Reset edit_index
    edit_index=-1;

    chrome.storage.local.set({
      whitelisted_sites
    });
  });

  await chrome.storage.local.get("whitelisted_sites", result=>{
    updateWhitelistedDomains(result.whitelisted_sites);
  });
}

async function removeWhiteList(){
  await chrome.storage.local.get("whitelisted_sites", result=>{
    //Null check
    if(result.whitelisted_sites == undefined){
      console.log("Unable to get whitelisted_sites. Aborting.");
      return;
    }

    let whitelisted_sites = result.whitelisted_sites;
    console.log("Removing " + edit_index + " from whitelist.");
    whitelisted_sites.splice(edit_index, 1);

    //Reset edit_index
    edit_index=-1;

    chrome.storage.local.set({
      whitelisted_sites
    });
  });

  await chrome.storage.local.get("whitelisted_sites", result=>{
    updateWhitelistedDomains(result.whitelisted_sites);
  });
}


form.addEventListener("submit", async function (event) {

  console.log("Submitting new whitelist to list");

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