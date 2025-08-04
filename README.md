# 🧩 YouTube + Twitch Playback to VRChat

This project provides browser extensions and userscripts that send **real-time YouTube and Twitch playback info** (title, current time, duration, or stream uptime) to a local WebSocket server. This enables your live media info to appear in **VRChat** via OSC, enhancing your VRChat chatbox with dynamic media overlays.

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

✅ Compatible with **Firefox** and **Chromium-based browsers** using Manifest V3

✅ Userscripts versions available for quick, lightweight install via Tampermonkey or similar

---

## 🌐 Requirements

* **Browser**:

  * ✅ Firefox (Manifest V3)  
  * ✅ Chromium-based (Chrome, Edge, Brave, Opera)  
  * ✅ Any browser supporting userscripts managers like Tampermonkey

* **VRChat Tray App** with WebSocket listener enabled

* **Local WebSocket server** listening on:

```bash
ws://localhost:12345
```

> ℹ️ The VRChat tray app receives this data and pushes it into VRChat chatbox via OSC.

---

## 📥 Installation Guide

### 🔥 Browser Extensions (Recommended for best performance)

1. Visit the [Releases Page](https://github.com/RaspberryKitty1/Youtube-Copy-Clean-Url/releases).

2. **For Firefox**:

   * Download the `.xpi` file
   * Open it and click **“Add”** when prompted

3. **For Chromium browsers**:

   * Go to `chrome://extensions/`
   * Enable **Developer Mode**
   * Download the ZIP release
   * Extract to a permanent folder
   * Click **“Load unpacked”** and select the folder

4. ✅ Done! The extension will auto-detect and send YouTube or Twitch playback data.

---

### 🖥️ Userscripts (Lightweight, easy install)

1. Install a userscript manager extension such as [Tampermonkey](https://www.tampermonkey.net/).

2. Click the raw links below to install the appropriate script:

   * [YouTube userscript](https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/youtube.user.js)
   * [Twitch userscript](https://raw.githubusercontent.com/RaspberryKitty1/VRC-OSC-Media-Companion/main/User-Scripts/Twitch.user.js)

3. ✅ Userscripts will inject the playback info sender on supported sites without needing a full extension install.

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
* Reload or refresh the YouTube/Twitch tab to reset content script data.
* Sometimes the uploader or streamer name may not load correctly on first connection; reloading the page usually fixes this.
* Verify the **VRChat Tray App** is running.
* Confirm the Tray App mode is set to `media` or `full` depending on your usage.
* Check your firewall or antivirus isn’t blocking local WebSocket connections at `ws://localhost:12345`.
* If problems persist, restart the Tray App and your browser.

---

## 🧪 Development Notes

* Uses **Manifest V3** for browser extensions

* Content scripts are isolated per platform:

  * `youtube-content.js` for YouTube
  * `twitch-content.js` for Twitch

* Sends JSON data to the local WebSocket server

* Userscripts are full-featured but lighter alternatives

* Open source — issues and PRs welcome!

---

## 📜 License

Licensed under the [MIT License](LICENSE).

