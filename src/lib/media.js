import { clamp } from './clips.js';
import { drawFrame } from './draw.js';

/* Audio graph so exported clips carry boosted sound and sound effects */
const audio = {
  ctx: null,
  gain: null,
  dest: null,
  el: null,
};

export function ensureAudio(v) {
  try {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
    }
    if (audio.el !== v) {
      const src = audio.ctx.createMediaElementSource(v);
      audio.gain = audio.ctx.createGain();
      audio.dest = audio.ctx.createMediaStreamDestination();
      src.connect(audio.gain);
      audio.gain.connect(audio.ctx.destination);
      src.connect(audio.dest);
      audio.el = v;
    }
    if (audio.ctx.state === 'suspended') {
      audio.ctx.resume();
    }
  } catch (e) {
    /* playback still works; export fallback */
  }
}

/** Set audio playback and export gain multiplier (1.0 = normal, 1.5 = 150%, 2.0 = 200%) */
export function setAudioGain(multiplier = 1.0) {
  if (audio.gain && audio.ctx) {
    audio.gain.gain.setValueAtTime(clamp(multiplier, 0, 2.5), audio.ctx.currentTime);
  }
}

/** Synthesize viral sound effects in real-time with Web Audio */
export function playSoundEffect(type = 'whoosh') {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = audio.ctx || new AC();
    const now = ctx.currentTime;

    if (type === 'whoosh') {
      // White noise swept bandpass whoosh
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

    } else if (type === 'ding') {
      // Bell chime / ding
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, now); // E6
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);

    } else if (type === 'bass') {
      // Deep 808 sub bass drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  } catch (e) {
    // sound effect error ignored
  }
}

const seekVideo = (v, t) =>
  new Promise((res) => {
    if (Math.abs(v.currentTime - t) < 0.03) return res();
    const h = () => {
      v.removeEventListener('seeked', h);
      res();
    };
    v.addEventListener('seeked', h);
    v.currentTime = t;
  });

function pickMime() {
  const list = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return list.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}

/**
 * High-Quality Video Exporter
 * Renders the 9:16 vertical canvas into MP4 or WebM at target resolution and bitrate.
 */
export async function recordClip(video, clip, res = 1080, fps = 30, onProgress) {
  if (!window.MediaRecorder) {
    throw new Error('This browser does not support MediaRecorder. Try Chrome, Edge or Firefox.');
  }

  let w = 1080;
  let h = 1920;
  let bps = 10e6; // 10 Mbps default

  if (res === 720) {
    w = 720;
    h = 1280;
    bps = 5e6;
  } else if (res === 1080) {
    w = 1080;
    h = 1920;
    bps = fps === 60 ? 14e6 : 9e6;
  } else if (res === 2160) {
    // 4K Ultra Vertical
    w = 2160;
    h = 3840;
    bps = 22e6;
  }

  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { alpha: false });

  const stream = cv.captureStream(fps);
  if (audio.dest) {
    audio.dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
  }

  const mime = pickMime();
  const rec = new MediaRecorder(
    stream,
    mime ? { mimeType: mime, videoBitsPerSecond: bps } : undefined
  );

  const chunks = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };

  video.pause();
  await seekVideo(video, clip.start);

  // Mute audible playback while fast recording
  if (audio.gain) audio.gain.gain.value = 0;

  drawFrame(ctx, video, clip, clip.start, w, h);
  rec.start(250);
  await video.play();

  return new Promise((resolve, reject) => {
    let animId = null;
    const type = (mime || 'video/webm').split(';')[0];

    const finish = () => {
      cancelAnimationFrame(animId);
      video.pause();
      rec.onstop = () => {
        if (audio.gain) audio.gain.gain.value = clip.volume || 1.0;
        resolve({
          blob: new Blob(chunks, { type }),
          ext: type.includes('mp4') ? 'mp4' : 'webm',
        });
      };
      if (rec.state !== 'inactive') {
        rec.stop();
      }
    };

    const tick = () => {
      const t = video.currentTime;
      drawFrame(ctx, video, clip, t, w, h);
      
      const dur = clip.end - clip.start;
      if (dur > 0 && onProgress) {
        onProgress(clamp((t - clip.start) / dur, 0, 1));
      }

      if (t >= clip.end || video.ended) {
        finish();
        return;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
  });
}

/** Record screen or webcam directly in the browser */
export async function recordDirectStream({ type = 'screen' }) {
  let stream = null;
  if (type === 'screen') {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30 } },
      audio: true,
    });
  } else {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: true,
    });
  }
  return stream;
}

export function saveFile(name, data, type = 'text/plain') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
