// ==UserScript==
// @name         Twitch Media Info WebSocket Sender
// @namespace    https://github.com/RaspberryKitty1/VRC-OSC-Media-Companion
// @version      1.0.0
// @description  Sends Twitch stream info via WebSocket to localhost server
// @author       raspberryKitty1
// @match        https://www.twitch.tv/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/twitch.user.js
// @downloadURL  https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/twitch.user.js
// ==/UserScript==

(function () {
    'use strict';

    let socket;
    let lastPausedSent = false;
    let lastURL = location.href;

    function getTwitchInfo() {
        const info = {};

        // Streamer username from URL path
        const urlMatch = window.location.pathname.match(/^\/([^\/]+)/);
        info.streamer = urlMatch ? urlMatch[1].toLowerCase() : null;

        // Stream title
        const titleEl = document.querySelector('[data-a-target="stream-title"]');
        info.title = titleEl ? titleEl.textContent.trim() : null;

        // Video element
        const video = document.querySelector('video');
        if (video) {
            info.currentPosition = video.currentTime;
            const fakeLiveDuration = 9223372036854.775;
            info.totalDuration = (video.duration && video.duration < fakeLiveDuration) ? video.duration : null;
        } else {
            info.currentPosition = null;
            info.totalDuration = null;
        }

        const liveIndicator = Array.from(document.querySelectorAll('div')).find(el => el.className.includes('tw-channel-status-text-indicator'));
        const liveTextFromIndicator = liveIndicator ? liveIndicator.textContent.trim().toLowerCase() : "";
        const isLiveTextPresent = liveTextFromIndicator === 'live';

        const spans = Array.from(document.querySelectorAll('span'));
        const liveSpan = spans.find(el => el.textContent.trim().toLowerCase() === 'live');

        const durationLooksLive = video && video.duration >= 1e12;
        const hasValidDuration = info.totalDuration !== null && !isNaN(info.totalDuration);

        info.live = (!hasValidDuration && (!!liveSpan || durationLooksLive || isLiveTextPresent)) || false;

        const uptimeEl = document.querySelector('.live-time p');
        info.uptime = uptimeEl ? uptimeEl.textContent.trim().split(' ')[0] : null;

        info.timeToUse = info.live ? (info.uptime || null) : (info.currentPosition || null);

        info.playing = video ? (!video.paused && !video.ended) : false;

        return info;
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

                const info = getTwitchInfo();
                if (!info.title) return;

                const payload = {
                    streamer: info.streamer,
                    title: info.title,
                    duration: info.totalDuration || 0,
                    currentTime: info.currentPosition || 0,
                    playing: info.playing,
                    live: info.live,
                    uptime: info.uptime || null,
                    timeToUse: info.timeToUse
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
