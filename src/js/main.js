const urlListTable = document.getElementById("qualities_listed");
const allAvailableSites = [
  "pornhub.com",
  //   "xhamster.com",
  //   "xhsite.blog",
  //   "pornoxo.com",
  //   "momvids.com",
  //   "japan-whores.com",
  //   "fuq.com",
  //   "faphouse.com",
  //   "eporner.com",
  //   "asianmuffin.com",
];
const urlInputForm = document.getElementById("requested_url");
const urlSubmitButton = document.getElementById("download_button");
const apiUrl = "https://pphub22569.onrender.com/";
let prevUrl = "";
const player = document.getElementById("video_player");

function isSiteAvailable(siteName) {
  var isFound = Boolean(false);
  if (!siteName.startsWith("https://") && !siteName.startsWith("http://")) {
    return isFound;
  }
  for (const idx in allAvailableSites) {
    if (siteName.includes(allAvailableSites[idx])) {
      isFound = true;
      break;
    }
  }
  return isFound;
}

urlInputForm.addEventListener("input", (e) => {
  const usr_input = urlInputForm.value;
  if (usr_input.length > 10 && isSiteAvailable(usr_input)) {
    urlSubmitButton.textContent = "DOWNLOAD METADATA NOW";
    urlSubmitButton.style.opacity = 1;
    urlSubmitButton.disabled = false;
  } else {
    if (usr_input.length < 1) {
      urlSubmitButton.textContent = "NO URL ENTERED";
    }
    urlSubmitButton.style.opacity = 0.3;
    urlSubmitButton.disabled = true;
  }
});
urlInputForm.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    const usr_input = urlInputForm.value;
    if (usr_input.length > 10 && isSiteAvailable(usr_input)) {
      urlSubmitButton.textContent = "DOWNLOAD METADATA NOW";
      urlSubmitButton.style.opacity = 1;
      urlSubmitButton.disabled = false;
      download_button_helper();
    } else {
      urlSubmitButton.style.opacity = 0.3;
      urlSubmitButton.disabled = true;
      alert("Dude not a valid URL!");
    }
  }
});

function generate_qualities_table(quality, idx) {
  const row = document.createElement("section");
  const col1 = document.createElement("section");
  const col2 = document.createElement("section");
  const button_col2 = document.createElement("button");

  row.className = "row";
  col1.className = "col";
  col1.textContent = quality;
  col2.className = "col";
  button_col2.textContent = "DOWNLOAD";
  button_col2.setAttribute("onclick", `download_for('${idx}')`);

  row.appendChild(col1);
  col2.appendChild(button_col2);
  row.appendChild(col2);

  return row;
}

async function query_for_qualities(url) {
  urlSubmitButton.innerHTML = '<div class="loader"></div>';
  const b64url = btoa(url);
  const res = await fetch(`${apiUrl}video_info?v=${b64url}`);
  if (res.status != 200) {
    return { error: true, data: {} };
  }
  const data = await res.json();
  urlSubmitButton.textContent = String(data["title"]).replace(".mp4", "");
  return { error: false, data: data };
}

async function download_button_helper() {
  const usr_input_url = String(urlInputForm.value);
  if (prevUrl == usr_input_url) {
    return null;
  }
  if (!isSiteAvailable(usr_input_url)) {
    alert("Please enter a valid URL");
    return null;
  }

  const data = await query_for_qualities(usr_input_url);
  if (data["error"]) {
    return null;
  }

  var qualities = [];
  const totalLength = data["data"]["total"];
  const urls = data["data"]["urls"];
  urls.forEach((url) => {
    qualities.push({ qual: String(url["height"]) + "p", id: url["id"] });
  });

  qualities.forEach((qual) => {
    const row = generate_qualities_table(qual["qual"], qual["id"]);
    urlListTable.appendChild(row);
    if (
      qualities.findIndex((quals) => quals.id == qual.id) !=
      totalLength - 1
    ) {
      urlListTable.innerHTML += '<div class="vertical_line"></div>';
    }
  });

  document.getElementById("download_options").style.display = "block";
  prevUrl = usr_input_url;
  return null;
}

async function download_for(idx) {
  const url = `${apiUrl}download?id=${idx}`;
  const api = document.createElement("a");
  api.href = url;
  document.body.appendChild(api);
  api.click();
  document.body.removeChild(api);
}

function generate_video_player_quals(quality, idx) {
  const button = document.createElement("button");
  button.setAttribute("onclick", `stream_for('${idx}')`);
  button.id = "quality_button";
  button.setAttribute("dataset", idx);
  button.textContent = quality;
  return button;
}

function setButtonActive(idx) {
  const buttons = document.querySelectorAll("#quality_button");
  for(let index = 0; index < buttons.length; index++) {
    const button = buttons[index];
    if (String(button.getAttribute('dataset')) == String(idx)) {
        button.className = 'currently_playing_button';
    } else {
        button.className = '';
    }
  }
}

async function stream_helper() {
  const usr_input_url = String(urlInputForm.value);
  const main_contain = document.getElementById("main_video_container");
  if (prevUrl == usr_input_url) {
    return null;
  }
  if (!isSiteAvailable(usr_input_url)) {
    alert("Please enter a valid URL");
    return null;
  }

  const data = await query_for_qualities(usr_input_url);
  if (data["error"]) {
    return null;
  }

  const qualList = document.getElementById("video_qualities");

  var qualities = [];
  const totalLength = data["data"]["total"];
  const urls = data["data"]["urls"];
  urls.forEach((url) => {
    qualities.push({ qual: String(url["height"]) + "p", id: url["id"] });
  });

  qualities.forEach((qual) => {
    const row = generate_video_player_quals(qual["qual"], qual["id"]);
    qualList.appendChild(row);
  });
  prevUrl = usr_input_url;
  player.src = `${apiUrl}video_play?id=${totalLength - 1}`;
  player.play();
  main_contain.style.display = "block";
  setButtonActive(totalLength - 1);
  return null;
}

async function stream_for(idx) {
  const url = `${apiUrl}video_play?id=${idx}`;
  setButtonActive(idx);
  player.src = url;
  player.play();
}
