import React from 'react';
import { Link2, Sparkles, Play, Clipboard, Check } from 'lucide-react';
import { SAMPLE_VIDEOS } from '../lib/samples.js';

export default function LinkBar({
  linkInput,
  setLinkInput,
  onLoadLink,
  onLoadSample,
  busy,
}) {
  const [copied, setCopied] = React.useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLinkInput(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      // clipboard access denied
    }
  };

  return (
    <div className="linkbar-container">
      <form
        className="linkbar-form"
        onSubmit={(e) => {
          e.preventDefault();
          onLoadLink();
        }}
      >
        <div className="linkbar-input-wrap">
          <Link2 size={18} className="link-icon" />
          <input
            type="text"
            className="linkbar-input"
            value={linkInput}
            placeholder="Paste any YouTube URL or direct MP4/WebM video stream link..."
            onChange={(e) => setLinkInput(e.target.value)}
            disabled={busy}
          />
          {linkInput ? (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setLinkInput('')}
              title="Clear"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              className="paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              {copied ? <Check size={14} /> : <Clipboard size={14} />}
              <span>{copied ? 'Pasted!' : 'Paste'}</span>
            </button>
          )}
        </div>

        <button type="submit" className="btn-load-video" disabled={!linkInput.trim() || busy}>
          <Play size={16} fill="currentColor" />
          <span>Load Video</span>
        </button>
      </form>

      {/* 1-Click Sample Videos Bar */}
      <div className="samples-quick-strip">
        <span className="strip-label">
          <Sparkles size={13} className="text-crimson" />
          <span>Quick Demo Videos:</span>
        </span>
        <div className="sample-chips">
          {SAMPLE_VIDEOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="sample-chip-btn"
              onClick={() => onLoadSample(s)}
              disabled={busy}
              title={s.desc}
            >
              <span className="chip-tag">{s.tag}</span>
              <span className="chip-name">{s.title}</span>
              <span className="chip-dur">({s.duration})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
