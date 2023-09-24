function parse_timestamp(timestamp) {
    /** 
     * Note: this doesn't handle some malformed strings, like 1h1h1h1h or 1s1h1m
     * All this does is takes each sequence and sums it up
     * 
     * Note 2: This seems to be how YouTube is handling it, so whatever.
     */
    let total = 0;

    if (timestamp.length == 0) {
        console.log("Malformed timestamp " + timestamp);
        return undefined;
    }
    let buffer = [];
    for (let i = 0; i < timestamp.length; i++) {
        if (!isNaN(timestamp[i])) {
            buffer.push(timestamp[i]);
        } else {
            if (buffer.length == 0) {
                console.log("Malformed timestamp " + timestamp);
                return undefined;
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
                    console.log("Malformed timestamp " + timestamp);
                    return timestamp;
            }
            buffer = [];
        }
    }
    return total;
}


function parseSingleTagKorotagger(tag) {
    const elements = tag.split(" ");
    const timestamp_raw = elements[elements.length - 1];
    const tag_text = elements.slice(0, elements.length - 1).join(" ");
    const timestamp = parse_timestamp(timestamp_raw);

    if (!isNaN(timestamp)) {
        return {
            "text": tag_text,
            "time": timestamp
        };
    } else {
        return {
            "text": tag,
            "time": undefined
        }
    }
}


function parseTags(input) {
    const tags = [];
    const split_input = input.replace(/\r/g, "").split(/\n/);
    return split_input.map(parseSingleTagKorotagger);//.filter(val => typeof val.time == "number");
}


function renderPreferred(tags_json) {
    const tags_rendered = tags_json.map(val => {
        if (isNaN(val.time)) {
            return val.text;
        }
        const timestamp = new Date(val.time * 1000).toISOString().slice(11, 19);
        return timestamp + " " + val.text;
    })
    return tags_rendered.join("\n");
}