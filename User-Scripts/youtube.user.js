// ==UserScript==
// @name         YouTube Media Info WebSocket Sender
// @namespace    https://github.com/RaspberryKitty1/VRC-OSC-Media-Companion
// @version      1.1.1
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

  let socket;
  let lastPausedSent = false;
  let lastURL = location.href;

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

    const titleEl = await waitForElement([
      "h1.style-scope.ytd-watch-metadata yt-formatted-string",
      "h1.ytd-watch-metadata",
      "h1.title yt-formatted-string",
      "h1.ytd-video-primary-info-renderer",
    ]);
    info.title = titleEl ? titleEl.textContent.trim() : document.title;

    const uploaderEl = await waitForElement([
      "ytd-channel-name#owner yt-formatted-string#text a",
      "#owner #channel-name a",
      "ytd-channel-name a",
      "#upload-info #channel-name a"
    ]);
    info.uploader = uploaderEl ? uploaderEl.textContent.trim() : null;

    const video = document.querySelector("video");
    info.currentTime = video ? video.currentTime : 0;

    const liveBadge = document.querySelector(
      "yt-live-badge-renderer, ytd-badge-supported-renderer.badge.style-scope.ytd-watch-metadata [aria-label*='LIVE'], .ytp-live-badge, #info-container yt-formatted-string[id='info']"
    );
    const isLiveText = document.querySelector("#info-container")?.textContent?.toLowerCase().includes("streaming");
    
    info.live = !!liveBadge || isLiveText || (video && !Number.isFinite(video.duration));

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

    socket.onclose = () => {
      console.log(
        "%c[MediaInfo]%c WebSocket closed. Reconnecting in 5s...",
        "color: blue; font-weight: bold;",
        ""
      );
      setTimeout(connectWebSocket, 5000);
    };
  }

  connectWebSocket();
})();