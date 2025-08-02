let socket;
let lastPausedSent = false;

function getYouTubeTitle() {
    const titleElem = document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer") ||
                      document.querySelector("h1.ytd-watch-metadata");
    return titleElem ? titleElem.textContent.trim() : document.title;
}

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:12345");

    socket.onopen = () => {
        console.log("[MediaInfo] WebSocket connected.");
        setInterval(() => {
            const video = document.querySelector("video");
            if (!video) return;

            if (!video.paused && !video.ended) {
                lastPausedSent = false; // Reset pause flag
                const payload = {
                    title: getYouTubeTitle(),
                    duration: video.duration || 0,
                    currentTime: video.currentTime || 0,
                    playing: true
                };

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(payload));
                }
            } else if (!lastPausedSent) {
                // Send one-time paused message
                const payload = {
                    title: getYouTubeTitle(),
                    duration: video.duration || 0,
                    currentTime: video.currentTime || 0,
                    playing: false
                };

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

connectWebSocket();
