import { useEffect } from 'react';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * Tracks how far the user has scrolled through a tall "track" element
 * (0 when its top reaches the viewport top, 1 when its bottom reaches the viewport bottom)
 * and hands the value to `onProgress` once per animation frame.
 * The callback is expected to write styles directly, so React never re-renders on scroll.
 */
export function useScrollProgress(ref, onProgress, enabled = true) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;

    let frame = 0;
    let last = -1;

    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = distance > 0 ? clamp01(-rect.top / distance) : 0;
      if (progress !== last) {
        last = progress;
        onProgress(progress);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, onProgress, enabled]);
}
