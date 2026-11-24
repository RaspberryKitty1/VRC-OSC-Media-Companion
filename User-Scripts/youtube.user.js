// ==UserScript==
// @name         YouTube Media Info WebSocket Sender
// @namespace    https://github.com/RaspberryKitty1/VRC-OSC-Media-Companion
// @version      1.1.2
// @description  Sends YouTube video or livestream info to localhost WebSocket server
// @author       raspberryKitty1
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js
// @downloadURL  https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const WS_URL = "ws://localhost:12345";
  const POLL_INTERVAL_MS = 2000;
  const RECONNECT_DELAY_MS = 5000;

  let socket = null;
  let lastPausedSent = false;
  let lastURL = location.href;
  let reconnectTimer = null;

  function log(message, ...args) {
    console.log(
      "%c[MediaInfo]%c " + message,
      "color: blue; font-weight: bold;",
      "",
      ...args
    );
  }

  function waitForElement(selectors, timeout = 3000) {
    const arr = Array.isArray(selectors) ? selectors : [selectors];
    const interval = 100;
    let elapsed = 0;

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        for (const sel of arr) {
          const el = document.querySelector(sel);
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

    // Updated selectors for modern YouTube titles
    const titleEl = await waitForElement([
      "h1.style-scope.ytd-watch-metadata yt-formatted-string",
      "h1.ytd-watch-metadata",
      "h1.title yt-formatted-string",
      "h1.ytd-video-primary-info-renderer",
    ]);
    info.title = titleEl ? titleEl.textContent.trim() : document.title.replace(/\s*-\s*YouTube$/i, "").trim();

    // Updated selectors for channel names / uploaders
    const uploaderEl = await waitForElement([
      "ytd-channel-name#owner yt-formatted-string#text a",
      "#owner #channel-name a",
      "ytd-channel-name a",
      "#upload-info #channel-name a",
    ]);
    info.uploader = uploaderEl ? uploaderEl.textContent.trim() : null;

    const video = document.querySelector("video");
    info.currentTime = video && Number.isFinite(video.currentTime) ? video.currentTime : 0;

    // Live detection checking player live class, badges, and watch metadata text
    const hasLivePlayerClass = Boolean(document.querySelector(".ytp-time-display.ytp-live"));
    const hasLiveBadge = Boolean(
      document.querySelector(
        "yt-live-badge-renderer, ytd-badge-supported-renderer.badge[aria-label*='LIVE' i], .ytp-live-badge"
      )
    );
    const infoText = document.querySelector("#info-container, ytd-watch-metadata")?.textContent?.toLowerCase() ?? "";
    const hasStreamingText = /\b(live now|started streaming|streaming live)\b/.test(infoText);
    const hasInfiniteDuration = Boolean(
      video && Number.isFinite(video.currentTime) && !Number.isFinite(video.duration)
    );

    info.live = hasLivePlayerClass || hasLiveBadge || hasStreamingText || hasInfiniteDuration;
    info.duration = info.live ? null : (video && Number.isFinite(video.duration) ? video.duration : 0);
    info.playing = Boolean(video && !video.paused && !video.ended);

    return info;
  }

  function startPollLoop() {
    setInterval(async () => {
      if (location.href !== lastURL) {
        lastURL = location.href;
        lastPausedSent = false;
        log("URL changed:", lastURL);
      }

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      const info = await getYouTubeInfo();
      if (!info.title || !info.uploader) {
        return;
      }

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
        socket.send(JSON.stringify(payload));
      } else if (!lastPausedSent) {
        socket.send(JSON.stringify(payload));
        lastPausedSent = true;
      }
    }, POLL_INTERVAL_MS);
  }

  function connectWebSocket() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      log("WebSocket connected.");
    };

    socket.onclose = () => {
      log("WebSocket closed. Reconnecting in 5s...");
      reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      // onclose fires right after onerror and handles reconnection
    };
  }

  startPollLoop();
  connectWebSocket();
})();