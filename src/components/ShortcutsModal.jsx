import React from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Space', desc: 'Play / Pause Video' },
    { key: 'N', desc: 'Create New Clip at Current Playhead' },
    { key: 'I', desc: 'Set Start Time (IN point) of Active Clip' },
    { key: 'O', desc: 'Set End Time (OUT point) of Active Clip' },
    { key: '← / →', desc: 'Seek 1.0 second backwards or forwards' },
    { key: 'Shift + ← / →', desc: 'Seek 0.1s frame-by-frame precision' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Command size={18} className="text-crimson" />
            <h3>Studio Keyboard Shortcuts</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <kbd className="shortcut-kbd">{s.key}</kbd>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-done" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
