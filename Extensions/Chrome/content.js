let socket;
let lastPausedSent = false;
let lastURL = location.href;

function getYouTubeTitle() {
    const titleElem =
        document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer") ||
        document.querySelector("h1.ytd-watch-metadata");
    return titleElem ? titleElem.textContent.trim() : document.title;
}

function getUploaderName() {
    const uploaderElem = document.querySelector("ytd-channel-name yt-formatted-string a");
    return uploaderElem?.textContent.trim() || null;
}

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:12345");

    socket.onopen = () => {
        console.log("[MediaInfo] WebSocket connected.");

        setInterval(() => {
            if (location.href !== lastURL) {
                lastURL = location.href;
                lastPausedSent = false;
                console.log("[MediaInfo] URL changed:", lastURL);
            }

            const video = document.querySelector("video");
            if (!video) return;

            const payload = {
                title: getYouTubeTitle(),
                uploader: getUploaderName(),
                duration: video.duration || 0,
                currentTime: video.currentTime || 0,
                playing: !video.paused && !video.ended
            };

            if (payload.playing) {
                lastPausedSent = false;
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(payload));
                }
            } else if (!lastPausedSent) {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(payload));
                    lastPausedSent = true;
                }
            }
        }, 2000);
    };

    socket.onerror = (err) => {
        console.warn("[MediaInfo] WebSocket error:", err);
    };

    socket.onclose = () => {
        console.log("[MediaInfo] WebSocket closed. Reconnecting in 5s...");
        setTimeout(connectWebSocket, 5000);
    };
}

window.addEventListener("beforeunload", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});

connectWebSocket();
