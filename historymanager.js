// For now, history is only in-memory, so if your program crashes, bye bye history
// Maybe consider saving a few steps of history?
// Defining helpers here should make things a bit easier to update later anyways.

const history = [];
let currentHistoryIndex = -1;

function addToHistory(tags) {
    const newState = JSON.parse(JSON.stringify(tags));
    history.length = currentHistoryIndex + 1;
    history.push(newState);
    currentHistoryIndex = history.length - 1;
}

function goBackInHistory() {
    if (currentHistoryIndex > 0) {
        return history[--currentHistoryIndex];
    }
    return null;
}

function goForwardInHistory() {
    if (currentHistoryIndex + 1 < history.length) {
        return history[++currentHistoryIndex];
    }
    return null;
}

function newHistory(tags) {
    clearHistory();
    addToHistory(tags);
}

function clearHistory() {
    history.length = 0;
    currentHistoryIndex = -1;
}
