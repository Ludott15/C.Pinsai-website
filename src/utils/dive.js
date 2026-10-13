const clamp01 = (value) => Math.min(1, Math.max(0, value));
const segment = (progress, start, end) => clamp01((progress - start) / (end - start));
/* Soft curves with zero speed at both ends: every phase fades in and out of the next one. */
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const smootherstep = (t) => t * t * t * (t * (6 * t - 15) + 10);

/** Maximum Y rotation of the cup, in degrees: the handle swings in front of the body and around. */
const MAX_TURN = -160;
/** How close the camera gets to the coffee surface at the end of the dive. */
const MAX_ZOOM = 7;

/**
 * Maps the scroll progress through the hero track (0 → 1) to the timeline of the dive:
 * text leaves, the cup turns and tilts, the camera approaches the coffee and finally falls into it.
 * Phases overlap so the movement never stops and restarts between them.
 */
export function getDiveState(progress) {
  const turn = easeInOutSine(segment(progress, 0, 0.56)) * MAX_TURN;
  const radians = (turn * Math.PI) / 180;

  return {
    '--p': progress,
    '--text': easeInOutSine(segment(progress, 0, 0.26)),
    '--turn': turn,
    '--sin': Math.sin(radians),
    '--cos': Math.cos(radians),
    '--tilt': smootherstep(segment(progress, 0.14, 0.6)),
    /* Exponential dolly: the approach feels like a constant-speed camera move. */
    '--zoom': MAX_ZOOM ** smootherstep(segment(progress, 0.28, 0.86)),
    '--steam': 1 - smootherstep(segment(progress, 0.18, 0.46)),
    '--fill': smootherstep(segment(progress, 0.54, 0.88)),
    '--dive': smootherstep(segment(progress, 0.66, 0.86)),
    '--steps': segment(progress, 0.74, 0.9),
    '--out': smootherstep(segment(progress, 0.93, 1)),
  };
}

export function applyDiveState(node, progress) {
  const state = getDiveState(progress);
  Object.entries(state).forEach(([name, value]) => {
    node.style.setProperty(name, value.toFixed(4));
  });
  /* The cup is composited flat (crisper while zooming), so depth is resolved by stacking:
     the handle is drawn over the body only while it swings towards the viewer. */
  node.style.setProperty('--handle-layer', state['--sin'] < -0.05 ? '2' : '0');
  node.dataset.phase = progress < 0.2 ? 'surface' : progress < 0.9 ? 'dive' : 'deep';
  return state;
}

export function clearDiveState(node) {
  Object.keys(getDiveState(0)).forEach((name) => node.style.removeProperty(name));
  ['--cx', '--cy', '--handle-layer'].forEach((name) => node.style.removeProperty(name));
  delete node.dataset.phase;
}
