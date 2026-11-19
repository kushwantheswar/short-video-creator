# ⚡ Apex Shorts AI — Advanced 9:16 Shorts & Reels Studio

![License](https://img.shields.io/badge/license-MIT-red.svg)
![Vercel](https://img.shields.io/badge/deploy-ready%20for%20vercel-black?logo=vercel)
![Style](https://img.shields.io/badge/theme-Red%20%7C%20Black%20%7C%20Platinum-ff1e42.svg)
![Format](https://img.shields.io/badge/format-9%3A16%20Vertical-gold.svg)

> Transform any long video or video link into viral 9:16 vertical **YouTube Shorts**, **Instagram Reels**, and **TikToks** with automatic word-by-word karaoke captions, smart speaker cropping, split-screen viral motion, high-retention hooks, and high-bitrate export.

---

## ✨ Features & Capabilities

### 🎥 1. Video Link & Multi-Source Ingestion
- **Direct Video Links**: Paste any direct video URL (`.mp4`, `.webm`, `.mov`, `.m3u8`, Cloudflare Stream, AWS S3, Firebase, Dropbox/Drive direct stream) and load it directly into the 9:16 Canvas rendering engine with zero local upload needed.
- **YouTube Link Mode**: Plan clips, preview timestamps, generate captions and social copy from any YouTube URL.
- **Local File Upload**: Drag-and-drop or select any MP4, WebM, MOV, or MKV file. All processing happens 100% privately in your browser with hardware acceleration.
- **Demo Showcase Clips**: 4 curated 1-click test videos (Podcasts, Tech Keynote, Fast Action, Nature 4K) so you can test every studio feature instantly.
- **Direct Screen & Cam Recording**: Record your screen, window, or webcam right inside the studio.

### 📐 2. High-Quality 9:16 Vertical Video Studio
- **Smart Framing Modes**:
  - **Smart Crop (Fill)**: Converts 16:9 widescreen to 9:16 with smooth horizontal speaker pan (Left, Center, Right presets + custom slider) and zoom scaling.
  - **Frosted Glass Blur (Fit)**: Fits the full widescreen video centered over an animated, luxury blurred background with vignette and shadow.
  - **Viral Split-Screen**: Top 50% main speaker + Bottom 50% engaging viral motion / b-roll simulation (the #1 viral format on TikTok & Reels!).
  - **Cinema Letterbox**: Clean bordered framing with crimson gradient accents.
- **Export Formats & Bitrates**:
  - `720p HD` (720 × 1280)
  - `1080p FHD` (1080 × 1920) — Crystal-clear standard
  - `4K Ultra` (2160 × 3840) — Maximum quality
  - **30 FPS / 60 FPS** high-framerate toggle with bitrates up to 14 Mbps for zero compression artifacts.
- **Cinematic Color Grading**:
  - Normal, Cyber Crimson (Electric Red saturation), TikTok Vibrant Pop, Golden Hour Warmth, Noir Monochrome, and Cyberpunk.

### 💬 3. Automatic Word-by-Word Captions & Subtitles
- **⚡ Auto-Generate Captions**: Generates synchronized, word-by-word karaoke subtitles mapped to audio timing with 1 click.
- **🎤 In-Browser Voice Recognition**: Live voice-to-text transcription using the Web Speech API.
- **🤖 Whisper AI Cloud Integration**: Optional Groq / OpenAI Whisper API support for millisecond-precision word timestamps.
- **Viral Caption Animation Styles**:
  - **Alex Hormozi Style**: Bold uppercase with active words bouncing and glowing in Hyper Gold (`#fbbf24`) or Electric Crimson (`#ff1e42`).
  - **TikTok Pop**: Translucent background pill with active word highlighted in red.
  - **Beast Yellow**: High-contrast yellow text with thick black outline.
  - **Cyber Red**: Glowing neon red font with drop shadow.
  - **Minimalist**: Clean sans-serif with subtle indicator.
- **Subtitles Import & Export**: Full `.srt` and `.vtt` file import and export.
- **Emoji Auto-Tagging**: Contextual emojis (🔥, 💰, 🤯, 🚀, ⚡, 🏆) injected automatically into subtitles.

### ⚡ 4. High-Retention Viral Hooks & Sound FX
- **Scroll-Stopping Hooks**: 12+ built-in high-retention hooks (*"WAIT FOR IT... 🤯"*, *"STOP SCROLLING RIGHT NOW 🛑"*, *"THE SECRET NOBODY REVEALS 💎"*).
- **Viral Sound Effects**: Built-in Web Audio soundboard with Fast Whoosh, Bell Ding, and 808 Sub Bass Drop.
- **Audio Booster**: Clean volume gain from 100% to 200%.

### 🎨 5. Luxury Red, Black & Platinum Theme
- **Obsidian Carbon Black** (`#08080a`, `#0e0e12`, `#14141a`)
- **Electric Crimson Flame** (`#ff1e42`, `#ff3b5c`, glowing red aura)
- **Platinum Silver / White & Hyper Amber Gold** (`#ffffff`, `#f8fafc`, `#fbbf24`)
- Glassmorphism frosted panels, smooth custom controls, and celebratory confetti upon export.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/kushwantheswar/short-video-creator.git
cd short-video-creator

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 Deploy to Vercel (Zero-Config)

### Option 1: 1-Click Import from GitHub
1. Push this repository to GitHub: `https://github.com/kushwantheswar/short-video-creator.git`
2. Open [Vercel Dashboard](https://vercel.com/new).
3. Select your `short-video-creator` GitHub repository.
4. Framework Preset: **Vite** (auto-detected).
5. Click **Deploy**!

`vercel.json` is already configured with SPA rewrites and CORS headers.

---

## ⌨️ Studio Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play or Pause Video |
| `N` | Create New Clip at current playhead |
| `I` | Set Start point (IN) for active clip |
| `O` | Set End point (OUT) for active clip |
| `←` / `→` | Seek 1.0 second backward or forward |
| `Shift + ←` / `Shift + →` | Seek 0.1s frame-by-frame precision |

---

## 📦 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navbar, resolution/FPS picker, modes
│   │   ├── LinkBar.jsx         # Video link ingestion & demo chips
│   │   ├── VideoStage.jsx      # 9:16 Canvas monitor & transport
│   │   ├── Timeline.jsx        # Multi-clip interactive timeline
│   │   ├── CaptionEditor.jsx   # Auto captions, karaoke editor, SRT I/O
│   │   ├── Inspector.jsx       # 4-tab inspector: Framing, Captions, Hooks, Export
│   │   ├── ClipBin.jsx         # Clip list, auto-plan generator, bulk export
│   │   └── ShortcutsModal.jsx  # Keyboard shortcuts guide
│   ├── lib/
│   │   ├── captions.js         # Speech recognition, AI cues, SRT parser
│   │   ├── clips.js            # Clip models, hooks, hashtag presets
│   │   ├── draw.js             # 9:16 Canvas rendering & animation engine
│   │   ├── media.js            # MediaRecorder export, Web Audio effects
│   │   ├── samples.js          # Curated demo video streams
│   │   └── youtube.js          # YouTube IFrame API & metadata fetcher
│   ├── App.jsx                 # Master application controller & CSS theme
│   └── main.jsx                # React DOM entrypoint
├── vercel.json                 # Vercel deployment configuration
├── package.json
└── vite.config.js
```

---

## 📄 License

MIT © [kushwantheswar](https://github.com/kushwantheswar)
