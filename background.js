// Serialize updates so viewing sessions in different tabs cannot overwrite each other.
let watchTimeUpdates = Promise.resolve();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== 'addWatchTime' || !sender.tab ||
        !/^[a-z0-9_]+$/.test(message.channel) ||
        !Number.isFinite(message.milliseconds) || message.milliseconds <= 0) {
        return;
    }

    const key = `watchTime_${message.channel}`;
    watchTimeUpdates = watchTimeUpdates.then(async () => {
        const result = await chrome.storage.local.get(key);
        const total = (Number(result[key]) || 0) + message.milliseconds;
        await chrome.storage.local.set({ [key]: total });
        sendResponse({ total });
    }).catch(() => sendResponse({ error: true }));
    return true;
});
