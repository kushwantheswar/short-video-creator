import React from 'react';
import { fmt } from '../lib/clips.js';
import {
  Film,
  Plus,
  Wand2,
  Download,
  FileJson,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function ClipBin({
  clips,
  activeId,
  onSelectClip,
  onAddClip,
  onGeneratePlan,
  planLen,
  setPlanLen,
  planCount,
  setPlanCount,
  totalDur,
  onExportAll,
  onSavePlan,
  onSaveCaptions,
  mode,
  busy,
  duration,
}) {
  return (
    <aside className="clip-bin-panel">
      <div className="bin-header">
        <div className="bin-title-group">
          <Layers size={16} className="text-crimson" />
          <h2>Clips</h2>
          {clips.length > 0 && <span className="bin-count-badge">{clips.length}</span>}
        </div>

        <button
          type="button"
          className="btn-add-clip-mini"
          onClick={onAddClip}
          disabled={busy || !duration}
          title="Add new clip"
        >
          <Plus size={15} />
          <span>New</span>
        </button>
      </div>

      {/* Clip List */}
      <div className="bin-list-scroll">
        {clips.length === 0 ? (
          <div className="bin-empty-state">
            <Film size={28} className="empty-film-icon" />
            <p>No clips marked yet.</p>
            <span className="empty-sub">
              {duration
                ? 'Hit "New" or generate a viral clip plan below.'
                : 'Load a video or pick a demo sample to begin.'}
            </span>
          </div>
        ) : (
          <ul className="clip-cards-list">
            {clips.map((c, i) => {
              const isSelected = c.id === activeId;
              const dur = c.end - c.start;
              const isOver = dur > 60;

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`clip-card-item ${isSelected ? 'selected-card' : ''}`}
                    onClick={() => onSelectClip(c.id)}
                  >
                    <div className="clip-card-badge">
                      <span>#{i + 1}</span>
                    </div>

                    <div className="clip-card-details">
                      <span className="clip-card-title">{c.title || `Clip ${i + 1}`}</span>
                      <div className="clip-card-meta">
                        <span className="clip-time-range">
                          {fmt(c.start)} – {fmt(c.end)}
                        </span>
                        <span className={`clip-dur-pill ${isOver ? 'over-limit' : ''}`}>
                          {dur.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Auto Plan Generator Section */}
      {duration > 0 && (
        <div className="auto-plan-box">
          <div className="auto-plan-header">
            <Wand2 size={13} className="text-crimson" />
            <span className="auto-plan-title">AI Clip Plan Generator</span>
          </div>

          <div className="plan-selectors-row">
            <select
              className="plan-select"
              value={planLen}
              onChange={(e) => setPlanLen(Number(e.target.value))}
              disabled={busy}
              title="Target Clip Length"
            >
              <option value={15}>15s (Reels)</option>
              <option value={30}>30s (Shorts)</option>
              <option value={45}>45s (TikTok)</option>
              <option value={60}>60s (Max)</option>
            </select>

            <select
              className="plan-select"
              value={planCount}
              onChange={(e) => setPlanCount(Number(e.target.value))}
              disabled={busy}
              title="Number of Clips"
            >
              <option value={3}>3 clips</option>
              <option value={5}>5 clips</option>
              <option value={8}>8 clips</option>
              <option value={12}>12 clips</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-generate-plan"
            onClick={onGeneratePlan}
            disabled={busy || !duration}
          >
            <Sparkles size={14} />
            <span>Generate Plan</span>
          </button>
        </div>
      )}

      {/* Bin Actions Footer */}
      <div className="bin-footer-actions">
        {(mode === 'file' || mode === 'samples' || mode === 'record') && (
          <button
            type="button"
            className="btn-bulk-export"
            disabled={!clips.length || busy}
            onClick={onExportAll}
          >
            <Download size={15} />
            <span>Download All ({clips.length})</span>
          </button>
        )}

        <div className="io-buttons-row">
          <button
            type="button"
            className="btn-io-mini"
            disabled={!clips.length}
            onClick={onSavePlan}
            title="Download Plan as JSON"
          >
            <FileJson size={13} />
            <span>Plan .json</span>
          </button>

          <button
            type="button"
            className="btn-io-mini"
            disabled={!clips.length}
            onClick={onSaveCaptions}
            title="Download Captions as TXT"
          >
            <FileText size={13} />
            <span>Captions .txt</span>
          </button>
        </div>

        {clips.length > 0 && (
          <div className="total-dur-indicator">
            <Clock size={12} />
            <span>Total Duration: {fmt(totalDur)}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
