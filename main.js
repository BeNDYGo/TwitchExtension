function getChannelName() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return (parts[0] || '').toLowerCase();
}

let watchChannel = '';
let watchTotal = 0;
let pendingWatchTime = 0;
let lastWatchTick = performance.now();
let wasPlaying = false;
let lastWatchSave = lastWatchTick;

function formatWatchTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 3600)} ч ${String(Math.floor(seconds / 60) % 60).padStart(2, '0')} мин ${String(seconds % 60).padStart(2, '0')} с`;
}

function updateWatchDisplay() {
    const display = document.getElementById('watch-time');
    const block = document.getElementById('custom-check-div');
    if (display && block.dataset.channel === watchChannel) {
        const text = formatWatchTime(watchTotal + pendingWatchTime);
        if (display.textContent !== text) display.textContent = text;
    }
}

function saveWatchTime() {
    if (!watchChannel || pendingWatchTime <= 0) return;
    const channel = watchChannel;
    const milliseconds = pendingWatchTime;
    pendingWatchTime = 0;
    watchTotal += milliseconds;
    chrome.runtime.sendMessage({ type: 'addWatchTime', channel, milliseconds }, (response) => {
        if (chrome.runtime.lastError || !response || response.error) {
            if (channel === watchChannel) {
                watchTotal -= milliseconds;
                pendingWatchTime += milliseconds;
            }
            return;
        }
        // Storage is authoritative and also includes any other open viewing tabs.
        if (channel === watchChannel) {
            watchTotal = response.total;
            updateWatchDisplay();
        }
    });
}

function tickWatchTime() {
    const now = performance.now();
    const channel = getChannelName();
    const channelChanged = channel !== watchChannel;
    if (wasPlaying) pendingWatchTime += Math.max(0, now - lastWatchTick);
    lastWatchTick = now;

    if (channelChanged) {
        saveWatchTime();
        watchChannel = channel;
        watchTotal = 0;
        pendingWatchTime = 0;
        const key = `watchTime_${channel}`;
        chrome.storage.local.get(key, (result) => {
            if (watchChannel === channel) {
                watchTotal = Number(result[key]) || 0;
                updateWatchDisplay();
            }
        });
    }

    const isChannelPage = /^\/[a-z0-9_]+\/?$/i.test(window.location.pathname);
    // Twitch can replace its player or keep inactive video/ad elements in the DOM.
    // Read the current playback state every tick instead of latching a waiting event.
    wasPlaying = isChannelPage && Array.from(document.querySelectorAll('video')).some(
        (video) => !video.paused && !video.ended && video.readyState >= 2
    );
    if (now - lastWatchSave >= 5000 || !wasPlaying) {
        saveWatchTime();
        lastWatchSave = now;
    }
    updateWatchDisplay();
}

function saveVisitTime(channel) {
    const now = new Date();
    const key = `lastVisit_${channel}`;
    chrome.storage.local.get(key, (result) => {
        let history = result[key] || [];
        const today = `${now.getDate()}.${now.getMonth()}.${now.getFullYear()}`;

        if (history.length > 0) {
            const lastEntry = new Date(history[0]);
            const lastDay = `${lastEntry.getDate()}.${lastEntry.getMonth()}.${lastEntry.getFullYear()}`;
            if (lastDay === today) {
                history[0] = now.toISOString();
                chrome.storage.local.set({ [key]: history });
                return;
            }
        }

        history.unshift(now.toISOString());
        if (history.length > 3) history.pop();
        chrome.storage.local.set({ [key]: history });
    });
}

function getVisitTime(channel) {
    return new Promise((resolve) => {
        const key = `lastVisit_${channel}`;
        chrome.storage.local.get(key, (result) => {
            resolve(result[key] || []);
        });
    });
}

function formatVisitTime(isoString) {
    const date = new Date(isoString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function CreatetrackerBlock() {
    const div = document.createElement('div');
    div.id = 'custom-check-div';
    div.dataset.channel = getChannelName();

    const tracker_button = document.createElement('tracker_button');
    tracker_button.textContent = 'Twitch Tracker';
    tracker_button.className = 'tracker-btn';
    tracker_button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hostname = 'twitchtracker.com';
        const channelName = getChannelName();
        url.pathname = `/${channelName}/streams`;
        window.open(url.toString());
    });
    div.appendChild(tracker_button);

    const sullygnome_button = document.createElement('sullygnome_button');
    sullygnome_button.textContent = 'Sullygnome';
    sullygnome_button.className = 'tracker-btn';
    sullygnome_button.addEventListener('click', () => {
        const channelName = getChannelName();
        const url = new URL(window.location.href);
        url.hostname = 'sullygnome.com';
        url.pathname = `/channel/${channelName}`;
        window.open(url.toString());
    });
    div.appendChild(sullygnome_button);

    const timeDetails = document.createElement('div');
    timeDetails.id = 'time-details';
    const watchDisplay = document.createElement('div');
    watchDisplay.id = 'watch-time';
    watchDisplay.textContent = formatWatchTime(watchTotal + pendingWatchTime);
    timeDetails.appendChild(watchDisplay);
    const timeDisplay = document.createElement('div');
    timeDisplay.id = 'visit-history';
    timeDetails.appendChild(timeDisplay);
    div.appendChild(timeDetails);

    return div;
}

function TwitchScript() {
    const channel = getChannelName();
    const panel = document.querySelector('[class*="about-section__panel"]');
    if (!panel) return;
    saveVisitTime(channel);

    const TrackerDiv = CreatetrackerBlock();
    panel.appendChild(TrackerDiv);
    console.log('добавлен div');

    getVisitTime(channel).then((history) => {
        const container = TrackerDiv.querySelector('#visit-history');
        history.forEach((iso) => {
            const line = document.createElement('div');
            line.className = 'visit-entry';
            line.textContent = formatVisitTime(iso);
            container.appendChild(line);
        });
    });
}

const observer = new MutationObserver(() => {
    const block = document.getElementById('custom-check-div');
    if (block && block.dataset.channel !== getChannelName()) block.remove();
    if (!document.getElementById('custom-check-div')) {
        TwitchScript();
        console.log('начало работы')
    }
});

observer.observe(document.body, { childList: true, subtree: true });
tickWatchTime();
TwitchScript();
setInterval(tickWatchTime, 1000);
// Capture playback transitions immediately instead of charging a whole paused second.
['play', 'pause', 'ended', 'waiting', 'playing', 'emptied'].forEach((event) => {
    document.addEventListener(event, (notification) => {
        if (notification.target.tagName !== 'VIDEO') return;
        tickWatchTime();
    }, true);
});
window.addEventListener('pagehide', () => {
    tickWatchTime();
    saveWatchTime();
    wasPlaying = false;
});
