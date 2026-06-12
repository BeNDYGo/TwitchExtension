function getChannelName() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[0] || '';
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

    const tracker_button = document.createElement('tracker_button');
    tracker_button.textContent = 'Twitch Tracker';
    tracker_button.className = 'tracker-btn';
    tracker_button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hostname = 'twitchtracker.com';
        url.pathname += '/streams';
        window.open(url.toString());
    });
    div.appendChild(tracker_button);

    const sullygnome_button = document.createElement('sullygnome_button');
    sullygnome_button.textContent = 'Sullygnome';
    sullygnome_button.className = 'tracker-btn';
    sullygnome_button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hostname = 'sullygnome.com';
        const channelName = url.pathname.split('/').pop();
        url.pathname = `/channel/${channelName}`;
        window.open(url.toString());
    });
    div.appendChild(sullygnome_button);

    const timeDisplay = document.createElement('div');
    timeDisplay.id = 'visit-history';
    div.appendChild(timeDisplay);

    return div;
}

function TwitchScript() {
    const channel = getChannelName();
    saveVisitTime(channel);

    const panel = document.querySelector('[class*="about-section__panel"]');
    if (!panel) return;

    const TrackerDiv = CreatetrackerBlock();
    panel.appendChild(TrackerDiv);
    console.log('добавлен div');

    getVisitTime(channel).then((history) => {
        const container = document.getElementById('visit-history');
        history.forEach((iso) => {
            const line = document.createElement('div');
            line.className = 'visit-entry';
            line.textContent = formatVisitTime(iso);
            container.appendChild(line);
        });
    });
}

const observer = new MutationObserver(() => {
    if (!document.getElementById('custom-check-div')) {
        TwitchScript();
        console.log('начало работы')
    }
});

observer.observe(document.body, { childList: true, subtree: true });
