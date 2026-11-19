import React, { useState } from 'react';
import { PRESETS, POS_Y } from '../lib/draw.js';
import {
  generateSmartCaptions,
  startSpeechListener,
  transcribeWithWhisper,
  cuesToSRT,
  parseSRT,
  injectEmojis,
} from '../lib/captions.js';
import { saveFile } from '../lib/media.js';
import {
  Wand2,
  Mic,
  MicOff,
  Cpu,
  FileText,
  Upload,
  Download,
  Smile,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';

export default function CaptionEditor({ clip, update, busy, onToast }) {
  const [isListening, setIsListening] = useState(false);
  const [speechRec, setSpeechRec] = useState(null);
  const [showWhisperModal, setShowWhisperModal] = useState(false);
  const [whisperKey, setWhisperKey] = useState('');
  const [whisperProvider, setWhisperProvider] = useState('groq');
  const [whisperLoading, setWhisperLoading] = useState(false);

  if (!clip) {
    return (
      <div className="empty-panel-state">
        <p>Select or create a clip to edit captions & subtitles.</p>
      </div>
    );
  }

  // 1. Auto Generate Captions with Smart AI
  const handleAutoGenerate = () => {
    const cues = generateSmartCaptions(clip);
    const combinedText = cues.map((c) => c.text).join('\n');
    update({
      caption: combinedText,
      cues,
    });
    if (onToast) onToast('⚡ Generated viral word-by-word captions!');
  };

  // 2. Add Emojis
  const handleAddEmojis = () => {
    const updated = injectEmojis(clip.caption);
    const newCues = (clip.cues || []).map((c) => ({
      ...c,
      text: injectEmojis(c.text),
      words: c.words.map((w) => ({
        ...w,
        word: injectEmojis(w.word),
      })),
    }));
    update({
      caption: updated,
      cues: newCues,
    });
    if (onToast) onToast('✨ Added viral emojis!');
  };

  // 3. Web Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (speechRec) speechRec.stop();
      setIsListening(false);
      setSpeechRec(null);
      if (onToast) onToast('Stopped microphone listening.');
    } else {
      const rec = startSpeechListener({
        onResult: (transcript) => {
          update({ caption: transcript });
        },
        onError: (err) => {
          setIsListening(false);
          if (onToast) onToast('Mic error: ' + err.message);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (rec) {
        setSpeechRec(rec);
        setIsListening(true);
        if (onToast) onToast('🎤 Listening to speech in real-time...');
      }
    }
  };

  // 4. Import SRT / VTT
  const handleImportSRT = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const cues = parseSRT(event.target.result);
        if (cues.length > 0) {
          update({
            cues,
            caption: cues.map((c) => c.text).join('\n'),
          });
          if (onToast) onToast(`Imported ${cues.length} subtitle cues!`);
        }
      } catch (err) {
        if (onToast) onToast('Failed to parse subtitle file.');
      }
    };
    reader.readAsText(file);
  };

  // 5. Export SRT
  const handleExportSRT = () => {
    if (!clip.cues || !clip.cues.length) {
      if (onToast) onToast('No subtitle cues to export yet.');
      return;
    }
    const srt = cuesToSRT(clip.cues);
    saveFile(`${clip.title || 'short'}-subtitles.srt`, srt, 'text/plain');
    if (onToast) onToast('Subtitles exported as .srt');
  };

  return (
    <div className="caption-editor-container">
      {/* Action Buttons Row */}
      <div className="caption-magic-bar">
        <button
          type="button"
          className="magic-btn primary-magic"
          onClick={handleAutoGenerate}
          disabled={busy}
          title="Auto-generate timed word-by-word viral captions"
        >
          <Wand2 size={15} />
          <span>Auto Captions</span>
        </button>

        <button
          type="button"
          className={`magic-btn ${isListening ? 'active-listening' : ''}`}
          onClick={toggleSpeechRecognition}
          disabled={busy}
          title="Live voice-to-text transcription via browser mic"
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          <span>{isListening ? 'Stop Mic' : 'Live Mic'}</span>
        </button>

        <button
          type="button"
          className="magic-btn"
          onClick={handleAddEmojis}
          disabled={busy}
          title="Auto-inject viral emojis into subtitles"
        >
          <Smile size={15} />
          <span>Add Emojis</span>
        </button>
      </div>

      {/* Preset Style Selector */}
      <div className="inspector-field">
        <label className="field-label">Caption Style & Animation</label>
        <div className="preset-grid">
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              className={`preset-card ${clip.preset === key ? 'selected-preset' : ''}`}
              onClick={() => update({ preset: key })}
            >
              <div
                className="preset-preview-box"
                style={{
                  background: p.box || 'rgba(0,0,0,0.4)',
                  borderColor: p.highlight || '#ff1e42',
                }}
              >
                <span
                  style={{
                    color: p.fill,
                    textTransform: p.upper ? 'uppercase' : 'none',
                    fontWeight: 800,
                  }}
                >
                  {key === 'hormozi' ? 'HORMOZI' : p.label}
                </span>
              </div>
              <span className="preset-title">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Position & Text Size */}
      <div className="row2-fields">
        <div className="inspector-field">
          <label className="field-label">Position</label>
          <div className="pill-group">
            {[
              ['top', 'Top'],
              ['mid', 'Mid'],
              ['low', 'Low'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={`pill-btn ${clip.pos === k ? 'active' : ''}`}
                onClick={() => update({ pos: k })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="inspector-field">
          <label className="field-label">Font Size: {clip.size}px</label>
          <input
            type="range"
            min="42"
            max="120"
            value={clip.size || 76}
            onChange={(e) => update({ size: Number(e.target.value) })}
            className="crimson-range"
          />
        </div>
      </div>

      {/* Raw Caption Textarea */}
      <div className="inspector-field">
        <div className="field-label-row">
          <label htmlFor="caption-text-area" className="field-label">
            Full Subtitle Script
          </label>
          <span className="char-badge">{(clip.caption || '').length} chars</span>
        </div>
        <textarea
          id="caption-text-area"
          className="inspector-textarea"
          rows={3}
          value={clip.caption || ''}
          placeholder="Type or paste subtitles here... Each line displays as an on-screen chunk."
          onChange={(e) => update({ caption: e.target.value })}
        />
      </div>

      {/* Timed Word Cues List (if present) */}
      {clip.cues && clip.cues.length > 0 && (
        <div className="cues-preview-box">
          <div className="cues-header">
            <span className="cues-title">
              <Clock size={13} />
              <span>Word Karaoke Cues ({clip.cues.length})</span>
            </span>
            <div className="cues-actions">
              <button
                type="button"
                className="cue-mini-btn"
                onClick={handleExportSRT}
                title="Download SRT Subtitle File"
              >
                <Download size={13} />
                <span>Export SRT</span>
              </button>
            </div>
          </div>

          <div className="cues-list">
            {clip.cues.slice(0, 8).map((cue, idx) => (
              <div key={cue.id || idx} className="cue-row">
                <span className="cue-time">
                  {cue.start.toFixed(1)}s - {cue.end.toFixed(1)}s
                </span>
                <input
                  type="text"
                  className="cue-input"
                  value={cue.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    const newCues = [...clip.cues];
                    newCues[idx] = { ...cue, text: newText };
                    update({
                      cues: newCues,
                      caption: newCues.map((c) => c.text).join('\n'),
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import / Export Subtitles Footer */}
      <div className="subtitles-io-row">
        <label className="sub-io-btn">
          <Upload size={14} />
          <span>Import .SRT</span>
          <input
            type="file"
            accept=".srt,.vtt,.txt"
            hidden
            onChange={handleImportSRT}
          />
        </label>

        <button
          type="button"
          className="sub-io-btn"
          onClick={handleExportSRT}
          disabled={!clip.cues || !clip.cues.length}
        >
          <Download size={14} />
          <span>Export .SRT</span>
        </button>
      </div>
    </div>
  );
}
