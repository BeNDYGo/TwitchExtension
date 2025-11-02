function CreatetrackerBlock() {
    const div = document.createElement('div');
    div.id = 'custom-check-div';
    div.style.display = 'flex';
    //div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.padding = '5px 10px 5px 50px';
    div.style.border = '2px solid #18181b';
    div.style.borderRadius = '10px';
    div.style.marginTop = '10px';
    div.style.background = '#0e0e10';

    const tracker_button = document.createElement('tracker_button');
    tracker_button.textContent = 'Twitch Tracker';
    tracker_button.style.background = '#2A3440';
    tracker_button.style.color = '#ffffffff';
    tracker_button.style.border = '2px solid #444f5cff';
    tracker_button.style.borderRadius = '10px';
    tracker_button.style.padding = '6px 12px';
    tracker_button.style.fontSize = '10px';
    tracker_button.style.fontWeight = '500';
    tracker_button.style.cursor = 'pointer';
    tracker_button.style.transition = 'all 0.25s ease';
    tracker_button.style.margin = '10px';
    tracker_button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';

    tracker_button.addEventListener('mouseover', () => {
        tracker_button.style.transform = 'scale(1.07)';
    });
    tracker_button.addEventListener('mouseout', () => {
        tracker_button.style.transform = 'scale(1)';
    });
    tracker_button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hostname = 'twitchtracker.com';
        url.pathname += '/streams';
        window.open(url.toString());
    });
    div.appendChild(tracker_button);

    const sullygnome_button = document.createElement('sullygnome_button');
    sullygnome_button.textContent = 'Sullygnome';
    sullygnome_button.style.background = '#2A3440';
    sullygnome_button.style.color = '#ffffffff';
    sullygnome_button.style.border = '2px solid #444f5cff';
    sullygnome_button.style.borderRadius = '10px';
    sullygnome_button.style.padding = '6px 12px';
    sullygnome_button.style.fontSize = '10px';
    sullygnome_button.style.fontWeight = '500';
    sullygnome_button.style.cursor = 'pointer';
    sullygnome_button.style.transition = 'all 0.25s ease';
    sullygnome_button.style.margin = '10px';
    sullygnome_button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';

    sullygnome_button.addEventListener('mouseover', () => {
        sullygnome_button.style.transform = 'scale(1.07)';
    });
    sullygnome_button.addEventListener('mouseout', () => {
        sullygnome_button.style.transform = 'scale(1)';
    });
    sullygnome_button.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hostname = 'sullygnome.com';
        const channelName = url.pathname.split('/').pop();
        url.pathname = `/channel/${channelName}`;
        window.open(url.toString());
    });
    div.appendChild(sullygnome_button);

    return div;
}

function TwitchScript() {
    const DescriptionDiv = document.querySelector('[aria-label="Сведения о трансляции"]');
    const PredInfoDiv = DescriptionDiv.querySelector('div');
    const InfoDiv = PredInfoDiv.querySelector('div'); 

    const TrackerDiv = CreatetrackerBlock();
    InfoDiv.appendChild(TrackerDiv);
    console.log('добавлен div');
}

const observer = new MutationObserver(() => {
    if (!document.getElementById('custom-check-div')) {
        TwitchScript();
        console.log('начало работы')
    }
});

observer.observe(document.body, { childList: true, subtree: true });
