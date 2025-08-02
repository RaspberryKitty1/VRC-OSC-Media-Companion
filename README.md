# 🧩 YouTube + Twitch Playback to VRChat (Browser Extension)

This browser extension sends **real-time YouTube and Twitch playback info** (title, current time, duration, or stream uptime) to a local WebSocket server, enabling your live media info to appear in **VRChat** via OSC. It enhances your VRChat chatbox with dynamic media overlays.

🎯 Compatible with [VRChat Spotify + System Stats Chatbox Integration](https://github.com/raspberryKitty1/VRC_Chatbox_OSC).

---

## 🎯 Purpose

This extension allows your currently playing **YouTube video** or **Twitch stream** to be displayed in VRChat’s OSC chatbox overlay—just like Spotify and system stats—by sending real-time playback data to a local server.

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

---

## 🌐 Requirements

* **Browser**:

  * ✅ Firefox (Manifest V3)
  * ✅ Chromium-based (Chrome, Edge, Brave, Opera)

* **VRChat Tray App** with WebSocket listener enabled

* **Local WebSocket server** listening on:

```bash
ws://localhost:12345
```

> ℹ️ The VRChat tray app receives this data and pushes it into VRChat chatbox via OSC.

---

## 📥 Installation Guide

### 🔥 Firefox & Chromium-Based Browsers

1. Visit the [Releases Page](https://github.com/RaspberryKitty1/Youtube-Copy-Clean-Url/releases).

2. For **Firefox**, download the `.xpi` file and click **“Add”** when prompted.

3. For **Chromium browsers**:

   * Go to `chrome://extensions/`
   * Enable **Developer Mode**
   * Download the ZIP release
   * Extract to a permanent folder
   * Click **“Load unpacked”** and select the folder

4. ✅ Done! The extension will auto-detect and send YouTube or Twitch playback data.

---

## 🔌 VRChat Integration Instructions

1. Launch the **VRChat Tray App**.
2. Set the tray mode to `media` or `full`.
3. Open a YouTube video or Twitch stream.
4. Playback info will appear in your VRChat chatbox in real-time.

---

## 🛠️ Troubleshooting

If playback info doesn’t appear in VRChat or shows incorrect uploader info:

* Ensure the video or stream is actively playing and the browser tab is focused/active.
* Reload or refresh the YouTube/Twitch tab to reset content script data.
* Sometimes the uploader or streamer name may not load correctly on first connection; reloading the page usually fixes this.
* Verify the **VRChat Tray App** is running.
* Confirm the Tray App mode is set to `media` or `full` depending on your usage.
* Check your firewall or antivirus isn’t blocking local WebSocket connections at `ws://localhost:12345`.
* If problems persist, restart the Tray App and your browser.

---

## 🧪 Development Notes

* Uses **Manifest V3**
* Content scripts are isolated for each platform:

  * `youtube-content.js` for YouTube
  * `twitch-content.js` for Twitch
* Sends JSON data to the local WebSocket server
* Open source — issues and PRs are welcome!

---

## 📜 License

Licensed under the [MIT License](LICENSE).
