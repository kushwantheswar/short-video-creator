import React, { useState } from 'react';
import CaptionEditor from './CaptionEditor.jsx';
import {
  COLOR_FILTERS,
} from '../lib/draw.js';
import {
  HOOKS,
  HASHTAG_PRESETS,
  postText,
} from '../lib/clips.js';
import { playSoundEffect } from '../lib/media.js';
import {
  Crop,
  Layers,
  Sparkles,
  Volume2,
  Share2,
  Copy,
  Trash2,
  Check,
  Zap,
  Sliders,
  Type,
  Music,
  Download,
} from 'lucide-react';

export default function Inspector({
  clip,
  mode,
  update,
  res,
  setRes,
  fps,
  setFps,
  busy,
  onExport,
  onRemove,
  onCopyPost,
  onToast,
}) {
  const [activeTab, setActiveTab] = useState('frame'); // 'frame' | 'captions' | 'hooks' | 'post'
  const [copied, setCopied] = useState(false);

  if (!clip) {
    return (
      <div className="inspector-empty">
        <Sparkles size={32} className="empty-sparkle" />
        <h3>No Clip Selected</h3>
        <p>Select a clip from the list or hit "New Clip" on the timeline to start styling.</p>
      </div>
    );
  }

  const dur = clip.end - clip.start;
  const isOverShortsLimit = dur > 60; // YouTube Shorts limit is 60s
  const tagList = (clip.tags || '').split(/\s+/).filter(Boolean);

  const toggleTag = (t) => {
    const updated = tagList.includes(t)
      ? tagList.filter((x) => x !== t)
      : [...tagList, t];
    update({ tags: updated.join(' ') });
  };

  const handleCopyPost = () => {
    if (onCopyPost) onCopyPost();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inspector-panel-container">
      {/* Inspector Tabs */}
      <div className="inspector-tab-strip" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'frame'}
          className={`insp-tab-btn ${activeTab === 'frame' ? 'active' : ''}`}
          onClick={() => setActiveTab('frame')}
        >
          <Crop size={15} />
          <span>Framing</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'captions'}
          className={`insp-tab-btn ${activeTab === 'captions' ? 'active' : ''}`}
          onClick={() => setActiveTab('captions')}
        >
          <Type size={15} />
          <span>Captions</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'hooks'}
          className={`insp-tab-btn ${activeTab === 'hooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('hooks')}
        >
          <Zap size={15} />
          <span>Hooks & FX</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'post'}
          className={`insp-tab-btn ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <Share2 size={15} />
          <span>Export</span>
        </button>
      </div>

      <div className="inspector-tab-content">
        {/* TAB 1: FRAMING & LAYOUT */}
        {activeTab === 'frame' && (
          <div className="tab-pane">
            <div className="inspector-field">
              <label htmlFor="clip-title-input" className="field-label">Clip Title</label>
              <input
                id="clip-title-input"
                type="text"
                className="inspector-input"
                value={clip.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>

            {/* Layout Options */}
            <div className="inspector-field">
              <label className="field-label">9:16 Shorts Framing Mode</label>
              <div className="framing-cards-grid">
                {[
                  {
                    key: 'fill',
                    title: 'Smart Crop (Fill)',
                    desc: 'Full 9:16 crop with dynamic face pan',
                  },
                  {
                    key: 'fit',
                    title: 'Frosted Glass (Fit)',
                    desc: 'Centered video + luxury blurred background',
                  },
                  {
                    key: 'split',
                    title: 'Split Screen (Viral)',
                    desc: 'Top speaker + Bottom viral motion / b-roll',
                  },
                  {
                    key: 'letterbox',
                    title: 'Cinema Letterbox',
                    desc: 'Clean bordered frame with crimson accents',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`framing-btn ${clip.layout === item.key ? 'active-framing' : ''}`}
                    onClick={() => update({ layout: item.key })}
                  >
                    <div className="framing-btn-header">
                      <span className="framing-title">{item.title}</span>
                      {clip.layout === item.key && <Check size={14} className="text-crimson" />}
                    </div>
                    <span className="framing-desc">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Pan Presets (when layout is fill or split) */}
            {(clip.layout === 'fill' || clip.layout === 'split') && (
              <div className="inspector-field">
                <div className="field-label-row">
                  <label className="field-label">Speaker Focus (Horizontal Pan)</label>
                  <span className="char-badge">{Math.round((clip.pan || 0.5) * 100)}%</span>
                </div>

                <div className="pill-group" style={{ marginBottom: '8px' }}>
                  {[
                    ['Left Speaker', 0.15],
                    ['Center Focus', 0.5],
                    ['Right Speaker', 0.85],
                  ].map(([label, val]) => (
                    <button
                      key={label}
                      type="button"
                      className={`pill-btn ${Math.abs((clip.pan || 0.5) - val) < 0.05 ? 'active' : ''}`}
                      onClick={() => update({ pan: val })}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((clip.pan || 0.5) * 100)}
                  onChange={(e) => update({ pan: Number(e.target.value) / 100 })}
                  className="crimson-range"
                />
              </div>
            )}

            {/* Zoom Slider */}
            {clip.layout === 'fill' && (
              <div className="inspector-field">
                <div className="field-label-row">
                  <label className="field-label">Zoom Scale</label>
                  <span className="char-badge">{(clip.zoom || 1.0).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="180"
                  value={Math.round((clip.zoom || 1.0) * 100)}
                  onChange={(e) => update({ zoom: Number(e.target.value) / 100 })}
                  className="crimson-range"
                />
              </div>
            )}

            {/* Color Grading Filter */}
            <div className="inspector-field">
              <label className="field-label">Cinematic Color Grade</label>
              <div className="pill-group wrap-pills">
                {Object.keys(COLOR_FILTERS).map((fKey) => (
                  <button
                    key={fKey}
                    type="button"
                    className={`pill-btn ${clip.filter === fKey ? 'active' : ''}`}
                    onClick={() => update({ filter: fKey })}
                  >
                    {fKey.charAt(0).toUpperCase() + fKey.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar & Watermark */}
            <div className="inspector-field">
              <label className="field-checkbox">
                <input
                  type="checkbox"
                  checked={clip.showProgressBar !== false}
                  onChange={(e) => update({ showProgressBar: e.target.checked })}
                />
                <span>Show Glowing Red Video Progress Bar</span>
              </label>
            </div>

            <div className="inspector-field">
              <label htmlFor="watermark-input" className="field-label">Creator Watermark / Handle</label>
              <input
                id="watermark-input"
                type="text"
                className="inspector-input"
                value={clip.watermark || ''}
                placeholder="e.g. @yourchannel"
                onChange={(e) => update({ watermark: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CAPTIONS & SUBTITLES */}
        {activeTab === 'captions' && (
          <CaptionEditor
            clip={clip}
            update={update}
            busy={busy}
            onToast={onToast}
          />
        )}

        {/* TAB 3: VIRAL HOOKS & SOUND FX */}
        {activeTab === 'hooks' && (
          <div className="tab-pane">
            <div className="inspector-field">
              <label htmlFor="hook-input" className="field-label">On-Screen Hook (Plays First 2.5s)</label>
              <input
                id="hook-input"
                type="text"
                className="inspector-input"
                value={clip.hook || ''}
                placeholder="Type a scroll-stopping hook..."
                onChange={(e) => update({ hook: e.target.value })}
              />
            </div>

            {/* Viral Hook Presets Chips */}
            <div className="inspector-field">
              <label className="field-label">High-Retention Hook Presets</label>
              <div className="hook-chips-grid">
                {HOOKS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className="hook-chip"
                    onClick={() => update({ hook: h })}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Soundboard / Audio Volume */}
            <div className="soundboard-card">
              <div className="soundboard-header">
                <Music size={16} className="text-crimson" />
                <span className="soundboard-title">Viral Sound Effects</span>
              </div>
              <div className="sound-buttons-row">
                <button
                  type="button"
                  className="sound-fx-btn"
                  onClick={() => playSoundEffect('whoosh')}
                >
                  ⚡ Fast Whoosh
                </button>
                <button
                  type="button"
                  className="sound-fx-btn"
                  onClick={() => playSoundEffect('ding')}
                >
                  🔔 Bell Ding
                </button>
                <button
                  type="button"
                  className="sound-fx-btn"
                  onClick={() => playSoundEffect('bass')}
                >
                  💣 808 Bass Drop
                </button>
              </div>

              <div className="audio-volume-row">
                <div className="field-label-row">
                  <label className="field-label">Audio Boost</label>
                  <span className="char-badge">{Math.round((clip.volume || 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={Math.round((clip.volume || 1.0) * 100)}
                  onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
                  className="crimson-range"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: POST TEXT & EXPORT */}
        {activeTab === 'post' && (
          <div className="tab-pane">
            <div className="inspector-field">
              <label htmlFor="post-textarea" className="field-label">Post Caption (For YouTube / TikTok / IG)</label>
              <textarea
                id="post-textarea"
                className="inspector-textarea"
                rows={3}
                value={clip.post || ''}
                placeholder="Write an engaging question or call-to-action..."
                onChange={(e) => update({ post: e.target.value })}
              />
            </div>

            {/* Hashtag Categories */}
            <div className="inspector-field">
              <label className="field-label">Quick Hashtag Categories</label>
              <div className="tags-container">
                {Object.entries(HASHTAG_PRESETS).map(([cat, tags]) => (
                  <div key={cat} className="tag-group-row">
                    <span className="tag-cat-name">{cat.toUpperCase()}:</span>
                    <div className="tag-chips">
                      {tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`tag-chip ${tagList.includes(t) ? 'active' : ''}`}
                          onClick={() => toggleTag(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Preview Box */}
            <div className="post-preview-card">
              <div className="post-preview-header">
                <span>Social Post Ready-to-Paste:</span>
                <button
                  type="button"
                  className="btn-copy-post"
                  onClick={handleCopyPost}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
                </button>
              </div>
              <div className="post-preview-body">
                <b>{clip.title}</b>
                <p>{postText(clip)}</p>
              </div>
            </div>

            {/* Export Section */}
            <div className="export-action-box">
              <div className="export-info-row">
                <span className="export-spec">
                  {res === 2160 ? '4K Ultra' : res === 1080 ? '1080p FHD' : '720p HD'} @ {fps}fps
                </span>
                <span className={`duration-spec ${isOverShortsLimit ? 'spec-warn' : ''}`}>
                  {dur.toFixed(1)}s {isOverShortsLimit ? '⚠️ Over 60s Shorts limit' : '✓ Shorts Ready'}
                </span>
              </div>

              {mode === 'file' || mode === 'samples' || mode === 'record' ? (
                <button
                  type="button"
                  className="btn-export-primary"
                  disabled={busy}
                  onClick={onExport}
                >
                  <Download size={16} />
                  <span>Render & Download This Short</span>
                </button>
              ) : (
                <div className="link-mode-notice">
                  <p>
                    💡 When using a YouTube embed, click <b>"Copy Caption"</b> or switch to <b>"Demo Samples" / "Local Video"</b> to render 9:16 video files directly!
                  </p>
                </div>
              )}

              <button
                type="button"
                className="btn-delete-clip"
                disabled={busy}
                onClick={onRemove}
              >
                <Trash2 size={14} />
                <span>Delete Clip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
