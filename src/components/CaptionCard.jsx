import { PRESETS, POS_Y } from '../lib/draw.js';

/** CSS stand-in for the Shorts frame, used in link mode where the video itself cannot be drawn. */
export default function CaptionCard({ clip }) {
  const P = PRESETS[clip ? clip.preset : 'bold'];
  const px = clip ? clip.size * 0.25 : 20;
  const textStyle = (preset, size) => {
    const p = PRESETS[preset];
    const s = {
      color: p.fill,
      fontSize: size + 'px',
      textTransform: p.upper ? 'uppercase' : 'none',
    };
    if (p.stroke) {
      s.WebkitTextStroke = size * 0.18 + 'px ' + p.stroke;
      s.paintOrder = 'stroke fill';
    }
    if (p.shadow) s.textShadow = '0 2px 8px rgba(0,0,0,.85)';
    if (p.box) {
      s.background = p.box;
      s.padding = '2px 8px';
      s.borderRadius = '6px';
      s.boxDecorationBreak = 'clone';
      s.WebkitBoxDecorationBreak = 'clone';
    }
    return s;
  };
  return (
    <div className="phone" aria-label="Caption preview">
      <span className="phone-label">9:16 caption preview</span>
      {clip && clip.hook && (
        <div className="phone-text" style={{ top: '11%' }}>
          <span style={textStyle('pop', px * 1.05)}>{clip.hook}</span>
        </div>
      )}
      {clip && clip.caption && (
        <div className="phone-text" style={{ top: POS_Y[clip.pos] * 100 + '%' }}>
          <span style={textStyle(clip.preset, px)}>{clip.caption}</span>
        </div>
      )}
      {!clip && <p className="phone-empty">Select a clip to see its caption here.</p>}
    </div>
  );
}
