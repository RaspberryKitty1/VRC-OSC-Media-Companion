# 🧩 YouTube Playback to VRChat (Browser Extension)

This browser extension sends **real-time YouTube playback info** (title, current time, duration) to a local WebSocket server, enabling your live YouTube video info to appear in **VRChat** via OSC. It enhances your VRChat chatbox with dynamic YouTube playback details.

🎯 Compatible with [VRChat Spotify + System Stats Chatbox Integration](https://github.com/raspberryKitty1/VRC_Chatbox_OSC).

---

## 🎯 Purpose

This extension allows your currently playing YouTube video to be displayed in VRChat’s OSC chatbox overlay—just like Spotify and system stats—by sending real-time playback data.

---

## 🔧 Features

✅ Detects the currently playing YouTube video

✅ Sends this data every 2 seconds while playing:

* Video title
* Current playback time
* Total duration
* Video Uploader

> [!NOTE]
>
> The total duration may be inaccurate for livestreams.  
> I attempted to detect livestreams but it wasn’t working reliably, so I left it as-is.

✅ Sends a one-time update when the video is paused or stopped

✅ Automatically reconnects if the WebSocket server restarts

✅ Fully compatible with Firefox and Chromium-based browsers (Chrome, Edge, Brave, Opera) using Manifest V3

---

## 🌐 Requirements

* **Browser**:

  * ✅ Firefox (Manifest V3)
  * ✅ Chromium-based browsers (Chrome, Edge, Brave, Opera) (Manifest V3)

* **VRChat Tray App** with WebSocket listener enabled

* **Local WebSocket server** listening on:

```bash
ws://localhost:12345
```

> ℹ️ The VRChat tray app receives this data and pushes it into VRChat chatbox via OSC.

---

## 📥 Installation Guide

### 🔥 Firefox & Chromium-Based Browsers (Stable Support)

1. Visit the [Releases Page](https://github.com/RaspberryKitty1/Youtube-Copy-Clean-Url/releases).
2. For Firefox, download the `.xpi` file and click **“Add”** when prompted.
3. For Chromium-based browsers:

   * Open the **Extensions page** (`chrome://extensions/` or equivalent).
   * Enable **Developer Mode** (top-right toggle).
   * Download the latest ZIP from the releases.
   * Extract the ZIP to a permanent folder.
   * Click **“Load unpacked”** and select the extracted folder.
4. ✅ Done! The extension will automatically send YouTube playback data.

---

## 🔌 VRChat Integration Instructions

1. Run the **VRChat tray app**.
2. Set its mode to `youtube` using the tray icon menu.
3. Open and play a YouTube video in your browser.
4. Your VRChat chatbox will show live video info automatically!

---

## 🛠️ Troubleshooting

If you don’t see YouTube info in VRChat:

* Make sure the YouTube video tab is active and playing.
* Pause and play the video again to trigger updates.
* Reload the YouTube tab.
* Verify your firewall isn’t blocking local WebSocket (`ws://localhost:12345`).
* Confirm the VRChat tray app is running and in `youtube` or `full` mode.

---

## 🧪 Development Notes

* Uses Manifest V3 for Firefox and Chromium.
* Content script runs on YouTube pages, sends playback data to local WebSocket.
* Open source and welcomes contributions! Please submit issues or PRs.

---

## 📜 License

Licensed under the [MIT License](LICENSE).


