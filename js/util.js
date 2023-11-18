function parseUrlTimestamp(timestamp) {
    /** 
     * Parses timestamp of form XXhYYmZZs (e.g. 1h22m33s)
     * 
     * Note: this doesn't handle some malformed strings, like 1h1h1h1h or 1s1h1m
     * All this does is takes each sequence and sums it up
     * 
     * Note 2: This seems to be how YouTube is handling it, so whatever.
     */
    let total = 0;

    if (timestamp.length === 0) {
        console.log("Malformed timestamp (empty)");
        return NaN;
    }

    if (!isNaN(timestamp)) {
        return parseInt(timestamp);
    }

    let buffer = [];
    for (let i = 0; i < timestamp.length; i++) {
        if (!isNaN(timestamp[i])) {
            buffer.push(timestamp[i]);
        } else {
            if (buffer.length === 0) {
                console.log("Malformed timestamp <" + timestamp + ">");
                return NaN;
            }

            const toAdd = parseInt(buffer.join(""));
            switch (timestamp[i]) {
                case 'h':
                    total += toAdd * 3600;
                    break;
                case 'm':
                    total += toAdd * 60;
                    break;
                case 's':
                    total += toAdd;
                    break;
                default:
                    console.log("Malformed timestamp <" + timestamp + ">");
                    return NaN;
            }
            buffer = [];
        }
    }

    if (buffer.length > 0) {
        return NaN;
    }
    return total;
}


function parseSingleTagKorotagger(tag) {
    const elements = tag.split(" ");
    const timestamp_raw = elements[elements.length - 1];
    const tag_text = elements.slice(0, elements.length - 1).join(" ");
    const timestamp = parseUrlTimestamp(timestamp_raw);

    if (!isNaN(timestamp)) {
        return {
            "text": tag_text,
            "time": timestamp
        };
    } else {
        return {
            "text": tag,
            "time": null
        }
    }
}


function parseSingleTagYTCommentTag(tag) {
    const elements = tag.split(" ");
    console.log(elements);
    const timestamp_raw = elements[0];
    const tag_text = elements.slice(1, elements.length).join(" ");
    const timestamp = timestampToSeconds(timestamp_raw);

    if (!isNaN(timestamp)) {
        return {
            "text": tag_text,
            "time": timestamp
        };
    } else {
        return {
            "text": tag,
            "time": null
        }
    }
}


function parseTags(input, parser) {
    const split_input = input.replace(/\r/g, "").split(/\n/);
    if (parser === undefined) {
        parser = parseSingleTagKorotagger;
    }
    return split_input.map(parser);
}

function secondsToTimestamp(seconds, padHours) {
    if (isNaN(seconds)) {
        return NaN;
    }
    const timestamp = new Date(seconds * 1000).toISOString().slice(11, 19);
    if (padHours !== true && seconds < 3600) {
        return timestamp.split(":").slice(1).join(":");
    }
    return timestamp;
}

function timestampToSeconds(timestamp) {
    const split_timestamp = timestamp.split(':');
    let seconds = 0;
    for (let i = 0; i < split_timestamp.length; i++) {
        seconds = seconds * 60 + parseInt(split_timestamp[i]);
    }
    return seconds;
};

function smartTimestampToSeconds(timestamp) {
    /**
     * Attempts to parse the timestamp in both YT comment and URL forms.
     * Returns NaN if parsing fails.
     */
    let seconds = timestampToSeconds(timestamp);
    if (isNaN(seconds)) {
        seconds = parseUrlTimestamp(timestamp);
    }
    return seconds;
}

function renderPreferred(tagsJson, padHours) {
    const tagsRendered = tagsJson.map(val => {
        if (isNaN(val.time) || val.time === null) {
            return val.text;
        }
        const timestamp = secondsToTimestamp(val.time, padHours);
        return timestamp + " " + val.text;
    })
    return tagsRendered.join("\n");
}

function getIdFromUrl(url) {
    const ytregex1 = /youtube.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const ytregex2 = /youtube.com\/live\/([a-zA-Z0-9_-]+)/;
    const ytregex3 = /youtu.be\/([a-zA-Z0-9_-]+)/;

    const match1 = url.match(ytregex1);
    if (match1 != null) {
        return match1[1];
    }
    const match2 = url.match(ytregex2);
    if (match2 != null) {
        return match2[1];
    }
    const match3 = url.match(ytregex3);
    if (match3 != null) {
        return match3[1];
    }
    return null;
}

function loadTagsFromStorage() {
    try {
        return JSON.parse(window.localStorage.getItem("currentTags"));
    } catch (e) {
        console.log(e);
        return null;
    }
}

function arrayToNewlineSeparated(array) {
    return array.join("\n");
}

function newlineSeparatedToArray(string) {
    return string.split("\n")
}

function saveTagsToStorage(tags) {
    window.localStorage.setItem("currentTags", JSON.stringify(tags));
}

function loadActiveVideofromStorage() {
    return window.localStorage.getItem("currentVideo");
}

function saveActiveVideoToStorage(url) {
    window.localStorage.setItem("currentVideo", url);
}

function loadTagFilenameFromLocalStorage() {
    return window.localStorage.getItem("tagFileName");
}

function saveTagFilenameToLocalStorage(filename) {
    window.localStorage.setItem("tagFileName", filename);
}

function getAutosaveDelayFromLocalStorage() {
    const delay = window.localStorage.getItem("autosaveDelay");
    if (delay === undefined || delay === null) {
        return 5;
    }
    return parseInt(delay);
}

function saveAutosaveDelayToLocalStorage(delay) {
    window.localStorage.setItem("autosaveDelay", delay);
}