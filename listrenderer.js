function renderTags(tags) {
    /* Tags are of format
        {
            "text": "tag text",
            "time": <time in seconds>
        }
    */

    tags.sort((a, b) => {
        const diff = a.time - b.time;
        if (isNaN(diff)) {
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
        if (!isNaN(tag.time)){
            time.value = secondsToTimestamp(tag.time);
        }
        time.className = "time";
        row.appendChild(time);

        ol.appendChild(row);
    }
    return ol;
}