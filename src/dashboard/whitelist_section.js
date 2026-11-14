const form = document.querySelector("#whitelist_form");

const WHITELIST_KEY="whitelisted_sites"
const WHITELIST_REGEX_KEY="whitelisted_sites_regexes";

let edit_index=-1;
let edit_whitelist_name="";

document.addEventListener("DOMContentLoaded", async () => {
  await chrome.storage.local.get(WHITELIST_KEY, result=>{
    renderWhitelistedDomainsUI(result.whitelisted_sites);
  });
});

form.addEventListener("submit", async function (event) {

  event.preventDefault(); //Stop from submitting normally

  const formData = new FormData(event.target); //Get form element
  const data = formData.get("domain_input"); //Get data from input element inside form

  //Update whitelisted sites list
  let result = await chrome.storage.local.get(WHITELIST_KEY);
  result.whitelisted_sites.push(data);

  await chrome.storage.local.set({
    whitelisted_sites: result.whitelisted_sites,
  });

  await updateRegexList();

  //Update whitelisted sites list UI
  try {
    chrome.storage.local.get(WHITELIST_KEY, (result) => {
      renderWhitelistedDomainsUI(result.whitelisted_sites);
    });
  } catch (e) {
    console.log("Unable to find whitelisted domain dictionary: " + e);
  }
});

function renderWhitelistedDomainsUI(whitelisted_sites) {
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
      element = createWhitelistHTMLElement(whitelisted_sites[i], i);
    }
    else{
      element = createInputHTMLField(whitelisted_sites[i]);
    }

    whitelist_container.appendChild(element);
  }
}

function createWhitelistHTMLElement(name, index){

  //Create div container
  let div = document.createElement("div");
  div.style.display="flex";
  div.style.flexDirection="row";
  div.style.gap="10px";
  div.classList.add("whitelist_row");

  //Create edit button
  let edit_btn = document.createElement("button");
  edit_btn.id=index;
  edit_btn.onclick=()=>selectWhiteList(index, name); //Be sure to use arrow function or else this calls the function!
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

function createInputHTMLField(name){

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
  save.onclick=()=>editWhiteLists();

  //Create delete button
  let delete_button = document.createElement("button");
  delete_button.type="button";
  delete_button.innerHTML="Delete";
  delete_button.style.cursor="pointer";
  delete_button.style.color="red";
  delete_button.onclick=()=>deleteWhiteListFromLists();

  //Append children to container and return div
  div.appendChild(input);
  div.appendChild(save);
  div.appendChild(delete_button);
  return div;
}

async function editWhiteLists(){
  await updateWhiteList();
  await updateRegexList();
  
  edit_index=-1;
  edit_whitelist_name="";
}

async function deleteWhiteListFromLists(){
  await removeWhiteList();
  await updateRegexList();

  edit_index=-1;
  edit_whitelist_name="";
}

async function selectWhiteList(index, name){
  edit_index=index;
  edit_whitelist_name=name;

  await chrome.storage.local.get(WHITELIST_KEY, result=>{
    renderWhitelistedDomainsUI(result.whitelisted_sites);
  });
}

async function updateWhiteList(){
  const input=document.getElementById("edit_index");
  const new_whitelist=input.value;
  let whitelist;

  const data = await chrome.storage.local.get(WHITELIST_KEY);

  //Null check
  if(data.whitelisted_sites == undefined){
    console.log("Unable to get whitelisted_sites. Aborting.");
    return;
  }

  whitelist = data.whitelisted_sites;
  whitelist.splice(edit_index, 1);

  whitelist.push(new_whitelist);

  //Reset edit_index
  edit_index=-1;

  await chrome.storage.local.set({
    [WHITELIST_KEY]: whitelist,
  });

  const result = await chrome.storage.local.get(WHITELIST_KEY);
  renderWhitelistedDomainsUI(result.whitelisted_sites);
}

async function removeWhiteList(){
  let whitelisted_sites;
  const data = await chrome.storage.local.get(WHITELIST_KEY);
  //Null check
  if(data.whitelisted_sites == undefined){
    console.log("Unable to get whitelisted_sites. Aborting.");
    return;
  }

  whitelisted_sites = data.whitelisted_sites;
  console.log("Removing " + edit_index + " from whitelist.");
  whitelisted_sites.splice(edit_index, 1);

  await chrome.storage.local.set({
    whitelisted_sites
  });

  const result = await chrome.storage.local.get(WHITELIST_KEY);
  renderWhitelistedDomainsUI(result.whitelisted_sites);
}

async function addWhitelist(name){
  const data = await chrome.storage.local.get(WHITELIST_KEY);
  let new_whitelist=data.whitelisted_sites;
  new_whitelist.push(name);
  await chrome.storage.local.set({
    [WHITELIST_KEY]: new_whitelist
  });
}

async function updateRegexList(){
  let new_regex_list = [];
  const result=await chrome.storage.local.get(WHITELIST_KEY);
  result.whitelisted_sites.forEach(whitelist=>{
    new_regex_list.push(convertDomainToRegex(whitelist));
  });

  console.log("Updating regex list: " + new_regex_list.toString());
  await chrome.storage.local.set({
    [WHITELIST_REGEX_KEY]: new_regex_list
  });
}

function convertDomainToRegex(domain){
  const regex_string = "/*." + domain.replace(".", "\\.") + "/";
  const regex = new RegExp(regex_string);
  return regex;
}
