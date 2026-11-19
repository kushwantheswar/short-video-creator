import React from 'react';
import { Sparkles, Video, Link2, Upload, Radio, HelpCircle, Github, Film } from 'lucide-react';

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
          <Github size={18} />
        </a>
      </div>
    </header>
  );
}
