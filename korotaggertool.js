document.addEventListener("keydown", (e) => {
    // console.log((e.ctrlKey || e.metaKey), e.shiftKey, e.key);
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key == 'z') {
        redo();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key == 'z') {
        undo();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key == 's') {
        download();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key == 'n') {
        addNewTag();
        e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key == 's') {
        handleSaveButton();
        e.preventDefault();
    }/*else if ((e.ctrlKey || e.metaKey) && e.key == 'y') {
        redo();
        e.preventDefault();
    }*/
});
const convert_button = document.getElementById("convert");
const kt_radio = document.getElementById("ktradio");
const yt_radio = document.getElementById("ytradio");
const addbutton = document.getElementById("addbutton");
const input_textarea = document.getElementById("input");
const output_textarea = document.getElementById("output");
const videoid_input = document.getElementById("videoinput");
const videoidinput_form = document.getElementById("videoinputform");
const timedisplay = document.getElementById("timedisplay");
const videotime_form = document.getElementById("videotimeform");
const backonesecond = document.getElementById("backonesecond");
const forwardonesecond = document.getElementById("forwardonesecond");
const taglistcontainer = document.getElementById("taglistcontainer");
const undobutton = document.getElementById("undobutton");
const redobutton = document.getElementById("redobutton");
const filename_input = document.getElementById("filenameinput");
const status_span = document.getElementById("status");

let player;
let tagsJson = loadTagsFromStorage();

if (tagsJson === undefined || tagsJson === null || tagsJson.length === 0) {
    // Initalize tag list to have 1 item to make it look good
    tagsJson = [];
    addNewTag();
} else {
    // console.log(tagsJson);
    newHistory(tagsJson);
    renderTagList();

    const output = renderPreferred(tagsJson);
    output_textarea.value = output;

    const videoUrl = loadActiveVideofromStorage();
    // const videoid = getIdFromUrl(tagsJson[0].text);
    if (videoUrl !== null) {
        videoid_input.value = videoUrl;
    }
    const filename = loadTagFilenameFromLocalStorage();
    if (filename !== null) {
        filename_input.value = filename;
    }
}

convert_button.onclick = ev => {
    if (yt_radio.checked) {
        tagsJson = parseTags(input_textarea.value, parseSingleTagYTCommentTag);
    } else {
        tagsJson = parseTags(input_textarea.value);
    }
    loadVideoFromTags(tagsJson);
    newHistory(tagsJson);
    renderTagList();
    const output = renderPreferred(tagsJson);
    output_textarea.value = output;
};

addbutton.onclick = addNewTag;

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

backonesecond.onclick = ev => {
    let newtime = getVideoTime() - 1;
    if (newtime < 0) {
        newtime = 0;
    }
    timedisplay.value = secondsToTimestamp(newtime);
    player.seekTo(newtime, true);
}

forwardonesecond.onclick = ev => {
    let newtime = getVideoTime() + 1;
    timedisplay.value = secondsToTimestamp(newtime);
    player.seekTo(newtime, true);
}

undobutton.onclick = undo;

redobutton.onclick = redo;

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
    if (event.data == YT.PlayerState.PLAYING && !secondsUpdateInterval) {
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
    }
}

function loadVideoFromUrl(url) {
    loadVideo(getIdFromUrl(url));
}

function loadVideo(id) {
    player.loadVideoById(id);

    setTimeout(() => {
        const videodata = player.getVideoData();
        console.log(videodata);
        filename_input.value = videodata.title + " - " + videodata.author + ".txt";
    }, 1000);
}

function stopVideo() {
    player.pauseVideo();
}

function getVideoTime() {
    return Math.floor(player.getCurrentTime());
}

function updateVideoTimeDisplay() {
    timedisplay.value = secondsToTimestamp(getVideoTime());
}

function updateTagsWithHistory(newTagJson) {
    addToHistory(newTagJson);
    tagsJson = newTagJson;
}

function renderTagList(scrollPosition) {
    const tags = renderTags(
        tagsJson,
        scrollPosition,
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
            const output = renderPreferred(tagsJson);
            output_textarea.value = output;
        },
        (time) => player.seekTo(time)
    );
    taglistcontainer.innerHTML = "";
    taglistcontainer.appendChild(tags);
    tags.scrollTop = scrollPosition;
}

function addNewTag() {
    tagsJson.unshift({
        "text": "",
        "time": null
    })
    addToHistory(tagsJson);
    renderTagList();
}

function undo() {
    const newstate = goBackInHistory();
    if (newstate !== null) {
        tagsJson = newstate;
        renderTagList(taglistcontainer.children[0].scrollTop);
        const output = renderPreferred(tagsJson);
        output_textarea.value = output;
    }
}

function redo() {
    const newstate = goForwardInHistory();
    if (newstate !== null) {
        tagsJson = newstate;
        renderTagList(taglistcontainer.children[0].scrollTop);
        const output = renderPreferred(tagsJson);
        output_textarea.value = output;
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

const autosaveInterval = setInterval(autoSave, 5000);
status_span.innerText = "Autosave on in 5s intervals."
