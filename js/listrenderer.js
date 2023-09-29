function renderTags(tags, scrollPosition, tagChangeCallback, videoTimeUpdateCallback) {
    /**
     * tags: Tags (see below for format)
     * tagChangeCallback: A callback that is called when the tags are updated and need to be rerendered. 
     *  Takes two args: new tags and current scroll position.
     * 
     * ~~Note: some of the callbacks in the rendered list WILL mutate the tags array~~ (not anymore with naive deepcopy)
     */
    /* Tags are of format
        {
            "text": "tag text",
            "time": <time in seconds>,
            "bannedwords": [<banned words>] or undefined
        }
    */

    // console.log("Scrollposition", scrollPosition);

    // TODO: more efficient way of making a deep copy maybe
    tags = JSON.parse(JSON.stringify(tags));

    tags.sort((a, b) => {
        const diff = a.time - b.time;
        if (isNaN(diff) || a.time === null || b.time === null) {
            return 0;
        }
        return diff;
    });

    const ol = document.createElement("ol");
    ol.className = "tagslist";
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        const row = document.createElement("li");
        row.className = "tagrow";

        const jumptobutton = document.createElement("button");
        jumptobutton.onclick = ev => {
            if (!isNaN(tag.time) && tag.time !== null) {
                videoTimeUpdateCallback(tag.time);
            }
        }
        jumptobutton.innerText = (i + 1) + ".";
        jumptobutton.className = "jumptobutton";

        const title = document.createElement("input");
        title.value = tag.text;
        title.size = 50;
        title.className = "tagtitle";
        title.addEventListener("change", (ev) => {
            tags[i].text = title.value;
            tagChangeCallback(tags, ol.scrollTop);
        });

        // ├ └ and ─

        const boxVerticalRightCharacter = "├";
        const boxUpRightCharacter = "└";
        const boxHorizontalCharacter = "─";

        const boxVerticalRightButton = document.createElement("button");
        boxVerticalRightButton.innerText = boxVerticalRightCharacter;
        boxVerticalRightButton.onclick = ev => {
            title.value = boxVerticalRightCharacter + title.value;
        }

        const boxUpRightButton = document.createElement("button");
        boxUpRightButton.innerText = boxUpRightCharacter;
        boxUpRightButton.onclick = ev => {
            title.value = boxUpRightCharacter + title.value;
        }


        const boxHorizontalButton = document.createElement("button");
        boxHorizontalButton.innerText = boxHorizontalCharacter;
        boxHorizontalButton.onclick = ev => {
            title.value = boxHorizontalCharacter + title.value;
        }

        const time = document.createElement("input");
        if (!isNaN(tag.time) && tag.time !== null) {
            time.value = secondsToTimestamp(tag.time);
        }
        time.className = "tagtime";
        time.size = 8;
        time.addEventListener("change", (ev) => {
            let seconds = smartTimestampToSeconds(time.value);
            if (isNaN(seconds)) {
                seconds = null;
            }
            tags[i].time = seconds;
            tagChangeCallback(tags, ol.scrollTop);
        });

        const syncbutton = document.createElement("button");
        syncbutton.onclick = ev => {
            // This tight coupling to methods defined on the HTML page feels wrong...
            const videoTime = getVideoTime();
            time.value = secondsToTimestamp(videoTime);
            tags[i].time = videoTime;
            tagChangeCallback(tags, ol.scrollTop);
        }
        syncbutton.innerText = "Sync with Player";

        const deletebutton = document.createElement("button");
        deletebutton.onclick = ev => {
            tags[i] = null;
            const newTags = tags.filter(it => it !== null);
            tagChangeCallback(newTags, ol.scrollTop);
        }
        deletebutton.innerText = "X";

        const infobutton = document.createElement("button");
        infobutton.innerText = "i";
        if (tag.bannedwords !== undefined && tag.bannedwords !== null && tag.bannedwords.length > 0) {
            infobutton.style.background = "red";
            infobutton.style.color = "white";
            infobutton.onclick = ev => {
                let bannedwords = "";
                for (let i = 0; i < tag.bannedwords.length; i++) {
                    bannedwords += "- " + tag.bannedwords[i] + "\n";
                }
                alert("Banned words are:\n" + bannedwords);
            }
        } else {
            infobutton.disabled = true;
        }

        row.appendChild(jumptobutton);
        row.appendChild(title);
        row.appendChild(time);
        row.appendChild(syncbutton);
        row.appendChild(boxVerticalRightButton);
        row.appendChild(boxUpRightButton);
        row.appendChild(boxHorizontalButton);
        row.appendChild(deletebutton);
        row.appendChild(infobutton);

        // todo: allow creating new tag at current time (currently only creates a new, empty tag)

        ol.appendChild(row);
    }
    return ol;
}

function renderedListToJSON(renderedTags) {
    // ol must be the root NOT the div
    const tags = [];
    for (let i = 0; i < renderedTags.children.length; i++) {
        const li = renderedTags.children[i];
        let time = li.children[1].value;
        if (isNaN(time)) {
            time = null;
        }
        tags.push({
            "text": li.children[0].value,
            "time": time
        });
    }
}