// ==UserScript==
// @name         YouTube Media Info WebSocket Sender
// @namespace    https://github.com/RaspberryKitty1/VRC-OSC-Media-Companion
// @version      1.0.0
// @description  Sends YouTube video or livestream info to localhost WebSocket server
// @author       raspberryKitty1
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js
// @downloadURL  https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js
// ==/UserScript==

(function () {
  'use strict';

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
    const info = {};

    const channelEl = await waitForElement([
      '#text-container > yt-formatted-string',
      '#channel-name yt-formatted-string',
      'ytd-channel-name a',
      '#channel-name a',
      'ytd-video-owner-renderer #text a'
    ]);
    info.uploader = channelEl ? channelEl.textContent.trim() : null;

    const titleEl = await waitForElement([
      'h1.title yt-formatted-string',
      'h1.title.style-scope.ytd-video-primary-info-renderer'
    ]);
    info.title = titleEl ? titleEl.textContent.trim() : document.title;

    const video = document.querySelector('video');
    info.currentTime = video ? video.currentTime : 0;

    const viewCountEl = document.querySelector('#info-container #view-count');
    const ariaLabel = viewCountEl ? viewCountEl.getAttribute('aria-label') : '';
    const isLiveWatchingNow = ariaLabel && ariaLabel.toLowerCase().includes('watching now');

    const liveBadge = document.querySelector('yt-live-badge-renderer, .yt-live-badge-renderer');
    const infoStrings = document.querySelector('#info-strings');
    const liveNowText = infoStrings ? infoStrings.textContent.toLowerCase() : '';
    const hasLiveNowText = liveNowText.includes('live now');

    info.live = !!(isLiveWatchingNow || liveBadge || hasLiveNowText);

    info.duration = info.live ? null : (video ? video.duration : 0);
    info.playing = video ? (!video.paused && !video.ended) : false;

    return info;
  }

  function connectWebSocket() {
    socket = new WebSocket("ws://localhost:12345");

    socket.onopen = () => {
      console.log("[MediaInfo] WebSocket connected.");

      setInterval(async () => {
        if (location.href !== lastURL) {
          lastURL = location.href;
          lastPausedSent = false;
          console.log("[MediaInfo] URL changed:", lastURL);
        }

        const info = await getYouTubeInfo();
        if (!info.title) return;

        const payload = {
          title: info.title,
          uploader: info.uploader,
          duration: info.duration || 0,
          currentTime: info.currentTime || 0,
          playing: info.playing,
          live: info.live
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
})();
