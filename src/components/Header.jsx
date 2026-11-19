import React from 'react';
import { Sparkles, Video, Link2, Upload, Radio, HelpCircle, Film } from 'lucide-react';

function GithubIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Header({
  mode,
  setMode,
  res,
  setRes,
  fps,
  setFps,
  onOpenShortcuts,
  busy,
}) {
  return (
    <header className="top-navbar">
      <div className="brand-group">
        <div className="logo-badge">
          <div className="logo-flame">
            <Sparkles size={20} className="flame-icon" />
          </div>
          <div className="brand-titles">
            <div className="brand-main">
              <span className="brand-apex">APEX</span>
              <span className="brand-shorts">SHORTS</span>
              <span className="brand-ai">AI</span>
            </div>
            <span className="brand-subtitle">Viral 9:16 Shorts & Reels Studio</span>
          </div>
        </div>
      </div>

      <div className="nav-source-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'link'}
          className={`source-tab ${mode === 'link' ? 'active' : ''}`}
          onClick={() => setMode('link')}
          disabled={busy}
        >
          <Link2 size={16} />
          <span>Video Link</span>
        </button>

        <button
          role="tab"
          aria-selected={mode === 'file'}
          className={`source-tab ${mode === 'file' ? 'active' : ''}`}
          onClick={() => setMode('file')}
          disabled={busy}
        >
          <Upload size={16} />
          <span>Local Video</span>
        </button>

        <button
          role="tab"
          aria-selected={mode === 'samples'}
          className={`source-tab ${mode === 'samples' ? 'active' : ''}`}
          onClick={() => setMode('samples')}
          disabled={busy}
        >
          <Film size={16} />
          <span>Demo Samples</span>
        </button>

        <button
          role="tab"
          aria-selected={mode === 'record'}
          className={`source-tab ${mode === 'record' ? 'active' : ''}`}
          onClick={() => setMode('record')}
          disabled={busy}
        >
          <Radio size={16} className={mode === 'record' ? 'pulse-red' : ''} />
          <span>Record Cam / Screen</span>
        </button>
      </div>

      <div className="header-actions">
        {/* Resolution selector */}
        <div className="quality-pill">
          <select
            value={res}
            onChange={(e) => setRes(Number(e.target.value))}
            className="quality-select"
            title="Export Resolution"
            disabled={busy}
          >
            <option value={720}>720p HD</option>
            <option value={1080}>1080p FHD</option>
            <option value={2160}>4K Ultra</option>
          </select>
          <button
            className={`fps-toggle ${fps === 60 ? 'on' : ''}`}
            onClick={() => setFps(fps === 60 ? 30 : 60)}
            title="Toggle 60 FPS Export"
            disabled={busy}
          >
            {fps}fps
          </button>
        </div>

        {/* Shortcuts button */}
        <button
          className="icon-btn"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (Space, N, I, O)"
        >
          <HelpCircle size={18} />
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/kushwantheswar/short-video-creator"
          target="_blank"
          rel="noreferrer"
          className="icon-btn github-link"
          title="GitHub Repository"
        >
          <GithubIcon size={18} />
        </a>
      </div>
    </header>
  );
}
