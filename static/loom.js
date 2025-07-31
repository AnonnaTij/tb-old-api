//let apiDomain = 'https://terabox-downloader-api-src-buoe.onrender.com'
//let apiDomain = "http://127.0.0.1:3000"
let apiDomain = "https://tb-old-api-crystal.onrender.com"
let dir_root = document.getElementById("dir_root")
let sr = ScrollReveal()
document.getElementById("submit_btn").addEventListener("click", async () => {
  await fetchDataAndLog();
});


async function fetchDataAndLog() {
  const a = document.getElementById("url-input").value.trim()
  if (a !== "") {
    loading(true)
    if (a.includes("://")) {
      getfileInfo(a)
        .then(jsonData => dataFrist(jsonData))
        .catch(error => {
          invalidErrorShow(true, 'Please ensure your network connection is stable.');
          loading(false)
        });
    } else {
      GetSearchResults(a)
        .then(jsonData => showSearchResults(jsonData))
        .catch(error => {
          //invalidErrorShow(true, 'Please ensure your network connection is stable.')
          loading(false)
        });
    }
    removeAllChildren(dir_root);
  } else {
    Toast.info('Error', 'Please enter a URL before submitting.')
  }
}


function ShowSearchElem(imgUrl, fileName, url) {
  const mainContainer = document.createElement('div');
  mainContainer.className = 'searchResultsItem flex items-center bg-black w-[95vw] rounded-[14px] p-2 bg-black';
  const iconContainer = document.createElement('div');
  iconContainer.className = 'w-10 h-10 bg-gray-300 rounded-[14px] flex justify-center items-center mr-2 flex-shrink-0';
  const img = document.createElement('img');
  img.src = "{{ url_for('static', filename='imgs/placeholder.png') }}";
  img.alt = fileName;
  img.className = 'w-4/5 h-4/5';

  // Hide the image initially
  img.style.display = 'none';

  // Listen for the load event on the image element
  img.onload = function() {
    // Show the image when it has finished loading
    img.style.display = 'block';
  };

  // Set the image source to the provided imgUrl
  img.src = imgUrl;

  iconContainer.appendChild(img);
  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex-grow font-mono text-lg text-white whitespace-nowrap overflow-hidden overflow-ellipsis';
  titleContainer.textContent = fileName;
  const copyButton = document.createElement('div');
  copyButton.className = 'h-full bg-[green] text-white px-4 py-2 rounded-[14px] font-mono flex-shrink-0';
  copyButton.textContent = 'COPY';
  copyButton.onclick = function() {
    navigator.clipboard.writeText(url);
  };
  mainContainer.appendChild(iconContainer);
  mainContainer.appendChild(titleContainer);
  mainContainer.appendChild(copyButton);
  dir_root.appendChild(mainContainer);
}




async function showSearchResults(b) {
  sr.clean('.download-prompt');
  loading(false);
  b = JSON.parse(b);
  const c = b.data.search_result.resource_list
  for (const item of c) {
    if (item.platform_resource !== null) {
      const fileName = item.platform_resource.file_name;
      const url = item.platform_resource.url
      const imgUrl = item.platform_resource.head_url;
      ShowSearchElem(imgUrl, fileName, url)
    } else {
      const external_urls = item.post_info.external_urls[0]
      const fileName2 = external_urls.file_name
      const url2 = external_urls.url
      const imgUrl2 = external_urls.link_icon_url
      ShowSearchElem(imgUrl2, fileName2, url2)
    }
  }
  sr.reveal('.searchResultsItem', { reset: true });
}


async function dataFrist(b) {
  sr.clean('.download-prompt');
  loading(false)
  if (b === 500) { return 500; }
  for (const item of b) {
    const name = item.server_filename;
    const fileID = item.fs_id;
    const shareID = item.shareid;
    const UK = item.uk;
    const size = convertSize(item.size);
    const category = parseInt(item.category)
    const downloadPrompt = document.createElement("div");
    const videoImg = document.createElement("div");
    const fileInfo1 = document.createElement("div");
    const fileInfo2 = document.createElement("div");
    const downloadBtn = document.createElement("button");
    const downloadBtnV2 = document.createElement("button");
    downloadPrompt.classList.add("download-prompt");
    fileInfo1.classList.add("file-info");
    fileInfo2.classList.add("file-info");
    downloadBtn.classList.add("download-btn");
    downloadBtnV2.classList.add("download-btn");
    fileInfo1.textContent = `Filename: ${name}`;
    fileInfo2.textContent = `Size: ${size}`;
    downloadBtn.textContent = "FAST DOWNLOAD";
    downloadBtnV2.textContent = "NORMAL DOWNLOAD";
    downloadBtn.onclick = function() {
      const dlink = download(shareID, UK, fileID, true);
    };
    downloadBtnV2.onclick = function() {
      const dlink = download(shareID, UK, fileID, false);
    };
    videoImg.setAttribute("id", "video_img");
    if (category === 3) {
      const thumbnailUrl = item.thumbnail;
      var img = document.createElement('img');
      img.src = thumbnailUrl;
      img.alt = name;
      var fileTypeImg = document.createElement('img');
      fileTypeImg.setAttribute('id', 'file_type');
      fileTypeImg.setAttribute('src', 'https://cdn-sc-g.sharechat.com/33d5318_1c8/150e757_1715816721202_sc.png');
      videoImg.appendChild(img);
      videoImg.appendChild(fileTypeImg);
    } else if (category === 1) {
      const thumbnailUrl = item.thumbnail;
      videoElement = document.createElement('video');
      videoElement.style.setProperty('--plyr-color-main', 'green');
      videoElement.setAttribute('id', 'player');
      videoElement.setAttribute('class', 'playsinline controls player');
      videoElement.setAttribute('controls', '');
      videoElement.setAttribute('preload', 'auto');
      videoElement.setAttribute('data-poster', thumbnailUrl);
      sourceElement = document.createElement('source');
      const a = {
        "shareid": shareID,
        "uk": UK,
        "fs_id": fileID
      };
      const streamUrl = apiDomain + "/stream.m3u8?" + "data=" + encrypt(JSON.stringify(a));
      sourceElement.setAttribute('src', streamUrl)
      sourceElement.setAttribute('type', 'application/x-mpegURL');
      videoElement.appendChild(sourceElement);
      videoImg.appendChild(videoElement);
      var fileTypeImg = document.createElement('img');
      fileTypeImg.setAttribute('id', 'file_type');
      fileTypeImg.setAttribute('src', 'https://cdn-sc-g.sharechat.com/33d5318_1c8/21cf3184_1715816699018_sc.png');
      videoImg.appendChild(fileTypeImg);
    } else {
      var img = document.createElement('img');
      img.src = "https://cdn-sc-g.sharechat.com/33d5318_1c8/11d8de0c_1715802101751_sc.png";
      img.alt = name;
      img.setAttribute('id', 'noPreviewImg');
      videoImg.appendChild(img);
      var fileTypeImg = document.createElement('img');
      fileTypeImg.setAttribute('id', 'file_type');
      fileTypeImg.setAttribute('src', 'https://cdn-sc-g.sharechat.com/33d5318_1c8/2611daa6_1715816667289_sc.png');
      videoImg.appendChild(fileTypeImg);
    }
    downloadPrompt.appendChild(videoImg);
    downloadPrompt.appendChild(fileInfo1);
    downloadPrompt.appendChild(fileInfo2);
    downloadPrompt.appendChild(downloadBtn);
    downloadPrompt.appendChild(downloadBtnV2);
    dir_root.appendChild(downloadPrompt);

  };
  players = Plyr.setup('.player'), { title: name, controls: ['play-large', 'rewind', 'play', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'fullscreen'], settings: ['captions', 'quality', 'speed', 'loop'] };
  sr.reveal('.download-prompt', { reset: true });
}


// Loading Page --💚
function loading(action) {
  a = document.getElementById("loading_bg");
  a.style.opacity = action ? "1" : "0";
  a.style.visibility = action ? "visible" : "hidden";
}
// Loading Page --❤️
// Toast (notification) --💚
class Toast {
  static info(a, b) {
    iziToast.info({ id: "toast_id", title: a, message: b, position: 'bottomCenter' });
  }
}
// Toast (notification) --❤️
// Convert Size To Human-readable Format --💚
function convertSize(size) {
  const suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
  let suffixIndex = 0;
  // Parse size to ensure it's treated as a number
  size = parseFloat(size);
  while (size >= 1024 && suffixIndex < suffixes.length - 1) {
    size /= 1024.0;
    suffixIndex++;
  }
  return size.toFixed(2) + ' ' + suffixes[suffixIndex];
}
// Convert Size To Human-readable Format --❤️
// Encryption --💚
function tohex(text) {
  let hex = '';
  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i).toString(16);
    hex += ('00' + charCode).slice(-2);
  }
  return hex;
}

function encrypt(text) {
  var l = CryptoJS.enc.Utf8.parse("json".padEnd(32, '\0'));
  var il = CryptoJS.enc.Utf8.parse("json".padEnd(16, '\0'));
  var i = CryptoJS.AES.encrypt(text, l, { iv: il });
  return tohex(i.toString());
}
// Encryption --❤️
// Download File By ShareID, UK And FileID-- 💚
function download(shareid, uk, fs_id, type) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function() {
    if (this.readyState === this.DONE) {
      let responseData;
      if (type) {
        b = JSON.parse(this.responseText).downloadUrlV2;
      } else {
        b = JSON.parse(this.responseText).downloadUrl;
      }
      var c = document.createElement('a');
      c.rel = 'noopener noreferrer';
      c.href = b;
      c.target = '_blank';
      c.click();
    }
  });
  const a = {
    "shareid": shareid,
    "uk": uk,
    "fs_id": fs_id
  };
  xhr.open('GET', apiDomain + `/download?data=` + encrypt(JSON.stringify(a)), true);
  xhr.send();
}
// Download File By ShareID, UK And FileID -- ❤️
// Function to remove all children from a DOM element --💚
function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
// Function to remove all children from a DOM element --❤️








async function getfileInfo(url) {
  let jsonData = [];
  let dirData = [];
  let hd8erbf = await GetShortUrlInfo(url);
  if (hd8erbf === 500) { return 500 }
  const shortUrlInfoData = JSON.parse(hd8erbf);
  let list_items = shortUrlInfoData[0];
  let shareid = shortUrlInfoData[1];
  let uk = shortUrlInfoData[2];
  for (let item of list_items) {
    if (parseInt(item["isdir"]) === 1) {
      // Collect directory data
      dirData.push({ "shareid": shareid, "uk": uk, "fs_id": item["fs_id"] });
    } else if (parseInt(item["isdir"]) === 0) {
      // Collect file data
      jsonData.push({
        "shareid": shareid,
        "uk": uk,
        "category": item["category"],
        "fs_id": item["fs_id"],
        "server_filename": item["server_filename"],
        "size": item["size"],
        "thumbnail": item["thumbs"]["url3"] || "https://cdn-sc-g.sharechat.com/33d5318_1c8/11d8de0c_1715802101751_sc.png"
      });
    }
  }
  // Recursive function to gather data for all subdirectories
  async function getItems(shareid, uk, fsId) {
    let hs73jtkfjx = await GetChildInfo(shareid, uk, fsId);
    const childInfoData = JSON.parse(hs73jtkfjx);
    let childJsonData = [];
    let childDirData = [];
    for (let item of childInfoData) {
      if (parseInt(item["isdir"]) === 1) {
        childDirData.push({ "shareid": shareid, "uk": uk, "fs_id": item["fs_id"] });
      } else if (parseInt(item["isdir"]) === 0) {
        childJsonData.push({
          "shareid": shareid,
          "uk": uk,
          "category": item["category"],
          "fs_id": item["fs_id"],
          "server_filename": item["server_filename"],
          "size": item["size"],
          "thumbnail": item["thumbs"]["url3"] || "https://cdn-sc-g.sharechat.com/33d5318_1c8/11d8de0c_1715802101751_sc.png"
        });
      }
    }
    return { childJsonData, childDirData };
  }
  // Process each directory recursively
  for (let dir_item of dirData) {
    let { shareid, uk, fs_id } = dir_item;
    let { childJsonData, childDirData } = await getItems(shareid, uk, fs_id);
    jsonData.push(...childJsonData);
    dirData.push(...childDirData);
  }

  return jsonData;
}
// Get ShareID, UK And Information From URL
async function GetShortUrlInfo(c) {
  const encryptedText = encrypt(c)
  let response = await fetch(`${apiDomain}/shorturlinfo?url=${encryptedText}`);
  const textRes = await response.text()
  const jsonRes = JSON.parse(textRes)[1]
  if (jsonRes === "0") {
    invalidErrorShow(true, 'It looks like the URL you entered is invalid. Please check the URL and try again.')
    return 500
  } else {
    return textRes;
  }
}

// GetChildInfo
async function GetChildInfo(c, d, e) {
  let response = await fetch(`${apiDomain}/list?shareid=${c}&uk=${d}&fsId=${e}`);
  return await response.text();
}

async function GetSearchResults(q) {
  let response = await fetch(`${apiDomain}/search?q=${q}`);
  return await response.text();
}

document.getElementById("pasteBtn").addEventListener("click", async () => pasteText());

function pasteText() {
  // Assuming you have an element with id "targetElement" where you want to paste the text
  let targetElement = document.getElementById("url-input");
  // Read text from clipboard
  navigator.clipboard.readText()
    .then(text => {
      // Insert the text into the target element
      targetElement.value = text;
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
}




document.addEventListener("DOMContentLoaded", () => {
  const words = ["Downloader", "Video Player", "Search Engine"];
  let wordIndex = 0;
  const animatedText = document.getElementById("animated-text");
  function changeWord() {
    gsap.to(animatedText, {
      duration: 0.5,
      opacity: 0,
      y: -50,
      ease: "power1.in",
      onComplete: () => {
        wordIndex = (wordIndex + 1) % words.length;
        animatedText.textContent = words[wordIndex];
        gsap.fromTo(animatedText, { y: 50, opacity: 0 }, {
          duration: 0.5,
          opacity: 1,
          y: 0,
          ease: "power1.out"
        });
      }
    });
  }
  setInterval(changeWord, 2000); // Change word every 2 seconds
});



const text = document.querySelector('.animation-container');
const words = text.textContent.split(' ');
text.innerHTML = ''; // Clear the original text
words.forEach((word, index) => {
  const wordElement = document.createElement('span');
  wordElement.textContent = word + " ‎ "
  wordElement.classList.add('animated-text');
  text.appendChild(wordElement);
  anime.timeline({ loop: false })
    .add({
      targets: wordElement,
      textShadow: ['0 0 5px rgba(0,0,0,0.5)', '0 0 0px rgba(0,0,0,0)'],
      opacity: [0, 1],
      easing: 'easeInOutQuad',
      duration: 1000,
      delay: index * 100
    });
});



function invalidErrorShow(action, text) {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  if (text) {
  document.getElementById('popText').textContent = text;
  }
  if (action) {
    popup.classList.remove('hidden');
    overlay.classList.remove('hidden');
    setTimeout(() => {
      popup.classList.remove('opacity-0');
      overlay.classList.remove('opacity-0');
    }, 50); // Adjust this timeout according to your transition duration
  } else {
    popup.classList.add('opacity-0');
    overlay.classList.add('opacity-0');
    setTimeout(() => {
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 500); // Transition duration
  }
}
