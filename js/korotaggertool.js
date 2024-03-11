document.addEventListener("keydown", (e) => {
    // console.log((e.ctrlKey || e.metaKey), e.shiftKey, e.key);
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        redo();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        undo();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        download();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        handleAddNewTagButton();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        handleSaveButton();
        e.preventDefault();
    }/*else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
        e.preventDefault();
    }*/
});
const convert_button = document.getElementById("convert");
const kt_radio = document.getElementById("ktradio");
const yt_radio = document.getElementById("ytradio");
const padhours_check = document.getElementById("padhours");
const afterbox = document.getElementById("afterbox");
const input_textarea = document.getElementById("input");
const output_textarea = document.getElementById("output");
const videoid_input = document.getElementById("videoinput");
const videoidinput_form = document.getElementById("videoinputform");
const timedisplay = document.getElementById("timedisplay");
const videotime_form = document.getElementById("videotimeform");
const taglistcontainer = document.getElementById("taglistcontainer");
const undobutton = document.getElementById("undobutton");
const redobutton = document.getElementById("redobutton");
const filename_input = document.getElementById("filenameinput");
const status_span = document.getElementById("status");

const loadTags_modal = document.getElementById("loadTagsModal");
const settings_modal = document.getElementById("settingsModal");
const autosavedelay_input = document.getElementById("autosaveinterval");
const bannedwords_textarea = document.getElementById("bannedwords");
const bannedregex_textarea = document.getElementById("bannedregex");

const sanityCheckContainer = document.getElementById("sanitycheckcontainer");
const sanityCheckToggleButton = document.getElementById("sanitychecktogglebutton");

let player;
let tagsJson = loadTagsFromStorage();

let autosaveInterval = null;
let autosaveDelay = getAutosaveDelayFromLocalStorage();  // in seconds

enableDisableSanityCheck(getSanityCheckStateFromLocalStorage());
loadBannedWordsFromLocalStorage();

if (tagsJson === undefined || tagsJson === null || tagsJson.length === 0) {
    // Initalize tag list to have 1 item to make it look good
    tagsJson = [];
    addNewTag();
    renderOutput();
} else {
    // console.log(tagsJson);
    newHistory(tagsJson);
    renderTagList();

    const videoUrl = loadActiveVideofromStorage();
    // const videoid = getIdFromUrl(tagsJson[0].text);
    if (videoUrl !== null) {
        videoid_input.value = videoUrl;
    }
    const filename = loadTagFilenameFromLocalStorage();
    if (filename !== null) {
        filename_input.value = filename;
    }
    renderOutput();
}

convert_button.onclick = ev => {
    if (yt_radio.checked) {
        tagsJson = parseTags(input_textarea.value, parseSingleTagYTCommentTag);
    } else {
        tagsJson = parseTags(input_textarea.value);
    }
    if (loadVideoFromTags(tagsJson)) {
        // If the first line contained metadata, remove that line.
        // I really hope nobody is insane enough to include a video link in the first tag...
        tagsJson.shift();
    }
    newHistory(tagsJson);
    renderTagList();
    renderOutput();
    closeLoadTagsModal();
};

videoidinput_form.onsubmit = ev => {
    loadVideoFromUrl(videoid_input.value);
    ev.preventDefault();
    return false;
}

videotime_form.onsubmit = ev => {
    const seconds = smartTimestampToSeconds(timedisplay.value);
    if (isNaN(seconds)) {
        // timedisplay.value = "Invalid timestamp.";
        updateVideoTimeDisplay();
        ev.preventDefault();
        return false;
    }
    player.seekTo(seconds, true);
    ev.preventDefault();
    return false;
}

filename_input.addEventListener("change", (ev) => {
    renderOutput();
});

padhours_check.addEventListener("change", ev => {
    // TODO: save this preference in LocalStorage
    renderOutput();
})

// 2. This code loads the IFrame Player API code asynchronously.
const tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: getIdFromUrl(videoid_input.value),
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    updateVideoTimeDisplay();
    event.target.pauseVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should update the timestamp every second.
let secondsUpdateInterval = null;
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && !secondsUpdateInterval) {
        secondsUpdateInterval = setInterval(updateVideoTimeDisplay, 10);
    } else {
        if (secondsUpdateInterval) {
            clearInterval(secondsUpdateInterval);
            secondsUpdateInterval = null;
        }
    }
}

function loadVideoFromTags(tags) {
    if (tags.length > 0 && tags[0].time === null || isNaN(tags[0].time)) {
        // Attempt to load a video
        const videoId = getIdFromUrl(tags[0].text);
        if (videoId !== null) {
            videoid_input.value = "https://www.youtube.com/watch?v=" + videoId;
            loadVideo(videoId);
        }
        return true;
    }
    return false;
}

function loadVideoFromUrl(url) {
    loadVideo(getIdFromUrl(url));
}

function loadVideo(id) {
    player.loadVideoById(id);

    setTimeout(() => {
        const videodata = player.getVideoData();
        console.log(videodata);
        filename_input.value = videodata.title + " - " + videodata.author;
    }, 1000);
}

function stopVideo() {
    player.pauseVideo();
}

function getVideoTime() {
    return Math.floor(player.getCurrentTime());
}

function updateVideoTimeDisplay() {
    timedisplay.value = secondsToTimestamp(getVideoTime(), true);
}

function updateTagsWithHistory(newTagJson) {
    addToHistory(newTagJson);
    tagsJson = newTagJson;
}

function renderTagList(scrollPosition) {
    const tags = renderTags(
        tagsJson,
        (t, sp) => {
            t.sort((a, b) => {
                const diff = a.time - b.time;
                if (isNaN(diff) || a.time === null || b.time === null) {
                    return 0;
                }
                return diff;
            });
            updateTagsWithHistory(t);
            renderTagList(sp);
            renderOutput();
        },
        (time) => player.seekTo(time)
    );
    taglistcontainer.innerHTML = "";
    taglistcontainer.appendChild(tags);
    tags.scrollTop = scrollPosition;
}

function addNewTag(position) {
    const newItem = {
        "text": "",
        "time": null
    };
    if (position === undefined) {
        tagsJson.unshift(newItem);
    } else {
        tagsJson.splice(position, 0, newItem);
    }
    addToHistory(tagsJson);
    const ol = document.getElementsByClassName("tagslist")[0];
    renderTagList(ol ? ol.scrollTop : undefined);
    renderOutput();
}

function undo() {
    const newstate = goBackInHistory();
    if (newstate !== null) {
        tagsJson = newstate;
        renderTagList(taglistcontainer.children[0].scrollTop);
        renderOutput();
    }
}

function redo() {
    const newstate = goForwardInHistory();
    if (newstate !== null) {
        tagsJson = newstate;
        renderTagList(taglistcontainer.children[0].scrollTop);
        renderOutput();
    }
}

function download() {
    const output = output_textarea.value;
    // console.log("Trying to dl");
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
    element.setAttribute('download', filename_input.value);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function autoSave() {
    updateStatus("Last autosaved on " + new Date().toLocaleString());
    save();
}

function save() {
    saveTagsToStorage(tagsJson);
    saveActiveVideoToStorage(videoid_input.value);
    saveTagFilenameToLocalStorage(filename_input.value);
}

function handleAddNewTagButton() {
    addNewTag(afterbox.valueAsNumber);
    const newAfterBoxValue = afterbox.valueAsNumber + 1
    afterbox.value = newAfterBoxValue > tagsJson.length ? tagsJson.length : newAfterBoxValue
}

function handleSanityCheckButton() {
    sanityCheckTags(tagsJson);
    renderTagList();
}

function handleClearSanityCheckErrorButton() {
    clearSanityCheckErrors(tagsJson);
    renderTagList();
}

function updateStatus(text) {
    status_span.innerText = text;
}

function handleSaveButton() {
    updateStatus("Manually saved at " + new Date().toLocaleString())
    save();
}

function seekVideo(seconds) {
    let newtime = getVideoTime() + seconds;
    // Attempt to prevent breaking the video player
    if (newtime < 0) {
        newtime = 0;
    }
    timedisplay.value = secondsToTimestamp(newtime, true);
    player.seekTo(newtime, true);
}

function renderOutput() {
    // TODO: find a better way to run an action when tagsJson is changed
    afterbox.setAttribute("max", tagsJson.length);

    const output_header = filename_input.value + " (" + videoid_input.value + ")\n";
    const output = renderPreferred(tagsJson, padhours_check.checked);
    output_textarea.value = output_header + output;
}

function showLoadTagsModal() {
    loadTags_modal.style.display = "block";
}

function closeLoadTagsModal() {
    loadTags_modal.style.display = "none";
}

function showSettings() {
    autosavedelay_input.value = autosaveDelay;
    showBannedWordsInSettings();
    settings_modal.style.display = "block";
}

function closeSettingsModal() {
    settings_modal.style.display = "none";
}

function handleEnableDisableSanityCheckButton() {
    const enableSanityCheck = sanityCheckContainer.style.display == "none";
    enableDisableSanityCheck(enableSanityCheck);
    saveSanityCheckStateToLocalStorage(enableSanityCheck);
}

function enableDisableSanityCheck(enableSanityCheck) {
    if(enableSanityCheck) {
        sanityCheckContainer.style.display = "block";
        sanityCheckToggleButton.innerText = "Disable Sanity Check"
    } else {
        // Clear any sanity check results
        // TODO: have some way to ignore rendering these errors instead of clearing them
        handleClearSanityCheckErrorButton();
        sanityCheckContainer.style.display = "none";
        sanityCheckToggleButton.innerText = "Enable Sanity Check";
    }
}

function startAutoSave(delay) {
    // delay is in seconds
    if (delay === 0) {
        status_span.innerText = "Autosave is disabled.";
        return;
    }
    autosaveInterval = setInterval(autoSave, delay * 1000);
    status_span.innerText = "Autosave on in " + delay + "s intervals.";
}

function stopAutoSave() {
    if (autosaveInterval !== null) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }
}

function updateAutosaveInterval() {
    stopAutoSave();

    autosaveDelay = autosavedelay_input.valueAsNumber;

    saveAutosaveDelayToLocalStorage(autosaveDelay);
    startAutoSave(autosaveDelay)
}

function showDefaultBannedWordsInSettings() {
    bannedwords_textarea.value = arrayToNewlineSeparated(defaultBannedWords);
    bannedregex_textarea.value = JSON.stringify(defaultBannedRegExps, null, 2);
}

function showBannedWordsInSettings() {
    bannedwords_textarea.value = arrayToNewlineSeparated(bannedWords);
    bannedregex_textarea.value = JSON.stringify(bannedRegExps, null, 2);
}

function saveBannedWords() {
    /*bannedwords_textarea.value = arrayToNewlineSeparated(bannedWords);
    bannedregex_textarea.value = JSON.stringify(bannedRegExps, null, 2);*/
    bannedWords = bannedwords_textarea.value.split("\n");
    try {
        bannedRegExps = JSON.parse(bannedregex_textarea.value);
    } catch {
        alert("Banned RegExps is not valid JSON. Banned word list not saved.");
        return;
    }
    saveBannedWordsToLocalStorage();
    alert("Banned word list saved!");
}

// close settings modal if clicked outside of it 
window.onclick = function (event) {
    if (event.target == settings_modal) {
        closeSettingsModal()
    } else if (event.target == loadTags_modal) {
        closeLoadTagsModal()
    }
}

// Set up autosave
startAutoSave(autosaveDelay);
