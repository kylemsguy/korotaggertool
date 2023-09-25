function renderTags(tags) {
    /* Tags are of format
        {
            "text": "tag text",
            "time": <time in seconds>
        }
    */

    tags.sort((a, b) => {
        const diff = a.time - b.time;
        if (isNaN(diff) || a.time === null || b.time === null) {
            return 0;
        }
        return diff;
    });

    const ol = document.createElement("ol");
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        const row = document.createElement("li");
        row.className = "tagrow";

        const title = document.createElement("input");
        title.value = tag.text;
        title.size = 50;

        row.appendChild(title);

        const time = document.createElement("input");
        if (!isNaN(tag.time) && tag.time !== null){
            time.value = secondsToTimestamp(tag.time);
        }
        time.className = "time";
        row.appendChild(time);

        // todo: re-sort list when times are changed
        // todo: add delete button
        // todo: add button to sync tag with current time
        // todo: add undo button (implement naively--store a stack of past JSON's)
        // todo: add redo button
        // todo: figure out how best to do auto-save (maybe when timestamps are consistent do an auto-save?)
        // todo: allow creating new tag at current time

        ol.appendChild(row);
    }
    return ol;
}

function renderedListToJSON(renderedTags) {
    // ol must be the root NOT the div
    const tags = [];
    for(let i = 0; i < renderedTags.children.length; i++) {
        const li = renderedTags.children[i];
        let time = li.children[1].value;
        if (isNaN(time)){
            time = null;
        }
        tags.push({
            "text": li.children[0].value,
            "time": time
        });
    }
}