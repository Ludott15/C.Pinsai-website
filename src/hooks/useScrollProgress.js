import { useEffect } from 'react';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * Tracks how far the user has scrolled through a tall "track" element
 * (0 when its top reaches the viewport top, 1 when its bottom reaches the viewport bottom)
 * and hands the value to `onProgress` once per animation frame.
 *
 * With `smoothing` (a time constant in ms) the reported value glides towards the real
 * scroll position instead of jumping to it, so wheel steps and touch flings never cause jolts.
 * The callback is expected to write styles directly, so React never re-renders on scroll.
 */
export function useScrollProgress(ref, onProgress, enabled = true, smoothing = 0) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;

    let frame = 0;
    let target = 0;
    let current = -1;
    let lastTime = 0;

    const read = () => {
      const rect = node.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      return distance > 0 ? clamp01(-rect.top / distance) : 0;
    };

    const tick = (time) => {
      frame = 0;
      target = read();
      const elapsed = lastTime ? Math.min(250, time - lastTime) : 16;
      lastTime = time;

      const next =
        current < 0 || !smoothing ? target : current + (target - current) * (1 - Math.exp(-elapsed / smoothing));
      const settled = Math.abs(target - next) < 0.0004;
      const value = settled ? target : next;

      if (value !== current) {
        current = value;
        onProgress(current);
      }
      if (!settled) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick(performance.now());
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, onProgress, enabled, smoothing]);
}
