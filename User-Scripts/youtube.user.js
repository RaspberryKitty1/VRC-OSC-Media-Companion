// ==UserScript==
// @name         YouTube Media Info WebSocket Sender
// @namespace    https://github.com/RaspberryKitty1/VRC-OSC-Media-Companion
// @version      1.1.3
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
  let pollTimer = null;
  let reconnectTimer = null;
  let lastPausedSent = false;
  let lastURL = location.href;

  function log(msg, ...args) {
    console.log(
      "%c[MediaInfo]%c " + msg,
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

  function isLiveStream(video) {
    const timeDisplay = document.querySelector(".ytp-time-display");
    if (timeDisplay) {
      return timeDisplay.classList.contains("ytp-live");
    }

    // Fallback if .ytp-time-display is not yet rendered
    if (video && !Number.isFinite(video.duration)) {
      return true;
    }

    return false;
  }

  function cleanTitle(rawTitle) {
    if (!rawTitle) return null;
    return rawTitle.replace(/\s*-\s*YouTube$/i, "").trim() || null;
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

    const titleEl = await waitForElement([
      "h1.ytd-watch-metadata yt-formatted-string",
      "h1.title yt-formatted-string",
      "h1.ytd-video-primary-info-renderer",
    ]);

    const uploaderEl = await waitForElement([
      "#owner #channel-name a",
      "ytd-watch-metadata ytd-channel-name a",
      "ytd-channel-name a",
    ]);

    const video = document.querySelector("video");
    const live = isLiveStream(video);

    const rawTitle = titleEl ? titleEl.textContent : document.title;
    const title = cleanTitle(rawTitle);
    const uploader = uploaderEl ? uploaderEl.textContent.trim() : null;

    const rawCurrentTime = video ? video.currentTime : 0;
    const currentTime = Number.isFinite(rawCurrentTime) ? rawCurrentTime : 0;

    const rawDuration = video ? video.duration : 0;
    const duration =
      !live && Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 0;

    const playing = video ? !video.paused && !video.ended : false;

    return {
      title,
      uploader,
      duration,
      currentTime,
      playing,
      live,
    };
  }

  async function tick() {
    if (location.href !== lastURL) {
      lastURL = location.href;
      lastPausedSent = false;
      log("URL changed:", lastURL);
    }

    if (location.pathname !== "/watch") {
      lastPausedSent = false;
      return;
    }

    const info = await getYouTubeInfo();
    if (!info.title || !info.uploader) return;

    const payload = {
      title: info.title,
      uploader: info.uploader,
      duration: info.duration,
      currentTime: info.currentTime,
      playing: info.playing,
      live: info.live,
    };

    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    if (payload.playing) {
      lastPausedSent = false;
      socket.send(JSON.stringify(payload));
    } else if (!lastPausedSent) {
      socket.send(JSON.stringify(payload));
      lastPausedSent = true;
    }
  }

  function startPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
    }
    pollTimer = setInterval(tick, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function connectWebSocket() {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      log("WebSocket connected.");
      startPolling();
      tick();
    };

    socket.onclose = () => {
      stopPolling();
      log(`WebSocket closed. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
      reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      // onclose fires right after onerror and handles reconnect scheduling
    };
  }

  connectWebSocket();
})();
