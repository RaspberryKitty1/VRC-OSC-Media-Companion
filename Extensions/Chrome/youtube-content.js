let socket;
let lastPausedSent = false;
let lastURL = location.href;

function waitForElement(selectors, timeout = 3000) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  const interval = 100;
  let elapsed = 0;
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      for (const selector of selectorArray) {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
          return;
        }
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}

async function getYouTubeInfo() {
  if (location.pathname !== "/watch") {
    return {
      title: null,
      uploader: null,
      duration: 0,
      currentTime: 0,
      playing: false,
      live: false,
    };
  }

  const info = {};
  const titleEl = await waitForElement([
    "h1.title yt-formatted-string",
    "h1.title.style-scope.ytd-video-primary-info-renderer",
  ]);
  info.title = titleEl ? titleEl.textContent.trim() : null;

  const channelEl = await waitForElement([
    "#owner #channel-name a",
    "ytd-video-owner-renderer #text a",
  ]);
  info.uploader = channelEl ? channelEl.textContent.trim() : null;

  const video = document.querySelector("video");
  info.currentTime = video ? video.currentTime : 0;

  const liveBadge = document.querySelector("yt-live-badge-renderer");

  const viewCountEl = document.querySelector("#info-container #view-count");
  const aria = viewCountEl ? viewCountEl.getAttribute("aria-label") : "";
  const watchingNow = aria && aria.toLowerCase().includes("watching now");

  info.live = !!(liveBadge || watchingNow);

  info.duration = info.live ? null : video ? video.duration : 0;
  info.playing = video ? !video.paused && !video.ended : false;

  return info;
}

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:12345");

  socket.onopen = () => {
    console.log(
      "%c[MediaInfo]%c WebSocket connected.",
      "color: blue; font-weight: bold;",
      ""
    );

    setInterval(async () => {
      if (location.href !== lastURL) {
        lastURL = location.href;
        lastPausedSent = false;
        console.log(
          "%c[MediaInfo]%c URL changed:",
          "color: blue; font-weight: bold;",
          "",
          lastURL
        );
      }

      const info = await getYouTubeInfo();

      if (!info.title || !info.uploader) return;

      const payload = {
        title: info.title,
        uploader: info.uploader,
        duration: info.duration || 0,
        currentTime: info.currentTime || 0,
        playing: info.playing,
        live: info.live,
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
    console.warn(
      "%c[MediaInfo]%c WebSocket error:",
      "color: blue; font-weight: bold;",
      "",
      err
    );
  };

  socket.onclose = () => {
    console.log(
      "%c[MediaInfo]%c WebSocket closed. Reconnecting in 5s...",
      "color: blue; font-weight: bold;",
      ""
    );
    setTimeout(connectWebSocket, 5000);
  };
}

window.addEventListener("beforeunload", () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
});

connectWebSocket();
