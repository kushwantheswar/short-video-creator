import React, { useRef } from 'react';
import { clamp, fmt } from '../lib/clips.js';
import { Scissors, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Timeline({
  duration,
  time,
  clips,
  activeId,
  onSeek,
  onSelect,
  onHandle,
  onAddClip,
  playing,
  onTogglePlay,
  busy,
}) {
  const trackRef = useRef(null);

  const getTimeFromEvent = (e) => {
    if (!trackRef.current || !duration) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return ratio * duration;
  };

  const handlePointerDown = (e, role, id) => {
    e.preventDefault();
    e.stopPropagation();

    const onPointerMove = (ev) => {
      const t = getTimeFromEvent(ev);
      if (role === 'seek') {
        onSeek(t);
      } else {
        onHandle(id, role, t);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Initial trigger
    const initialT = getTimeFromEvent(e);
    if (role === 'seek') onSeek(initialT);
    else onHandle(id, role, initialT);
  };

  const pct = (t) => (duration > 0 ? (t / duration) * 100 : 0) + '%';
  const activeClip = clips.find((c) => c.id === activeId);

  return (
    <div className="timeline-wrapper">
      <div className="timeline-controls-bar">
        <div className="timeline-left-actions">
          <button
            type="button"
            className="tl-btn"
            onClick={onTogglePlay}
            disabled={busy}
            title="Play/Pause (Space)"
          >
            {playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            className="tl-btn tl-btn-crimson"
            onClick={onAddClip}
            disabled={busy || !duration}
            title="Create new clip at playhead (N)"
          >
            <Scissors size={14} />
            <span>New Clip</span>
          </button>

          <button
            type="button"
            className="tl-btn tl-btn-ghost"
            onClick={() => onSeek(Math.max(0, time - 5))}
            disabled={busy}
            title="Jump back 5s (Left Arrow)"
          >
            <ChevronLeft size={16} />
            <span>-5s</span>
          </button>

          <button
            type="button"
            className="tl-btn tl-btn-ghost"
            onClick={() => onSeek(Math.min(duration, time + 5))}
            disabled={busy}
            title="Jump forward 5s (Right Arrow)"
          >
            <span>+5s</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="timeline-timecode">
          <span className="current-tc">{fmt(time)}</span>
          <span className="divider-tc">/</span>
          <span className="total-tc">{fmt(duration)}</span>
        </div>
      </div>

      {/* Interactive Track Area */}
      <div
        className="timeline-track"
        ref={trackRef}
        onPointerDown={(e) => handlePointerDown(e, 'seek')}
      >
        {/* Synthetic subtle audio waveform bars */}
        <div className="waveform-grid" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.7) * 15 + Math.cos(i * 1.3) * 10;
            return (
              <span
                key={i}
                className="waveform-bar"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Existing clips spans */}
        {clips.map((c, i) => {
          const isSelected = c.id === activeId;
          const leftPct = (c.start / duration) * 100;
          const widthPct = Math.max(0.5, ((c.end - c.start) / duration) * 100);

          return (
            <div
              key={c.id}
              className={`tl-clip-block ${isSelected ? 'active-block' : ''}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onPointerDown={(e) => {
                if (c.id !== activeId) {
                  e.stopPropagation();
                  onSelect(c.id);
                }
              }}
            >
              <span className="clip-block-label">
                #{i + 1} {c.title} ({(c.end - c.start).toFixed(1)}s)
              </span>
            </div>
          );
        })}

        {/* Draggable Start and End Handles for Active Clip */}
        {activeClip && (
          <>
            <div
              className="tl-handle start-handle"
              style={{ left: pct(activeClip.start) }}
              onPointerDown={(e) => handlePointerDown(e, 'start', activeClip.id)}
              title={`Start: ${fmt(activeClip.start)} (Drag or press I)`}
            >
              <div className="handle-flag">IN</div>
              <div className="handle-line" />
            </div>

            <div
              className="tl-handle end-handle"
              style={{ left: pct(activeClip.end) }}
              onPointerDown={(e) => handlePointerDown(e, 'end', activeClip.id)}
              title={`End: ${fmt(activeClip.end)} (Drag or press O)`}
            >
              <div className="handle-flag">OUT</div>
              <div className="handle-line" />
            </div>
          </>
        )}

        {/* Glowing Red Playhead */}
        <div className="tl-playhead" style={{ left: pct(time) }}>
          <div className="playhead-needle" />
        </div>
      </div>

      {/* Time Ticks */}
      <div className="timeline-ticks">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <span key={f} className="tick-mark">
            {fmt(duration * f)}
          </span>
        ))}
      </div>
    </div>
  );
}
