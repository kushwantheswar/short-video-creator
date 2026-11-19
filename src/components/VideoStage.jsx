import React, { useState } from 'react';
import { fmt } from '../lib/clips.js';
import {
  Play,
  Pause,
  Upload,
  Shield,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Scissors,
  Download,
} from 'lucide-react';

export default function VideoStage({
  mode,
  src,
  ytId,
  ytHostRef,
  canvasRef,
  playing,
  onTogglePlay,
  time,
  duration,
  activeClip,
  onSetIn,
  onSetOut,
  onAddClip,
  onDownloadShort,
  busy,
  job,
  onFileSelect,
  showSafeZones,
  setShowSafeZones,
  isDragOver,
  onPickDemo,
  res,
  fps,
}) {
  return (
    <section className="stage-panel">
      {/* 1. Drag & Drop Upload State (when no video is loaded in file mode) */}
      {mode === 'file' && !src && (
        <div className={`dropzone-box ${isDragOver ? 'drag-over' : ''}`}>
          <div className="dropzone-inner">
            <div className="dropzone-icon-ring">
              <Upload size={32} className="text-crimson" />
            </div>
            <h2>Drop Any Video Here</h2>
            <p>
              Supports MP4, WebM, MOV, and MKV. Videos stay private in your browser with hardware-accelerated processing.
            </p>

            <div className="dropzone-buttons">
              <label className="btn-choose-file">
                <span>Browse Local File</span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                className="btn-try-demo"
                onClick={onPickDemo}
              >
                <Sparkles size={15} />
                <span>Try Demo Video</span>
              </button>
            </div>

            <span className="dropzone-hint">
              Zero server uploads · Instant 9:16 vertical crop · Auto subtitles
            </span>
          </div>
        </div>
      )}

      {/* 2. YouTube Link Player State */}
      {mode === 'link' && ytId && (
        <div className="yt-stage-wrapper">
          <div className="yt-embed-card">
            <div ref={ytHostRef} className="yt-iframe-host" />
          </div>
        </div>
      )}

      {/* 3. High Performance 9:16 Canvas Monitor (File / Samples / Direct Link) */}
      {(src || (mode === 'samples' && src)) && (
        <div className="monitor-container">
          <div className="monitor-viewport">
            <canvas
              ref={canvasRef}
              width={540}
              height={960}
              className="shorts-canvas"
              aria-label="9:16 Vertical Video Preview"
            />

            {/* Overlaid Quick Badge */}
            <div className="monitor-top-overlay">
              <span className="monitor-aspect-pill">9:16 SHORTS ({res}p)</span>
              <button
                type="button"
                className={`safe-zone-toggle ${showSafeZones ? 'active-zone' : ''}`}
                onClick={() => setShowSafeZones(!showSafeZones)}
                title="Toggle Safe Zone Guides (Shows TikTok / Reels UI button overlay)"
              >
                <Shield size={14} />
                <span>Safe Zones</span>
              </button>
            </div>

            {/* Active Export Job Progress Overlay */}
            {job && (
              <div className="export-job-overlay">
                <div className="job-card">
                  <div className="job-spinner" />
                  <h4>{job.label}</h4>
                  <div className="job-progress-track">
                    <div
                      className="job-progress-fill"
                      style={{ width: `${Math.round((job.pct || 0) * 100)}%` }}
                    />
                  </div>
                  <span className="job-pct-label">
                    {Math.round((job.pct || 0) * 100)}% Complete
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transport Controls Bar */}
      {(src || ytId) && (
        <div className="stage-transport-bar">
          <button
            type="button"
            className="btn-transport play-btn"
            onClick={onTogglePlay}
            disabled={busy}
            title="Play / Pause (Space)"
          >
            {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            className="btn-transport"
            onClick={onAddClip}
            disabled={busy || !duration}
            title="New Clip (N)"
          >
            <Scissors size={15} />
            <span>New Clip</span>
          </button>

          <button
            type="button"
            className="btn-transport"
            onClick={onSetIn}
            disabled={!activeClip || busy}
            title="Set Clip Start Point (I)"
          >
            <span>Set IN</span>
          </button>

          <button
            type="button"
            className="btn-transport"
            onClick={onSetOut}
            disabled={!activeClip || busy}
            title="Set Clip End Point (O)"
          >
            <span>Set OUT</span>
          </button>

          <div className="stage-time-display">
            <b>{fmt(time)}</b>
            <span>/</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Quick Download Button on Stage */}
          {activeClip && (
            <button
              type="button"
              className="btn-stage-download"
              onClick={onDownloadShort}
              disabled={busy}
              title="Export and Download this Short directly to your PC"
            >
              <Download size={15} />
              <span>Download Short</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
