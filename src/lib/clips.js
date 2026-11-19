import { generateWordCues } from './captions.js';

export const fmt = (t) => {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return String(m).padStart(2, '0') + ':' + s.toFixed(1).padStart(4, '0');
};

export const fmtShort = (t) => {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const slug = (s) =>
  (s || 'clip').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'clip';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const VIRAL_HOOKS = [
  'WAIT FOR IT... 🤯',
  'NOBODY TALKS ABOUT THIS 🤫',
  'STOP SCROLLING RIGHT NOW 🛑',
  'THIS CHANGED MY WHOLE LIFE ⚡',
  'THE #1 TRICK YOU NEED TO KNOW 🎯',
  'WATCH TILL THE VERY END 👀',
  '99% OF PEOPLE GET THIS WRONG ❌',
  'THE SECRET NOBODY REVEALS 💎',
  'HOW I DID THIS IN 24 HOURS 🚀',
  'THIS MOMENT WAS INSANE 🔥',
  'YOU WON\'T BELIEVE WHAT HAPPENED 😱',
  'DO NOT MAKE THIS MISTAKE ⚠️',
];

export const HOOKS = VIRAL_HOOKS;

export const HASHTAG_PRESETS = {
  shorts: ['#shorts', '#viral', '#trending', '#youtube', '#fyp', '#viralvideo'],
  reels: ['#reels', '#reelsinstagram', '#explorepage', '#viralreels', '#trendingnow'],
  tiktok: ['#tiktok', '#foryou', '#fyp', '#foryoupage', '#viral', '#challenge'],
  business: ['#entrepreneur', '#motivation', '#business', '#mindset', '#growth'],
  tech: ['#tech', '#ai', '#software', '#coding', '#innovation', '#gadgets'],
  gaming: ['#gaming', '#gamer', '#gameplay', '#twitch', '#streamer', '#funnygaming']
};

export const TAGS = ['#shorts', '#viral', '#fyp', '#trending', '#explore', '#reels', '#mindset', '#gaming', '#tech'];

export const newClip = (start, end, n) => {
  const initialHook = VIRAL_HOOKS[(n - 1) % VIRAL_HOOKS.length];
  const defaultText = "This changed everything.\nWatch closely!";
  const dur = Math.max(1, end - start);

  return {
    id: uid(),
    start,
    end,
    title: 'Short ' + n,
    hook: initialHook,
    caption: defaultText,
    cues: generateWordCues(defaultText, start, dur),
    post: 'Drop a 🔥 in the comments if you agree! What would you do in this situation?',
    tags: '#shorts #viral #fyp #trending',
    preset: 'hormozi', // 'hormozi' | 'tiktok' | 'beast' | 'cyber' | 'bold' | 'clean'
    pos: 'mid', // 'top' | 'mid' | 'low'
    size: 76,
    layout: 'fill', // 'fill' | 'fit' | 'split' | 'letterbox'
    pan: 0.5, // 0 = left, 0.5 = center, 1 = right
    panY: 0.5,
    zoom: 1.0,
    filter: 'none', // 'none' | 'crimson' | 'vibrant' | 'warm' | 'noir' | 'cyber'
    volume: 1.0, // 0 to 2
    showProgressBar: true,
    watermark: '',
  };
};

export const postText = (c) => [c.post ? c.post.trim() : '', c.tags ? c.tags.trim() : ''].filter(Boolean).join('\n\n');

/** Pull YouTube video id out of watch, youtu.be, live, shorts, embed URLs. */
export function parseYouTubeId(input) {
  const s = (input || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith('http') ? s : 'https://' + s);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(live|shorts|embed|v)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch (e) {
    /* not a URL */
  }
  return null;
}

/** Check if a string is a direct video stream link or cloud URL */
export function isDirectVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const s = url.trim().toLowerCase();
  return (
    s.includes('.mp4') ||
    s.includes('.webm') ||
    s.includes('.mov') ||
    s.includes('.m3u8') ||
    s.includes('blob:') ||
    s.includes('commondatastorage.googleapis.com') ||
    s.includes('cloudinary.com') ||
    s.includes('supabase.co') ||
    s.includes('storage.googleapis.com') ||
    s.includes('cdn.')
  );
}

/** Generate an evenly spaced clip plan */
export function autoPlan(duration, len, count) {
  const n = Math.min(count, Math.floor(duration / len));
  if (n < 1) return [];
  const gap = (duration - n * len) / (n + 1);
  return Array.from({ length: n }, (_, i) => {
    const start = gap * (i + 1) + len * i;
    return { start: +start.toFixed(1), end: +(start + len).toFixed(1) };
  });
}

/** Export full project captions as plain text document */
export function captionsText(clips) {
  return clips
    .map(
      (c, i) =>
        '========================================\n' +
        'SHORT ' + (i + 1) + ': ' + c.title.toUpperCase() + '\n' +
        'TIMECODE: ' + fmt(c.start) + ' - ' + fmt(c.end) + ' (' + (c.end - c.start).toFixed(1) + 's)\n' +
        'HOOK: ' + (c.hook || '-') + '\n' +
        'CAPTION (ON-SCREEN):\n' + (c.caption || '-') + '\n\n' +
        'POST CAPTION & TAGS:\n' + (postText(c) || '-') + '\n'
    )
    .join('\n\n');
}
