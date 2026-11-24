# 🧩 Vrchat Compainion Scripts

This project provides userscripts that send **real-time YouTube and Twitch playback info** (title, current time, duration, or stream uptime) to a local WebSocket server. This enables your live media info to appear in **VRChat** via OSC, enhancing your VRChat chatbox with dynamic media overlays.

🎯 Compatible with [VRChat Spotify + System Stats Chatbox Integration](https://github.com/raspberryKitty1/VRC_Chatbox_OSC).

---

## 🎯 Purpose

Display your currently playing **YouTube video** or **Twitch stream** playback info inside VRChat’s OSC chatbox overlay—just like Spotify and system stats—by sending real-time playback data to a local WebSocket server.

---

## 🔧 Features

✅ **Detects currently playing video or stream** on:

* YouTube
* Twitch

✅ Sends real-time updates every 2 seconds:

**For YouTube:**

* Video title
* Uploader name
* Current playback position
* Total duration

**For Twitch:**

* Stream title
* Channel name
* Uptime since stream started
* Live status (always `true` if live)

✅ Twitch uptime parsed from native Twitch stream timer (accurate to seconds)

✅ Automatically reconnects if the WebSocket server restarts

✅ Available as lightweight userscripts via Tampermonkey or similar managers

---

## 🌐 Requirements

* **Browser**:
* ✅ Any browser supporting userscript managers like Tampermonkey (Chrome, Firefox, Edge, Brave, Opera, etc.)

* **VRChat Tray App** with WebSocket listener enabled
* **Local WebSocket server** listening on:

```bash
ws://localhost:12345

```

> ℹ️ The VRChat tray app receives this data and pushes it into VRChat chatbox via OSC.

---

## 📥 Installation Guide

### 🖥️ Userscripts

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Click the raw links below to install the appropriate script:

* [YouTube userscript](https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js)
* [Twitch userscript](https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/twitch.user.js)

1. ✅ Done! The userscripts will auto-detect and send YouTube or Twitch playback data on supported sites.

---

## 🔌 VRChat Integration Instructions

1. Launch the **VRChat Tray App**.
2. Set the tray mode to `media` or `full`.
3. Open a YouTube video or Twitch stream.
4. Playback info will appear in your VRChat chatbox in real-time.

---

## 🛠️ Troubleshooting

If playback info doesn’t appear or shows incorrect uploader info:

* Ensure the video or stream is actively playing and the browser tab is focused/active.
* Reload or refresh the YouTube/Twitch tab to reset userscript data.
* Sometimes the uploader or streamer name may not load correctly on first connection; reloading the page usually fixes this.
* Verify the **VRChat Tray App** is running.
* Confirm the Tray App mode is set to `media` or `full` depending on your usage.
* Check your firewall or antivirus isn’t blocking local WebSocket connections at `ws://localhost:12345`.
* If problems persist, restart the Tray App and your browser.

---

## 🧪 Development Notes

* Scripts are isolated per platform:
* `youtube.user.js` for YouTube
* `twitch.user.js` for Twitch

* Sends JSON data to the local WebSocket server
* Open source — issues and PRs welcome!

---

## 📜 License

Licensed under the [MIT License](LICENSE).
