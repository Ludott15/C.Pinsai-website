const clamp01 = (value) => Math.min(1, Math.max(0, value));
const segment = (progress, start, end) => clamp01((progress - start) / (end - start));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - (1 - t) ** 3;

/** Maximum Y rotation of the cup, in degrees: the handle swings in front of the body and around. */
const MAX_TURN = -160;
/** How close the camera gets to the coffee surface at the end of the dive. */
const MAX_ZOOM = 7;

/**
 * Maps the scroll progress through the hero track (0 → 1) to the timeline of the dive:
 * text leaves, the cup turns and tilts, the camera approaches the coffee and finally falls into it.
 */
export function getDiveState(progress) {
  const turn = easeInOut(segment(progress, 0, 0.5)) * MAX_TURN;
  const radians = (turn * Math.PI) / 180;

  return {
    '--p': progress,
    '--text': easeOut(segment(progress, 0.02, 0.24)),
    '--turn': turn,
    '--sin': Math.sin(radians),
    '--cos': Math.cos(radians),
    '--tilt': easeInOut(segment(progress, 0.18, 0.55)),
    '--zoom': 1 + easeIn(segment(progress, 0.32, 0.82)) * (MAX_ZOOM - 1),
    '--steam': 1 - segment(progress, 0.2, 0.42),
    '--fill': easeInOut(segment(progress, 0.58, 0.86)),
    '--dive': segment(progress, 0.74, 0.88),
    '--steps': segment(progress, 0.8, 0.98),
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
  node.dataset.phase = progress < 0.2 ? 'surface' : progress < 0.88 ? 'dive' : 'deep';
  return state;
}

export function clearDiveState(node) {
  Object.keys(getDiveState(0)).forEach((name) => node.style.removeProperty(name));
  ['--cx', '--cy', '--handle-layer'].forEach((name) => node.style.removeProperty(name));
  delete node.dataset.phase;
}
