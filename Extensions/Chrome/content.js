let socket = null;
let lastPausedSent = false;

function getYouTubeTitle() {
  const titleElem = document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer") ||
                    document.querySelector("h1.ytd-watch-metadata");
  return titleElem ? titleElem.textContent.trim() : document.title;
}

function sendVideoData(video, isPlaying) {
  const payload = {
    title: getYouTubeTitle(),
    duration: video.duration || 0,
    currentTime: video.currentTime || 0,
    playing: isPlaying
  };

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function startTracking() {
  setInterval(() => {
    const video = document.querySelector("video");
    if (!video) return;

    if (!video.paused && !video.ended) {
      lastPausedSent = false;
      sendVideoData(video, true);
    } else if (!lastPausedSent) {
      sendVideoData(video, false);
      lastPausedSent = true;
    }
  }, 2000);
}

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:12345");

  socket.addEventListener("open", () => {
    console.log("[MediaInfo] WebSocket connected.");
    startTracking();
  });

  socket.addEventListener("error", (err) => {
    console.warn("[MediaInfo] WebSocket error:", err);
  });

  socket.addEventListener("close", () => {
    console.warn("[MediaInfo] WebSocket closed. Retrying in 5 seconds...");
    setTimeout(connectWebSocket, 5000);
  });
}

// Start the connection
connectWebSocket();
