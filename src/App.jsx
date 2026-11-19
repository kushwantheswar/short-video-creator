import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header.jsx';
import LinkBar from './components/LinkBar.jsx';
import Timeline from './components/Timeline.jsx';
import VideoStage from './components/VideoStage.jsx';
import Inspector from './components/Inspector.jsx';
import ClipBin from './components/ClipBin.jsx';
import ShortcutsModal from './components/ShortcutsModal.jsx';
import DownloadModal from './components/DownloadModal.jsx';

import { drawFrame } from './lib/draw.js';
import { ensureAudio, setAudioGain, recordClip, recordDirectStream, saveFile, playSoundEffect } from './lib/media.js';
import { loadYT } from './lib/youtube.js';
import {
  fmt,
  clamp,
  slug,
  newClip,
  postText,
  parseYouTubeId,
  isDirectVideoUrl,
  autoPlan,
  captionsText,
  VIRAL_HOOKS,
} from './lib/clips.js';
import { SAMPLE_VIDEOS } from './lib/samples.js';

const STUDIO_CSS = `
:root {
  --bg-deep: #08080a;
  --bg-panel: #0e0e13;
  --bg-card: #14141a;
  --bg-card-hover: #1c1c24;
  --bg-input: #101015;
  --crimson: #ff1e42;
  --crimson-hover: #ff3b5c;
  --crimson-glow: rgba(255, 30, 66, 0.38);
  --crimson-border: rgba(255, 30, 66, 0.22);
  --crimson-subtle: rgba(255, 30, 66, 0.08);
  --white: #ffffff;
  --platinum: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --gold: #fbbf24;
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(255, 255, 255, 0.14);
  --font-display: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: var(--bg-deep) !important;
  background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 30, 66, 0.15), transparent 70%),
    radial-gradient(circle at 90% 80%, rgba(251, 191, 36, 0.04), transparent 50%) !important;
  color: var(--platinum) !important;
  font-family: var(--font-body);
  font-size: 13.5px;
  line-height: 1.5;
  min-height: 100vh;
}
.studio-root {
  max-width: 1720px;
  margin: 0 auto;
  padding: 14px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100vh;
}
.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  background: rgba(14, 14, 19, 0.88);
  backdrop-filter: blur(20px);
  border: 1px solid var(--crimson-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
.brand-group { display: flex; align-items: center; gap: 12px; }
.logo-badge { display: flex; align-items: center; gap: 10px; }
.logo-flame {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, #ff1e42, #ff5975);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 0 16px var(--crimson-glow);
}
.brand-titles { display: flex; flex-direction: column; }
.brand-main {
  font-family: var(--font-display); font-weight: 900; font-size: 20px;
  letter-spacing: -0.02em; display: flex; align-items: center; gap: 4px; line-height: 1.1;
}
.brand-apex { color: #fff; }
.brand-shorts { color: var(--crimson); }
.brand-ai {
  font-size: 11px; font-weight: 800; background: var(--crimson);
  color: #fff; padding: 1px 6px; border-radius: 4px; margin-left: 2px;
}
.brand-subtitle { font-size: 11.5px; color: var(--text-dim); font-weight: 500; }
.nav-source-tabs {
  display: flex; align-items: center; background: var(--bg-card);
  border: 1px solid var(--line); padding: 3px; border-radius: var(--radius-md); gap: 2px;
}
.source-tab {
  display: flex; align-items: center; gap: 7px; padding: 7px 14px;
  border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--text-muted);
}
.source-tab:hover { color: var(--platinum); background: rgba(255, 255, 255, 0.04); }
.source-tab.active { background: var(--crimson); color: #fff; box-shadow: 0 0 12px var(--crimson-glow); }
.pulse-red { animation: pulse-dot 1.4s infinite; }
@keyframes pulse-dot { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.15); } 100% { opacity: 1; } }
.header-actions { display: flex; align-items: center; gap: 10px; }
.quality-pill {
  display: flex; align-items: center; background: var(--bg-card);
  border: 1px solid var(--line-strong); border-radius: var(--radius-md); padding: 2px 4px;
}
.quality-select {
  background: transparent; border: none; color: var(--gold);
  font-family: var(--font-mono); font-size: 12px; font-weight: 600; padding: 5px 8px; cursor: pointer;
}
.quality-select option { background: var(--bg-panel); color: var(--platinum); }
.fps-toggle {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 3px 8px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); color: var(--text-muted);
}
.fps-toggle.on { background: var(--crimson); color: #fff; }
.btn-header-download {
  display: flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #ff1e42, #ff4162); color: #fff; font-weight: 700;
  font-size: 12.5px; padding: 8px 15px; border-radius: var(--radius-md);
  box-shadow: 0 0 16px var(--crimson-glow); cursor: pointer; transition: all 0.15s ease;
}
.btn-header-download:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff3b5c, #ff1e42); box-shadow: 0 0 24px rgba(255, 30, 66, 0.7); transform: translateY(-1px);
}
.btn-header-download:disabled { opacity: 0.45; cursor: not-allowed; }
.icon-btn {
  width: 36px; height: 36px; border-radius: var(--radius-md);
  background: var(--bg-card); border: 1px solid var(--line); display: flex;
  align-items: center; justify-content: center; color: var(--text-muted);
}
.icon-btn:hover { color: var(--platinum); border-color: var(--crimson); background: var(--crimson-subtle); }
.linkbar-container {
  display: flex; flex-direction: column; gap: 10px; background: var(--bg-panel);
  border: 1px solid var(--line); padding: 12px 16px; border-radius: var(--radius-lg);
}
.linkbar-form { display: flex; gap: 10px; align-items: center; }
.linkbar-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 10px; background: var(--bg-input);
  border: 1px solid var(--line-strong); border-radius: var(--radius-md); padding: 0 14px; height: 44px;
}
.linkbar-input-wrap:focus-within { border-color: var(--crimson); box-shadow: 0 0 16px var(--crimson-glow); }
.link-icon { color: var(--crimson); flex-shrink: 0; }
.linkbar-input { flex: 1; background: transparent; border: none; color: var(--platinum); font-size: 13.5px; }
.linkbar-input::placeholder { color: var(--text-dim); }
.clear-btn, .paste-btn {
  display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted);
  padding: 4px 8px; border-radius: 6px; background: rgba(255, 255, 255, 0.05);
}
.btn-load-video {
  display: flex; align-items: center; gap: 8px; background: var(--crimson);
  color: #fff; font-weight: 700; font-size: 13.5px; padding: 0 22px; height: 44px;
  border-radius: var(--radius-md); box-shadow: 0 4px 16px var(--crimson-glow); flex-shrink: 0;
}
.btn-load-video:hover:not(:disabled) { background: var(--crimson-hover); transform: translateY(-1px); }
.samples-quick-strip { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.strip-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.sample-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sample-chip-btn {
  display: flex; align-items: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 5px 11px; border-radius: 999px; font-size: 12px; color: var(--platinum);
}
.sample-chip-btn:hover:not(:disabled) { border-color: var(--crimson); background: var(--crimson-subtle); transform: translateY(-1px); }
.chip-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--crimson); }
.chip-dur { font-family: var(--font-mono); color: var(--text-dim); font-size: 11px; }
.studio-toast {
  background: linear-gradient(90deg, #ff1e42, #990022); color: #fff; padding: 10px 18px;
  border-radius: var(--radius-md); font-weight: 600; font-size: 13px; display: flex;
  align-items: center; justify-content: center; box-shadow: 0 4px 20px var(--crimson-glow);
}
.studio-main-grid {
  display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start;
}
@media (min-width: 1080px) {
  .studio-main-grid { grid-template-columns: 290px minmax(0, 1fr) 380px; }
}
.clip-bin-panel {
  background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 16px; display: flex; flex-direction: column; gap: 14px;
}
.bin-header { display: flex; align-items: center; justify-content: space-between; }
.bin-title-group { display: flex; align-items: center; gap: 8px; }
.bin-title-group h2 {
  font-family: var(--font-display); font-size: 15px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--platinum);
}
.bin-count-badge {
  background: var(--crimson); color: #fff; font-size: 11px; font-weight: 800;
  padding: 1px 7px; border-radius: 999px; font-family: var(--font-mono);
}
.btn-add-clip-mini {
  display: flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line); padding: 5px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--platinum);
}
.btn-add-clip-mini:hover:not(:disabled) { border-color: var(--crimson); color: var(--crimson); }
.bin-list-scroll { max-height: 380px; overflow-y: auto; padding-right: 4px; }
.bin-empty-state {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 32px 14px; gap: 8px; color: var(--text-muted);
}
.clip-cards-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.clip-card-item {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--line);
  text-align: left; transition: all 0.15s ease;
}
.clip-card-item:hover { background: var(--bg-card-hover); border-color: rgba(255, 30, 66, 0.4); }
.clip-card-item.selected-card {
  border-color: var(--crimson); background: linear-gradient(90deg, rgba(255, 30, 66, 0.14), var(--bg-card));
  box-shadow: 0 0 16px rgba(255, 30, 66, 0.18);
}
.clip-card-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--text-dim); }
.clip-card-item.selected-card .clip-card-badge { color: var(--crimson); }
.clip-card-details { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.clip-card-title { font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clip-card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.clip-time-range { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-dim); }
.clip-dur-pill { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--gold); }
.clip-dur-pill.over-limit { color: #ff6b6b; }
.auto-plan-box {
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--radius-md);
  padding: 12px; display: flex; flex-direction: column; gap: 10px;
}
.auto-plan-header { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--platinum); }
.plan-selectors-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.plan-select {
  background: var(--bg-input); border: 1px solid var(--line-strong); border-radius: var(--radius-sm);
  color: var(--platinum); padding: 7px 8px; font-size: 12px; font-weight: 500;
}
.btn-generate-plan {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(255, 30, 66, 0.12); border: 1px solid var(--crimson-border);
  color: #fff; font-size: 12.5px; font-weight: 600; padding: 8px; border-radius: var(--radius-sm);
}
.btn-generate-plan:hover:not(:disabled) { background: var(--crimson); box-shadow: 0 0 14px var(--crimson-glow); }
.bin-footer-actions { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--line); padding-top: 12px; }
.btn-bulk-export {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--crimson); color: #fff; font-weight: 700; font-size: 13px;
  padding: 10px; border-radius: var(--radius-md); box-shadow: 0 4px 16px var(--crimson-glow);
}
.btn-bulk-export:hover:not(:disabled) { background: var(--crimson-hover); box-shadow: 0 0 20px rgba(255, 30, 66, 0.6); }
.io-buttons-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.btn-io-mini {
  display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 7px; border-radius: var(--radius-sm); font-size: 11.5px; color: var(--text-muted);
}
.btn-io-mini:hover:not(:disabled) { color: var(--platinum); border-color: var(--line-strong); }
.total-dur-indicator {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11.5px; font-family: var(--font-mono); color: var(--text-dim);
}
.studio-center-stage { display: flex; flex-direction: column; gap: 14px; }
.stage-panel {
  background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.dropzone-box {
  width: 100%; min-height: 480px; border: 2px dashed rgba(255, 30, 66, 0.35); border-radius: var(--radius-lg);
  background: radial-gradient(circle at 50% 50%, rgba(255, 30, 66, 0.05), transparent 70%);
  display: flex; align-items: center; justify-content: center; text-align: center; padding: 32px 20px;
}
.dropzone-inner { max-width: 440px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.dropzone-icon-ring {
  width: 68px; height: 68px; border-radius: 999px; background: rgba(255, 30, 66, 0.1);
  border: 1px solid var(--crimson-border); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px var(--crimson-glow);
}
.dropzone-inner h2 { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: #fff; }
.dropzone-inner p { font-size: 13px; color: var(--text-muted); }
.dropzone-buttons { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.btn-choose-file {
  background: var(--crimson); color: #fff; font-weight: 700; font-size: 13.5px;
  padding: 10px 22px; border-radius: var(--radius-md); box-shadow: 0 4px 16px var(--crimson-glow); cursor: pointer;
}
.btn-try-demo {
  display: flex; align-items: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line-strong); color: var(--platinum); font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: var(--radius-md);
}
.dropzone-hint { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }
.monitor-container { width: 100%; display: flex; justify-content: center; }
.monitor-viewport {
  position: relative; background: #030304; border-radius: var(--radius-lg);
  border: 1px solid var(--line-strong); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
  overflow: hidden; display: flex; justify-content: center; align-items: center;
}
.shorts-canvas {
  height: min(65vh, 580px); aspect-ratio: 9 / 16; max-width: 100%; display: block; background: #000;
}
.monitor-top-overlay {
  position: absolute; top: 12px; left: 12px; right: 12px; display: flex;
  align-items: center; justify-content: space-between; pointer-events: none;
}
.monitor-aspect-pill {
  font-family: var(--font-mono); font-size: 11px; font-weight: 800;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); color: var(--gold);
  border: 1px solid rgba(251, 191, 36, 0.4); padding: 3px 8px; border-radius: 999px; pointer-events: auto;
}
.safe-zone-toggle {
  display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); color: var(--text-muted);
  border: 1px solid var(--line); padding: 3px 10px; border-radius: 999px; pointer-events: auto;
}
.safe-zone-toggle.active-zone { border-color: var(--crimson); color: var(--crimson); background: rgba(255, 30, 66, 0.15); }
.export-job-overlay {
  position: absolute; inset: 0; background: rgba(6, 6, 9, 0.88); backdrop-filter: blur(14px);
  display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 20;
}
.job-card {
  max-width: 340px; width: 100%; background: var(--bg-card); border: 1px solid var(--crimson-border);
  border-radius: var(--radius-lg); padding: 24px 20px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center; box-shadow: 0 0 32px var(--crimson-glow);
}
.job-spinner {
  width: 36px; height: 36px; border: 3px solid rgba(255, 30, 66, 0.2); border-top-color: var(--crimson);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.job-progress-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; overflow: hidden; }
.job-progress-fill { height: 100%; background: linear-gradient(90deg, #ff1e42, #ffd166); border-radius: 999px; }
.job-pct-label { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--gold); }
.yt-stage-wrapper { width: 100%; display: flex; justify-content: center; }
.yt-embed-card {
  width: 100%; max-width: 720px; aspect-ratio: 16 / 9; background: #000;
  border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--line);
}
.yt-iframe-host, .yt-iframe-host iframe { width: 100%; height: 100%; display: block; }
.stage-transport-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-start; width: 100%; }
.btn-transport {
  display: flex; align-items: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 7px 14px; border-radius: var(--radius-md); font-size: 12.5px; font-weight: 600; color: var(--platinum);
}
.btn-transport:hover:not(:disabled) { border-color: var(--crimson); background: var(--crimson-subtle); }
.btn-transport.play-btn { background: var(--crimson); border-color: var(--crimson); color: #fff; box-shadow: 0 0 12px var(--crimson-glow); }
.stage-time-display { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 13px; margin-left: 8px; color: var(--text-dim); }
.stage-time-display b { color: var(--platinum); font-weight: 600; }
.btn-stage-download {
  display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #ff1e42, #d90429);
  color: #fff; font-weight: 700; font-size: 12.5px; padding: 7px 16px; border-radius: var(--radius-md);
  margin-left: auto; box-shadow: 0 0 14px var(--crimson-glow); cursor: pointer;
}
.btn-stage-download:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.timeline-wrapper {
  background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}
.timeline-controls-bar { display: flex; align-items: center; justify-content: space-between; }
.timeline-left-actions { display: flex; align-items: center; gap: 6px; }
.tl-btn {
  display: flex; align-items: center; gap: 5px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--platinum);
}
.tl-btn-crimson { background: rgba(255, 30, 66, 0.12); border-color: var(--crimson-border); color: var(--crimson); }
.tl-btn-crimson:hover:not(:disabled) { background: var(--crimson); color: #fff; }
.tl-btn-ghost { background: transparent; border-color: transparent; color: var(--text-muted); }
.timeline-timecode { font-family: var(--font-mono); font-size: 13px; display: flex; align-items: center; gap: 6px; }
.current-tc { color: var(--platinum); font-weight: 700; }
.total-tc { color: var(--text-dim); }
.timeline-track {
  position: relative; height: 72px; background: var(--bg-input); border: 1px solid var(--line-strong);
  border-radius: var(--radius-md); overflow: hidden; cursor: pointer; user-select: none; touch-action: none;
}
.waveform-grid {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 0 8px; pointer-events: none; opacity: 0.25;
}
.waveform-bar { width: 3px; background: var(--platinum); border-radius: 2px; }
.tl-clip-block {
  position: absolute; top: 8px; bottom: 8px; background: rgba(255, 30, 66, 0.18);
  border: 1px solid rgba(255, 30, 66, 0.5); border-radius: 6px; display: flex; align-items: center;
  padding: 0 8px; overflow: hidden; cursor: pointer;
}
.tl-clip-block.active-block {
  background: rgba(255, 30, 66, 0.35); border-color: var(--crimson); box-shadow: 0 0 14px var(--crimson-glow);
}
.clip-block-label {
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; color: #fff;
  white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
}
.tl-handle {
  position: absolute; top: 0; bottom: 0; width: 18px; margin-left: -9px;
  cursor: ew-resize; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.handle-flag {
  font-family: var(--font-mono); font-size: 9px; font-weight: 900; background: var(--crimson);
  color: #fff; padding: 1px 4px; border-radius: 3px; box-shadow: 0 0 8px var(--crimson-glow);
}
.handle-line { width: 4px; height: 44px; background: var(--crimson); border-radius: 2px; box-shadow: 0 0 8px var(--crimson-glow); }
.tl-playhead {
  position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px;
  background: #fff; box-shadow: 0 0 10px #fff; z-index: 12; pointer-events: none;
}
.playhead-needle {
  width: 10px; height: 10px; background: #fff; transform: rotate(45deg); margin-left: -4px; margin-top: -5px;
}
.timeline-ticks { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
.studio-inspector-pane {
  background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg);
  display: flex; flex-direction: column; overflow: hidden;
}
.inspector-tab-strip {
  display: flex; background: var(--bg-card); border-bottom: 1px solid var(--line); padding: 4px; gap: 3px;
}
.insp-tab-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 8px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; color: var(--text-muted);
}
.insp-tab-btn.active { background: var(--bg-panel); color: var(--crimson); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); }
.inspector-tab-content { padding: 16px; }
.tab-pane { display: flex; flex-direction: column; gap: 14px; }
.inspector-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.char-badge { font-family: var(--font-mono); font-size: 11px; color: var(--gold); }
.inspector-input, .inspector-textarea {
  background: var(--bg-input); border: 1px solid var(--line-strong); border-radius: var(--radius-md);
  padding: 9px 12px; font-size: 13px; color: var(--platinum); width: 100%;
}
.inspector-input:focus, .inspector-textarea:focus { border-color: var(--crimson); outline: none; }
.inspector-textarea { resize: vertical; min-height: 70px; }
.framing-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.framing-btn {
  display: flex; flex-direction: column; gap: 4px; padding: 10px; background: var(--bg-card);
  border: 1px solid var(--line); border-radius: var(--radius-md); text-align: left;
}
.framing-btn.active-framing {
  border-color: var(--crimson); background: rgba(255, 30, 66, 0.1); box-shadow: 0 0 12px var(--crimson-glow);
}
.framing-btn-header { display: flex; align-items: center; justify-content: space-between; }
.framing-title { font-weight: 700; font-size: 12px; color: var(--platinum); }
.framing-desc { font-size: 11px; color: var(--text-dim); line-height: 1.3; }
.pill-group {
  display: flex; border: 1px solid var(--line-strong); border-radius: var(--radius-md);
  overflow: hidden; background: var(--bg-input);
}
.pill-group.wrap-pills { flex-wrap: wrap; border: none; background: transparent; gap: 6px; }
.pill-btn {
  flex: 1; padding: 7px 10px; font-size: 12px; font-weight: 600; color: var(--text-muted);
  text-align: center; background: transparent; border-right: 1px solid var(--line);
}
.pill-btn:last-child { border-right: none; }
.pill-group.wrap-pills .pill-btn {
  flex: none; border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; background: var(--bg-card);
}
.pill-btn.active { background: var(--crimson); color: #fff; border-color: var(--crimson); }
.row2-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.crimson-range { width: 100%; accent-color: var(--crimson); cursor: pointer; }
.field-checkbox { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--platinum); cursor: pointer; }
.field-checkbox input { accent-color: var(--crimson); width: 16px; height: 16px; }
.caption-magic-bar { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.magic-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 9px 8px; border-radius: var(--radius-md); font-size: 12px; font-weight: 600; color: var(--platinum);
}
.magic-btn.primary-magic { background: var(--crimson); border-color: var(--crimson); color: #fff; box-shadow: 0 2px 12px var(--crimson-glow); }
.magic-btn.active-listening { background: #ff4757; color: #fff; animation: pulse-dot 1s infinite; }
.preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.preset-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 4px;
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--radius-md);
}
.preset-card.selected-preset {
  border-color: var(--crimson); background: rgba(255, 30, 66, 0.12); box-shadow: 0 0 14px var(--crimson-glow);
}
.preset-preview-box {
  width: 100%; height: 38px; border-radius: 6px; border: 1px solid transparent;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.preset-title { font-size: 11px; font-weight: 600; color: var(--text-muted); }
.cues-preview-box {
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--radius-md);
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.cues-header { display: flex; align-items: center; justify-content: space-between; }
.cues-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--platinum); }
.cue-mini-btn { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }
.cues-list { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.cue-row { display: flex; align-items: center; gap: 8px; }
.cue-time { font-family: var(--font-mono); font-size: 10.5px; color: var(--gold); flex-shrink: 0; width: 80px; }
.cue-input {
  flex: 1; background: var(--bg-input); border: 1px solid var(--line); border-radius: 4px;
  padding: 4px 8px; font-size: 12px; color: var(--platinum);
}
.subtitles-io-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.sub-io-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 8px; border-radius: var(--radius-sm); font-size: 12px;
  font-weight: 600; color: var(--text-muted); cursor: pointer;
}
.hook-chips-grid { display: flex; flex-wrap: wrap; gap: 6px; max-height: 150px; overflow-y: auto; }
.hook-chip {
  background: var(--bg-card); border: 1px solid var(--line); padding: 4px 10px;
  border-radius: 999px; font-size: 11.5px; font-weight: 600; color: var(--platinum);
}
.hook-chip:hover { border-color: var(--crimson); background: var(--crimson-subtle); color: var(--crimson); }
.soundboard-card {
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--radius-md);
  padding: 12px; display: flex; flex-direction: column; gap: 12px;
}
.soundboard-header { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 12.5px; color: var(--platinum); }
.sound-buttons-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.sound-fx-btn {
  background: var(--bg-input); border: 1px solid var(--line-strong); padding: 8px 6px;
  border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; color: var(--platinum); text-align: center;
}
.sound-fx-btn:hover { border-color: var(--crimson); background: var(--crimson-subtle); }
.audio-volume-row { display: flex; flex-direction: column; gap: 6px; }
.tags-container { display: flex; flex-direction: column; gap: 6px; }
.tag-group-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag-cat-name { font-family: var(--font-mono); font-size: 10.5px; font-weight: 800; color: var(--crimson); width: 65px; }
.tag-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tag-chip {
  background: var(--bg-card); border: 1px solid var(--line); padding: 3px 8px;
  border-radius: 999px; font-size: 11px; color: var(--text-muted);
}
.tag-chip.active { border-color: var(--crimson); background: rgba(255, 30, 66, 0.15); color: var(--crimson); }
.post-preview-card {
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--radius-md);
  padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.post-preview-header { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: var(--text-dim); }
.btn-copy-post {
  display: flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; color: var(--platinum);
}
.btn-copy-post:hover { background: var(--crimson); color: #fff; }
.post-preview-body { font-size: 12.5px; color: var(--platinum); white-space: pre-wrap; line-height: 1.4; }
.export-action-box { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 14px; }
.export-info-row { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; }
.export-spec { color: var(--gold); font-weight: 700; }
.duration-spec { color: var(--text-muted); }
.duration-spec.spec-warn { color: #ff6b6b; font-weight: 700; }
.btn-export-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--crimson); color: #fff; font-weight: 800; font-size: 14px;
  padding: 13px; border-radius: var(--radius-md); box-shadow: 0 4px 20px var(--crimson-glow);
}
.btn-export-primary:hover:not(:disabled) { background: var(--crimson-hover); box-shadow: 0 0 28px rgba(255, 30, 66, 0.7); transform: translateY(-1px); }
.link-mode-notice {
  background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: var(--radius-md); padding: 10px; font-size: 12px; color: var(--gold);
}
.btn-delete-clip {
  display: flex; align-items: center; justify-content: center; gap: 6px; color: #ef4444;
  font-size: 12px; padding: 6px; border-radius: var(--radius-sm);
}
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(4, 4, 6, 0.85); backdrop-filter: blur(14px);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px;
}
.modal-card {
  background: var(--bg-panel); border: 1px solid var(--crimson-border); border-radius: var(--radius-lg);
  max-width: 440px; width: 100%; padding: 22px; display: flex; flex-direction: column; gap: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px var(--crimson-glow);
}
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; }
.modal-title-row { display: flex; align-items: center; gap: 10px; }
.modal-title-row h3 { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--platinum); }
.modal-subtitle { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.modal-close-btn { color: var(--text-dim); }
.modal-close-btn:hover { color: var(--platinum); }
.shortcuts-list { display: flex; flex-direction: column; gap: 10px; }
.shortcut-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--line); }
.shortcut-desc { font-size: 13px; color: var(--platinum); }
.shortcut-kbd {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700; background: var(--bg-card);
  border: 1px solid var(--line-strong); padding: 3px 8px; border-radius: 4px; color: var(--crimson);
}
.modal-footer { display: flex; justify-content: flex-end; }
.btn-modal-done {
  background: var(--crimson); color: #fff; font-weight: 700; font-size: 13px; padding: 8px 18px; border-radius: var(--radius-md);
}

/* Download Modal */
.download-modal-card {
  background: var(--bg-panel); border: 1px solid var(--crimson-border); border-radius: var(--radius-lg);
  max-width: 480px; width: 100%; padding: 24px; display: flex; flex-direction: column; gap: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 32px var(--crimson-glow);
}
.download-preview-wrap {
  width: 100%; max-height: 280px; display: flex; justify-content: center; background: #000;
  border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line-strong);
}
.download-preview-video { max-height: 280px; aspect-ratio: 9 / 16; border-radius: var(--radius-sm); display: block; }
.download-specs-card {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--bg-card);
  border: 1px solid var(--line); padding: 12px; border-radius: var(--radius-md);
}
.spec-item { display: flex; flex-direction: column; gap: 2px; }
.spec-label { font-size: 10.5px; color: var(--text-dim); text-transform: uppercase; font-family: var(--font-mono); }
.spec-val { font-size: 12px; font-weight: 700; color: var(--platinum); }
.text-gold { color: var(--gold); }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.download-modal-actions { display: flex; flex-direction: column; gap: 10px; }
.btn-download-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #ff1e42, #ff3b5c); color: #fff; font-weight: 800;
  font-size: 14px; padding: 13px; border-radius: var(--radius-md); box-shadow: 0 4px 20px var(--crimson-glow); cursor: pointer;
}
.btn-download-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-copy-modal {
  display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--bg-card);
  border: 1px solid var(--line-strong); color: var(--platinum); font-size: 13px; font-weight: 600; padding: 10px; border-radius: var(--radius-md);
}
.btn-copy-modal:hover { border-color: var(--crimson); background: var(--crimson-subtle); }
.download-hint { font-size: 11.5px; color: #4ade80; text-align: center; font-weight: 600; }
.hidden-source-video { position: absolute; width: 2px; height: 2px; opacity: 0; pointer-events: none; left: -9999px; top: -9999px; }
.text-crimson { color: var(--crimson); }
.inspector-empty {
  display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 16px; gap: 12px; color: var(--text-muted);
}
.empty-sparkle { color: var(--crimson); }
`;

const readSaved = (key) => {
  try {
    return JSON.parse(localStorage.getItem('apex_clips:' + key) || '[]');
  } catch (e) {
    return [];
  }
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const ytHostRef = useRef(null);
  const ytPlayerRef = useRef(null);

  // Studio Modes: 'link' | 'file' | 'samples' | 'record'
  const [mode, setMode] = useState('samples');
  const [linkInput, setLinkInput] = useState('');
  const [ytId, setYtId] = useState(null);
  const [src, setSrc] = useState(null); // { url, name }
  const [storeKey, setStoreKey] = useState(null);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Clips state
  const [clips, setClips] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Settings & Output
  const [res, setRes] = useState(1080); // 720, 1080, 2160
  const [fps, setFps] = useState(30); // 30, 60
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Download Finished Modal
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [lastDownload, setLastDownload] = useState(null);

  // Jobs, UI status & Drag/Drop
  const [job, setJob] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-plan defaults
  const [planLen, setPlanLen] = useState(30);
  const [planCount, setPlanCount] = useState(5);

  const active = clips.find((c) => c.id === activeId) || null;
  const live = useRef({});
  live.current = { active, job, mode, showSafeZones };

  const ready = mode === 'link' ? Boolean(ytId) : Boolean(src);
  const busy = Boolean(job);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  /* ---------- Default Load: Start with First Demo Video for Instant Experience ---------- */
  useEffect(() => {
    loadSample(SAMPLE_VIDEOS[0]);
  }, []);

  /* ---------- YouTube Player Engine (Link Mode) ---------- */
  useEffect(() => {
    if (mode !== 'link' || !ytId) return undefined;
    let player = null;
    let cancelled = false;
    const host = ytHostRef.current;
    setDuration(0);
    setTime(0);

    loadYT()
      .then((YT) => {
        if (cancelled || !host) return;
        const el = document.createElement('div');
        host.appendChild(el);
        player = new YT.Player(el, {
          videoId: ytId,
          width: '100%',
          height: '100%',
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: (e) => {
              ytPlayerRef.current = e.target;
              setDuration(e.target.getDuration() || 0);
            },
            onStateChange: (e) => {
              setPlaying(e.data === 1);
              if (e.target.getDuration) setDuration(e.target.getDuration() || 0);
            },
            onError: () =>
              showToast('YouTube video is restricted or does not allow embedding.'),
          },
        });
      })
      .catch((e) => showToast('Failed to load YouTube player API.'));

    const poll = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || !p.getCurrentTime) return;
      const t = p.getCurrentTime();
      setTime(t);
      const a = live.current.active;
      if (a && p.getPlayerState() === 1 && t >= a.end) {
        p.seekTo(a.start, true);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(poll);
      ytPlayerRef.current = null;
      if (player && player.destroy) player.destroy();
      if (host) host.innerHTML = '';
    };
  }, [mode, ytId]);

  /* ---------- High Performance Canvas Render Loop ---------- */
  useEffect(() => {
    if (mode === 'link' && !src) return undefined;
    let raf;
    let last = 0;

    const loop = (ts) => {
      const v = videoRef.current;
      const cv = canvasRef.current;
      if (v && cv) {
        const { active: a, job: j, showSafeZones: sz } = live.current;
        if (!j && a && !v.paused && v.currentTime >= a.end) {
          v.currentTime = a.start;
        }

        // Render frame
        const ctx = cv.getContext('2d');
        drawFrame(ctx, v, a, v.currentTime, cv.width, cv.height, sz);

        if (!j && ts - last > 50) {
          last = ts;
          setTime(v.currentTime);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, src]);

  /* ---------- LocalStorage Persistence ---------- */
  useEffect(() => {
    if (!storeKey) return;
    try {
      localStorage.setItem('apex_clips:' + storeKey, JSON.stringify(clips));
    } catch (e) {
      // storage blocked
    }
  }, [clips, storeKey]);

  /* ---------- Loaders & Ingestion ---------- */
  const loadLink = () => {
    const input = linkInput.trim();
    if (!input) return;

    if (isDirectVideoUrl(input)) {
      setMode('file');
      setYtId(null);
      setDuration(0);
      setTime(0);
      setSrc({ url: input, name: input.split('/').pop() || 'Direct Video' });
      setStoreKey('url:' + input);

      const saved = readSaved('url:' + input);
      setClips(saved);
      setActiveId(saved[0] ? saved[0].id : null);
      showToast('Loaded direct video link into 9:16 Canvas Studio!');
      return;
    }

    const id = parseYouTubeId(input);
    if (!id) {
      showToast('Please enter a valid YouTube or direct MP4/WebM video URL.');
      return;
    }

    setMode('link');
    setYtId(id);
    setSrc(null);
    setStoreKey('yt:' + id);
    const saved = readSaved('yt:' + id);
    setClips(saved);
    setActiveId(saved[0] ? saved[0].id : null);
    showToast('YouTube video loaded successfully!');
  };

  const loadFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4, WebM, MOV, MKV).');
      return;
    }
    if (src && src.url && src.url.startsWith('blob:')) {
      URL.revokeObjectURL(src.url);
    }

    const key = 'file:' + file.name + ':' + file.size;
    setDuration(0);
    setTime(0);
    setMode('file');
    setYtId(null);
    setSrc({ url: URL.createObjectURL(file), name: file.name });
    setStoreKey(key);

    const saved = readSaved(key);
    setClips(saved);
    setActiveId(saved[0] ? saved[0].id : null);
    showToast(`Loaded "${file.name}" into studio.`);
  };

  const loadSample = (sample) => {
    setDuration(0);
    setTime(0);
    setMode('samples');
    setYtId(null);
    setSrc({ url: sample.url, name: sample.title });
    setStoreKey('sample:' + sample.id);

    const saved = readSaved('sample:' + sample.id);
    if (saved && saved.length > 0) {
      setClips(saved);
      setActiveId(saved[0].id);
    } else {
      const starter = {
        ...newClip(2, 28, 1),
        title: sample.title,
        hook: sample.suggestedHook,
        caption: sample.suggestedCaption,
        tags: sample.defaultTags,
      };
      setClips([starter]);
      setActiveId(starter.id);
    }
    showToast(`Loaded Demo: ${sample.title}`);
  };

  const startStreamRecording = async () => {
    try {
      const stream = await recordDirectStream({ type: 'screen' });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      showToast('Recording started. Share screen or window, then stop sharing when done.');

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.push(e.data);
      };

      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const recordedFile = new File([blob], `Screen-Recording-${Date.now()}.webm`, {
          type: 'video/webm',
        });
        loadFile(recordedFile);
      };

      stream.getVideoTracks()[0].onended = () => {
        rec.stop();
      };

      rec.start();
    } catch (e) {
      showToast('Screen recording was cancelled or not supported.');
    }
  };

  /* ---------- Playback Transport ---------- */
  const seek = (t) => {
    if (!isFinite(t)) return;
    const c = clamp(t, 0, duration || t);
    if (mode === 'link' && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(c, true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = c;
    }
    setTime(c);
  };

  const togglePlay = () => {
    if (mode === 'link' && ytPlayerRef.current) {
      const p = ytPlayerRef.current;
      if (p.getPlayerState && p.getPlayerState() === 1) {
        p.pauseVideo();
      } else if (p.playVideo) {
        if (active && (time < active.start || time >= active.end)) {
          p.seekTo(active.start, true);
        }
        p.playVideo();
      }
      return;
    }

    const v = videoRef.current;
    if (!v || !src) return;
    ensureAudio(v);
    if (v.paused) {
      if (active && (v.currentTime < active.start || v.currentTime >= active.end)) {
        v.currentTime = active.start;
      }
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  /* ---------- Clip Management ---------- */
  const updateClip = (patch) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updated = { ...c, ...patch };
          if (patch.volume !== undefined) {
            setAudioGain(patch.volume);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const addClip = () => {
    if (!duration) return;
    const s = clamp(time, 0, Math.max(0, duration - 1));
    const clipDur = 30;
    const c = newClip(s, Math.min(s + clipDur, duration), clips.length + 1);
    setClips((prev) => [...prev, c]);
    setActiveId(c.id);
    showToast(`Created Clip #${clips.length + 1}`);
  };

  const generateAutoPlan = () => {
    if (!duration) return;
    const windows = autoPlan(duration, planLen, planCount);
    if (!windows.length) {
      showToast('Video is shorter than one clip of that length.');
      return;
    }
    const made = windows.map((w, i) => ({
      ...newClip(w.start, w.end, clips.length + i + 1),
      hook: VIRAL_HOOKS[i % VIRAL_HOOKS.length],
    }));
    setClips((prev) => [...prev, ...made]);
    setActiveId(made[0].id);
    seek(made[0].start);
    showToast(`Generated ${made.length} viral clip windows across the timeline.`);
  };

  const removeClip = () => {
    const remaining = clips.filter((c) => c.id !== activeId);
    setClips(remaining);
    setActiveId(remaining[0] ? remaining[0].id : null);
    showToast('Clip deleted.');
  };

  const handleTimelineDrag = (id, role, t) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return role === 'start'
          ? { ...c, start: Math.min(t, c.end - 0.5) }
          : { ...c, end: Math.max(t, c.start + 0.5) };
      })
    );
    seek(t);
  };

  const setIn = () => {
    if (active) {
      updateClip({ start: Math.min(time, active.end - 0.5) });
      showToast(`Set Start: ${fmt(time)}`);
    }
  };

  const setOut = () => {
    if (active) {
      updateClip({ end: Math.max(time, active.start + 0.5) });
      showToast(`Set End: ${fmt(time)}`);
    }
  };

  /* ---------- Keyboard Shortcuts ---------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (!ready) return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        addClip();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIn();
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setOut();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(time - (e.shiftKey ? 0.1 : 1.0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(time + (e.shiftKey ? 0.1 : 1.0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  /* ---------- Video Exports with Direct Local Download & Preview Modal ---------- */
  const exportClips = async (clipList) => {
    const v = videoRef.current;
    if (!v || !clipList.length || job) return;
    ensureAudio(v);

    try {
      let lastExportResult = null;
      for (let i = 0; i < clipList.length; i++) {
        const c = clipList[i];
        const label = `Rendering Short ${i + 1} of ${clipList.length} (${res}p @ ${fps}fps)...`;
        setJob({ label, pct: 0 });

        const result = await recordClip(v, c, res, fps, (p) => {
          setJob({ label, pct: p });
        });

        const filename = `${slug(c.title)}-${i + 1}-${res}p.${result.ext}`;

        // Automatically trigger browser download to local file on disk!
        saveFile(filename, result.blob, result.blob.type);

        lastExportResult = {
          ...result,
          filename,
          title: c.title,
          duration: c.end - c.start,
          res,
          fps,
        };
      }

      // Play success audio chime
      playSoundEffect('ding');

      // Celebrate with Red, Gold & Platinum Confetti!
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ff1e42', '#ffd166', '#ffffff', '#ff4162'],
      });

      showToast(`🎉 Exported ${clipList.length} Short(s) directly to your Downloads folder!`);

      // Open Download Modal for instant playback and repeat download
      if (lastExportResult) {
        setLastDownload(lastExportResult);
        setDownloadModalOpen(true);
      }
    } catch (e) {
      showToast(`Export failed: ${e.message || 'Error occurred'}`);
    }
    setJob(null);
  };

  const copyPost = () => {
    if (!active) return;
    const text = active.title + '\n\n' + postText(active);
    navigator.clipboard.writeText(text);
    showToast('Post caption & hashtags copied to clipboard!');
  };

  const savePlan = () => {
    saveFile(
      'shorts-plan.json',
      JSON.stringify({ video: src ? src.name : ytId, clips }, null, 2),
      'application/json'
    );
    showToast('Saved clip plan as JSON.');
  };

  const saveCaptions = () => {
    saveFile('shorts-captions.txt', captionsText(clips), 'text/plain');
    showToast('Saved all captions as TXT.');
  };

  const totalDur = clips.reduce((sum, c) => sum + (c.end - c.start), 0);

  return (
    <div
      className="studio-root"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <style>{STUDIO_CSS}</style>

      {/* Hidden processing video element */}
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        className="hidden-source-video"
        src={src ? src.url : undefined}
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          if (src) showToast('Video format could not be played directly. Try MP4 (H.264).');
        }}
      />

      {/* Top Navbar */}
      <Header
        mode={mode}
        setMode={(newMode) => {
          setMode(newMode);
          if (newMode === 'record') {
            startStreamRecording();
          }
        }}
        res={res}
        setRes={setRes}
        fps={fps}
        setFps={setFps}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onDownloadShort={() => active && exportClips([active])}
        hasActiveClip={Boolean(active)}
        busy={busy}
      />

      {/* Link Bar (when in Link mode) */}
      {mode === 'link' && (
        <LinkBar
          linkInput={linkInput}
          setLinkInput={setLinkInput}
          onLoadLink={loadLink}
          onLoadSample={loadSample}
          busy={busy}
        />
      )}

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="studio-toast" role="status">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 3-Pane Studio Workspace Grid */}
      <div className="studio-main-grid">
        {/* Left Pane: Clip Bin & Auto-Plan */}
        <ClipBin
          clips={clips}
          activeId={activeId}
          onSelectClip={(id) => {
            setActiveId(id);
            const found = clips.find((c) => c.id === id);
            if (found) seek(found.start);
          }}
          onAddClip={addClip}
          onGeneratePlan={generateAutoPlan}
          planLen={planLen}
          setPlanLen={setPlanLen}
          planCount={planCount}
          setPlanCount={setPlanCount}
          totalDur={totalDur}
          onExportAll={() => exportClips(clips)}
          onSavePlan={savePlan}
          onSaveCaptions={saveCaptions}
          mode={mode}
          busy={busy}
          duration={duration}
        />

        {/* Center Pane: Monitor & Timeline */}
        <section className="studio-center-stage">
          <VideoStage
            mode={mode}
            src={src}
            ytId={ytId}
            ytHostRef={ytHostRef}
            canvasRef={canvasRef}
            playing={playing}
            onTogglePlay={togglePlay}
            time={time}
            duration={duration}
            activeClip={active}
            onSetIn={setIn}
            onSetOut={setOut}
            onAddClip={addClip}
            onDownloadShort={() => active && exportClips([active])}
            busy={busy}
            job={job}
            onFileSelect={loadFile}
            showSafeZones={showSafeZones}
            setShowSafeZones={setShowSafeZones}
            isDragOver={isDragOver}
            onPickDemo={() => loadSample(SAMPLE_VIDEOS[0])}
            res={res}
            fps={fps}
          />

          {duration > 0 && (
            <Timeline
              duration={duration}
              time={time}
              clips={clips}
              activeId={activeId}
              onSeek={seek}
              onSelect={(id) => {
                setActiveId(id);
                const found = clips.find((c) => c.id === id);
                if (found) seek(found.start);
              }}
              onHandle={handleTimelineDrag}
              onAddClip={addClip}
              playing={playing}
              onTogglePlay={togglePlay}
              busy={busy}
            />
          )}
        </section>

        {/* Right Pane: Inspector, Auto-Captions, Framing & Post */}
        <aside className="studio-inspector-pane">
          <Inspector
            clip={active}
            mode={mode}
            update={updateClip}
            res={res}
            setRes={setRes}
            fps={fps}
            setFps={setFps}
            busy={busy}
            onExport={() => active && exportClips([active])}
            onRemove={removeClip}
            onCopyPost={copyPost}
            onToast={showToast}
          />
        </aside>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Download Video Finished Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        downloadData={lastDownload}
        onDownloadAgain={() => {
          if (lastDownload) {
            saveFile(lastDownload.filename, lastDownload.blob, lastDownload.blob.type);
            showToast('Downloaded video again to local file!');
          }
        }}
        onCopyCaption={copyPost}
      />
    </div>
  );
}
