/**
 * High-Performance 9:16 Canvas Rendering Engine
 * Powers real-time live preview & high-bitrate video export.
 */

export const PRESETS = {
  hormozi: {
    label: 'Hormozi Viral',
    fill: '#ffffff',
    highlight: '#fbbf24',
    stroke: '#000000',
    upper: true,
    font: '900 1em "Bebas Neue", "Archivo", Impact, sans-serif',
    scaleActive: 1.14,
  },
  tiktok: {
    label: 'TikTok Pop',
    fill: '#ffffff',
    highlight: '#ff1e42',
    box: 'rgba(0, 0, 0, 0.78)',
    upper: false,
    font: '800 1em "Outfit", "Plus Jakarta Sans", sans-serif',
    scaleActive: 1.08,
  },
  beast: {
    label: 'Beast Yellow',
    fill: '#ffea00',
    highlight: '#ffffff',
    stroke: '#050505',
    upper: true,
    font: '900 1em "Bebas Neue", "Arial Black", sans-serif',
    scaleActive: 1.15,
  },
  cyber: {
    label: 'Cyber Red',
    fill: '#ff1e42',
    highlight: '#ffffff',
    glow: 'rgba(255, 30, 66, 0.85)',
    stroke: '#000000',
    upper: true,
    font: '800 1em "Syne", "Outfit", sans-serif',
    scaleActive: 1.12,
  },
  bold: {
    label: 'Classic Bold',
    fill: '#ffffff',
    highlight: '#ff204e',
    stroke: '#000000',
    upper: true,
    font: '800 1em "Archivo", "Arial Black", sans-serif',
    scaleActive: 1.05,
  },
  clean: {
    label: 'Minimalist',
    fill: '#ffffff',
    highlight: '#ffd166',
    shadow: true,
    upper: false,
    font: '700 1em "Plus Jakarta Sans", "Inter", sans-serif',
    scaleActive: 1.05,
  },
};

export const POS_Y = {
  top: 0.18,
  mid: 0.52,
  low: 0.76,
};

export const COLOR_FILTERS = {
  none: 'none',
  crimson: 'contrast(1.15) saturate(1.25) brightness(0.98)',
  vibrant: 'contrast(1.2) saturate(1.4) brightness(1.05)',
  warm: 'contrast(1.08) saturate(1.2) sepia(0.18)',
  noir: 'grayscale(1) contrast(1.45) brightness(0.95)',
  cyber: 'contrast(1.3) saturate(1.35) hue-rotate(-12deg)',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** Draws synthetic engaging b-roll for Split-Screen mode */
function drawViralBottomBroll(ctx, t, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Dark cyber background with perspective grid
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#0d0d12');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Speed lines / futuristic particle runner effect
  const speed = (t * 80) % 60;
  ctx.strokeStyle = 'rgba(255, 30, 66, 0.25)';
  ctx.lineWidth = 2;
  const numLines = 8;
  for (let i = 0; i <= numLines; i++) {
    const lx = x + (w / numLines) * i;
    ctx.beginPath();
    ctx.moveTo(w / 2, y + 40);
    ctx.lineTo(lx, y + h);
    ctx.stroke();
  }

  // Horizontal motion pulses
  for (let j = 0; j < 5; j++) {
    const py = y + ((speed + j * 90) % h);
    ctx.strokeStyle = `rgba(255, 30, 66, ${0.15 + (j % 2) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }

  // Center badge
  const bw = 160;
  const bh = 34;
  const bx = x + (w - bw) / 2;
  const by = y + h / 2 - bh / 2;
  ctx.fillStyle = 'rgba(15, 15, 20, 0.85)';
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 66, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ff1e42';
  ctx.font = '800 13px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ VIRAL MOMENT', x + w / 2, y + h / 2);

  ctx.restore();
}

/** Draws dynamic word-by-word animated captions */
function drawAnimatedCaptions(ctx, clip, t, w, h, k) {
  if (!clip) return;
  const presetKey = clip.preset || 'hormozi';
  const P = PRESETS[presetKey] || PRESETS.hormozi;
  const fs = (clip.size || 76) * k;
  const cy = h * (POS_Y[clip.pos] || POS_Y.mid);

  // Check if we have timed word cues
  const activeCue = (clip.cues || []).find((c) => t >= c.start && t <= c.end);

  if (activeCue && activeCue.words && activeCue.words.length > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = activeCue.words;
    const fontStr = P.font.replace('1em', `${fs}px`);
    ctx.font = fontStr;

    // Measure total width
    const wordMeasures = words.map((wObj) => {
      const isWordActive = t >= wObj.start && t < wObj.end;
      const text = P.upper ? wObj.word.toUpperCase() : wObj.word;
      return {
        ...wObj,
        text,
        isActive: isWordActive,
        width: ctx.measureText(text).width,
      };
    });

    const spaceWidth = ctx.measureText(' ').width;
    const totalW = wordMeasures.reduce((acc, m) => acc + m.width, 0) + (wordMeasures.length - 1) * spaceWidth;

    let startX = (w - totalW) / 2;
    const y = cy;

    // Draw background pill if preset has box
    if (P.box) {
      ctx.fillStyle = P.box;
      roundRect(ctx, startX - fs * 0.4, y - fs * 0.65, totalW + fs * 0.8, fs * 1.35, fs * 0.25);
      ctx.fill();
    }

    // Render each word
    wordMeasures.forEach((m) => {
      ctx.save();
      const wordCenter = startX + m.width / 2;

      if (m.isActive) {
        // Active word bounce scale & glow
        ctx.translate(wordCenter, y);
        ctx.scale(P.scaleActive, P.scaleActive);
        ctx.translate(-wordCenter, -y);

        if (P.glow) {
          ctx.shadowColor = P.glow;
          ctx.shadowBlur = fs * 0.5;
        }

        // Active word pill box if TikTok preset
        if (presetKey === 'tiktok') {
          ctx.fillStyle = '#ff1e42';
          roundRect(ctx, startX - 4, y - fs * 0.55, m.width + 8, fs * 1.1, 6);
          ctx.fill();
        }
      }

      // Stroke outline
      if (P.stroke) {
        ctx.lineWidth = fs * 0.24;
        ctx.strokeStyle = P.stroke;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(m.text, wordCenter, y);
      }

      // Fill
      ctx.fillStyle = m.isActive ? P.highlight : P.fill;
      ctx.fillText(m.text, wordCenter, y);

      ctx.restore();
      startX += m.width + spaceWidth;
    });

    ctx.restore();
    return;
  }

  // Fallback: Multi-line plain caption
  const rawText = clip.caption || '';
  if (!rawText.trim()) return;

  ctx.save();
  const fontStr = P.font.replace('1em', `${fs}px`);
  ctx.font = fontStr;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const textToDraw = P.upper ? rawText.toUpperCase() : rawText;
  const lines = textToDraw.split('\n');
  const lh = fs * 1.25;
  let y = cy - ((lines.length - 1) * lh) / 2;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const tw = ctx.measureText(trimmed).width;

    if (P.box) {
      ctx.fillStyle = P.box;
      roundRect(ctx, w / 2 - tw / 2 - fs * 0.35, y - lh * 0.5 + fs * 0.05, tw + fs * 0.7, lh - fs * 0.05, fs * 0.2);
      ctx.fill();
    }

    if (P.glow) {
      ctx.shadowColor = P.glow;
      ctx.shadowBlur = fs * 0.45;
    }

    if (P.stroke) {
      ctx.lineWidth = fs * 0.22;
      ctx.strokeStyle = P.stroke;
      ctx.strokeText(trimmed, w / 2, y);
    }

    ctx.fillStyle = P.fill;
    ctx.fillText(trimmed, w / 2, y);
    y += lh;
  });

  ctx.restore();
}

/** Draws high-impact On-Screen Hook during the first 2.5 seconds of the clip */
function drawOnScreenHook(ctx, hook, t, clipStart, w, h, k) {
  if (!hook || !hook.trim()) return;
  const elapsed = t - clipStart;
  if (elapsed < 0 || elapsed > 2.6) return;

  ctx.save();
  const progress = Math.min(1, elapsed / 0.25); // fast 250ms pop-in
  const scale = 0.85 + 0.15 * progress;
  const fs = 78 * k * scale;

  ctx.font = `900 ${fs}px "Outfit", "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = hook.toUpperCase().trim();
  const tw = ctx.measureText(text).width;
  const cy = h * 0.12;

  // Premium Crimson Pill Badge
  ctx.save();
  ctx.shadowColor = 'rgba(255, 30, 66, 0.65)';
  ctx.shadowBlur = 24 * k;
  ctx.fillStyle = '#ff1e42';
  roundRect(ctx, w / 2 - tw / 2 - fs * 0.45, cy - fs * 0.68, tw + fs * 0.9, fs * 1.36, fs * 0.3);
  ctx.fill();
  ctx.restore();

  // White inner text with drop shadow
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8 * k;
  ctx.shadowOffsetY = 2 * k;
  ctx.fillText(text, w / 2, cy);

  ctx.restore();
}

/** Draws safe-zone overlays for TikTok / Instagram Reels UI buttons */
export function drawSafeZones(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);

  // Top header safe line (profile / live bar)
  ctx.beginPath();
  ctx.moveTo(0, h * 0.08);
  ctx.lineTo(w, h * 0.08);
  ctx.stroke();

  // Bottom action bar safe line (username, audio title, comment bar)
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.lineTo(w, h * 0.82);
  ctx.stroke();

  // Right side buttons (like, comment, share, save)
  const rw = w * 0.18;
  ctx.strokeRect(w - rw, h * 0.45, rw - 8, h * 0.35);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('SAFE ZONE', 12, h * 0.07);
  ctx.fillText('REELS / TIKTOK UI', w - rw + 6, h * 0.44);

  ctx.restore();
}

/**
 * Main Frame Rendering Entrypoint
 * Draws 1 frame of the 9:16 vertical canvas (video + framing + color filter + hooks + captions + progress bar).
 */
export function drawFrame(ctx, video, clip, t, w, h, showSafe = false) {
  const k = w / 1080;

  // Fill black canvas
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, w, h);

  const vw = video ? video.videoWidth : 0;
  const vh = video ? video.videoHeight : 0;

  if (video && vw && vh) {
    const layout = clip ? clip.layout : 'fill';
    const filterKey = clip && clip.filter ? clip.filter : 'none';
    const cssFilter = COLOR_FILTERS[filterKey] || 'none';

    ctx.save();
    try {
      ctx.filter = cssFilter;
    } catch (e) {
      // filter unsupported
    }

    if (layout === 'fit') {
      // Frosted Glass Blur Background
      const sc = Math.max(w / vw, h / vh) * 1.15;
      ctx.save();
      try {
        ctx.filter = `blur(${28 * k}px) brightness(0.65) ${cssFilter}`;
      } catch (e) {}
      ctx.drawImage(video, (w - vw * sc) / 2, (h - vh * sc) / 2, vw * sc, vh * sc);
      ctx.restore();

      // Subtle dark vignette
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, w, h);

      // Centered video with drop shadow
      const fh = vh * (w / vw);
      const fy = (h - fh) / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 32 * k;
      ctx.drawImage(video, 0, fy, w, fh);
      ctx.restore();

    } else if (layout === 'split') {
      // Split Screen: Top 52% Main Video, Bottom 48% Viral B-Roll
      const splitY = h * 0.52;

      // Top video cropped to fit upper half
      const targetAspect = w / splitY;
      const aspect = vw / vh;
      let sw, sh, sx, sy;
      if (aspect > targetAspect) {
        sh = vh;
        sw = vh * targetAspect;
        sx = (vw - sw) * (clip ? clip.pan : 0.5);
        sy = 0;
      } else {
        sw = vw;
        sh = vw / targetAspect;
        sx = 0;
        sy = (vh - sh) * 0.5;
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, splitY);

      // Divider line
      ctx.fillStyle = '#ff1e42';
      ctx.fillRect(0, splitY - 2 * k, w, 4 * k);

      // Bottom viral b-roll simulation
      drawViralBottomBroll(ctx, t, 0, splitY, w, h - splitY);

    } else if (layout === 'letterbox') {
      // Clean Letterbox with Crimson Border accents
      const fh = vh * (w / vw);
      const fy = (h - fh) / 2;
      ctx.drawImage(video, 0, fy, w, fh);

      ctx.strokeStyle = 'rgba(255, 30, 66, 0.45)';
      ctx.lineWidth = 3 * k;
      ctx.strokeRect(0, fy, w, fh);

    } else {
      // 'fill' - Standard 9:16 Smart Crop with pan & zoom
      const target = w / h;
      const aspect = vw / vh;
      const zoom = clip && clip.zoom ? clip.zoom : 1.0;
      let sw, sh, sx, sy;

      if (aspect > target) {
        sh = vh / zoom;
        sw = (vh * target) / zoom;
        const maxPanX = vw - sw;
        sx = maxPanX * (clip ? clip.pan : 0.5);
        sy = (vh - sh) * 0.5;
      } else {
        sw = vw / zoom;
        sh = (vw / target) / zoom;
        sx = (vw - sw) * 0.5;
        const maxPanY = vh - sh;
        sy = maxPanY * (clip && clip.panY !== undefined ? clip.panY : 0.5);
      }

      ctx.drawImage(video, Math.max(0, sx), Math.max(0, sy), sw, sh, 0, 0, w, h);
    }

    ctx.restore();
  }

  // Draw Overlays
  if (clip) {
    // 1. On-Screen Hook
    drawOnScreenHook(ctx, clip.hook, t, clip.start, w, h, k);

    // 2. Animated Word-by-Word Captions
    drawAnimatedCaptions(ctx, clip, t, w, h, k);

    // 3. Glowing Progress Bar
    if (clip.showProgressBar && clip.end > clip.start) {
      const dur = clip.end - clip.start;
      const pct = Math.min(1, Math.max(0, (t - clip.start) / dur));
      const barH = 5 * k;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, h - barH, w, barH);

      ctx.save();
      ctx.shadowColor = '#ff1e42';
      ctx.shadowBlur = 8 * k;
      ctx.fillStyle = '#ff1e42';
      ctx.fillRect(0, h - barH, w * pct, barH);
      ctx.restore();
    }

    // 4. Creator Watermark
    if (clip.watermark && clip.watermark.trim()) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = `600 ${22 * k}px "Outfit", sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(clip.watermark.trim(), w - 24 * k, h - 24 * k);
      ctx.restore();
    }
  }

  // Safe zones for preview
  if (showSafe) {
    drawSafeZones(ctx, w, h);
  }
}
