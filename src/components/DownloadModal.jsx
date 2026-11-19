import React from 'react';
import { Download, X, Check, Play, Share2, Sparkles, Film } from 'lucide-react';
import { fmt } from '../lib/clips.js';

export default function DownloadModal({
  isOpen,
  onClose,
  downloadData, // { blob, ext, filename, title, duration, res, fps, size }
  onDownloadAgain,
  onCopyCaption,
}) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !downloadData) return null;

  const { blob, filename, title, duration, res, fps, blobUrl } = downloadData;
  const sizeMB = blob ? (blob.size / (1024 * 1024)).toFixed(2) : '0';

  const handleCopy = () => {
    if (onCopyCaption) onCopyCaption();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="download-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Sparkles size={20} className="text-crimson" />
            <div>
              <h3>Your Short is Ready!</h3>
              <p className="modal-subtitle">Rendered in high quality and saved to your device.</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Video Preview Box */}
        <div className="download-preview-wrap">
          {blobUrl ? (
            <video
              src={blobUrl}
              controls
              autoPlay
              loop
              playsInline
              className="download-preview-video"
            />
          ) : (
            <div className="preview-fallback">
              <Film size={40} className="text-crimson" />
              <span>Video ready for download</span>
            </div>
          )}
        </div>

        {/* File Specifications Details */}
        <div className="download-specs-card">
          <div className="spec-item">
            <span className="spec-label">File Name</span>
            <span className="spec-val truncate">{filename}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Resolution</span>
            <span className="spec-val text-gold">{res}p FHD (9:16)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Frame Rate</span>
            <span className="spec-val">{fps} FPS</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">File Size</span>
            <span className="spec-val">{sizeMB} MB</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Duration</span>
            <span className="spec-val">{fmt(duration)}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="download-modal-actions">
          <button
            type="button"
            className="btn-download-primary"
            onClick={onDownloadAgain}
          >
            <Download size={18} />
            <span>Download Video File Again</span>
          </button>

          <button
            type="button"
            className="btn-copy-modal"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Caption Copied!' : 'Copy Social Caption'}</span>
          </button>
        </div>

        <span className="download-hint">
          ✓ File automatically downloaded to your browser's Downloads folder
        </span>
      </div>
    </div>
  );
}
