const BANNED_WORDS_KEY = "bannedwords";
const BANNED_REGEX_KEY = "bannedregexps";

const defaultBannedWords = [
    "parasocial",
    "pilk",
    "flat",
    "hentai",
    "death's door",
    "X's head",
    "red",
    "covid",
    "message",
    "mic",
    "american",
    "mom",
    "mother",
    "cutting board",
    "cleared",
    "pettan",
    "twitter",
    "tiktok",
    "job",
    "ban",
    "irl",
    "grandma",
    "nudity"
];

const defaultBannedRegExps = [{ "regex": "#\\w+", "description": "Hashtags (e.g. #esketit, but # esketit is fine)" }];

let bannedWords = [];
let bannedRegExps = [];

function loadBannedWordsFromLocalStorage() {
    const storedBannedWords = window.localStorage.getItem(BANNED_WORDS_KEY);
    const storedBannedRegExps = window.localStorage.getItem(BANNED_REGEX_KEY);

    try {
        bannedWords = JSON.parse(storedBannedWords);
        bannedRegExps = JSON.parse(storedBannedRegExps);
    } catch {
        console.log("Invalid stored bannedWords/RegExps");
    }

    if (bannedWords === null || bannedRegExps === null) {
        // If no custom banned words were stored, load defaults
        bannedWords = defaultBannedWords;
        bannedRegExps = defaultBannedRegExps;
    }
}

function saveBannedWordsToLocalStorage() {
    window.localStorage.setItem(BANNED_WORDS_KEY, JSON.stringify(bannedWords));
    window.localStorage.setItem(BANNED_REGEX_KEY, JSON.stringify(bannedRegExps));
}

function checkStringForBannedRegExps(str) {
    /**
     * Checks a string for a banned word regexp
     * 
     * Returns an array of descriptions of what was detected.
     * Make sure the descriptions are clear in what is wrong.
     */
    const foundBannedRegExps = [];
    for (let i = 0; i < bannedRegExps.length; i++) {
        const bannedregex = new RegExp(bannedRegExps[i].regex);
        const result = str.toLowerCase().search(bannedregex);
        if (result != -1) {
            foundBannedRegExps.push(bannedRegExps[i].description);
        }
    }
    return foundBannedRegExps;
}

function checkStringForBannedWords(str) {
    /**
     * Checks a string for a banned word
     * 
     * Current potential limitations: Does not flag stuff like 
     * "amer ican" if "american" is a banned word
     * 
     * Also probably won't flag anything on non-English words
     * Really breaking any i18n rules here like it's the 1990's.
     */
    const foundBannedWords = [];
    for (let i = 0; i < bannedWords.length; i++) {
        const bannedword = bannedWords[i];
        const result = str.toLowerCase().search(bannedword);
        if (result != -1) {
            if ((result === 0 || str[result - 1] === " ") &&
                (result + bannedword.length === str.length || str[result + bannedword.length] === " ")) {
                foundBannedWords.push(bannedword);
            }
        }
    }
    return foundBannedWords;
}

function sanityCheckString(str) {
    return checkStringForBannedWords(str).concat(checkStringForBannedRegExps(str));
}


// TODO: perhaps return a separate array instead of mutating the tags list directly
function sanityCheckTags(tags) {
    /**
     * Adds a new field called "bannedwords" to each tag, with any banned words
     */
    for (let i = 0; i < tags.length; i++) {
        tags[i].bannedwords = sanityCheckString(tags[i].text);
    }
}

function clearSanityCheckErrors(tags) {
    /**
     * Clears the sanity check errors
     */
    tags.map(it => delete it.bannedwords);
}