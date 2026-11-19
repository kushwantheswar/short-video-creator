let apiPromise = null;

/** Loads the official YouTube IFrame Player API once. */
export function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        resolve(window.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = (e) => reject(new Error('Failed to load YouTube player script'));
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

/** Check if Cobalt or open video proxy is accessible */
export async function fetchVideoMeta(videoId) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'YouTube Video',
        author: data.author_name || '',
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (e) {
    // fallback
  }
  return {
    title: 'YouTube Video',
    author: '',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}
