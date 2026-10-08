/*
 * The cup handle as a real 3D object: a porcelain tube whose centre line is a loop
 * lying in the plane that contains the cup axis (x = 200 in the cup's 400 × 320 space).
 *
 * Every frame the loop is rotated around the axis, moved with the body during the tilt,
 * projected with a light perspective
 * and drawn as a stack of round-capped strokes (outline, body, shading, light, highlight).
 * A tube seen from any direction projects to a constant-width band around its projected
 * centre line, so the handle keeps its thickness and volume even when seen edge-on.
 */

const AXIS_X = 200;
/** Top of the porcelain body: the body is squashed from here while the camera tilts. */
const RIM_Y = 72;
/** Must match `.coffee__shell { transform: scaleY(1 - var(--tilt) * 0.32) }` in hero.css. */
const SHELL_SQUASH = 0.32;
/** Camera distance (cup units) for the perspective of the parts swinging towards the viewer. */
const CAMERA_DISTANCE = 900;
const HANDLE_CENTER_Y = 160;
/** Distance of the joints from the axis: only the part of the loop beyond it is shortened while tilting. */
const JOINT_RADIUS = 96;
/** How much the loop pulls in while the camera tilts, so it never reads as stretched sideways. */
const TILT_PULL_IN = 0.42;

/* Centre line: one cubic Bézier per half of the loop, centred at mid-height of the body,
   from the upper joint to the lower one. */
const CENTER_LINE = [
  [304, 134],
  [332, 122],
  [360, 134],
  [358, 160],
  [356, 186],
  [322, 196],
  [285, 184],
];

/*
 * Stroke stack. Offsets are in screen direction (light from the upper left, like the cup body),
 * so the shading stays coherent while the tube turns.
 */
export const HANDLE_LAYERS = [
  { id: 'outline', width: 18, color: '#4B2D20', dx: 0, dy: 0, opacity: 1 },
  { id: 'body', width: 12, color: '#F5EFE2', dx: 0, dy: 0, opacity: 1 },
  { id: 'core', width: 8, color: '#FBF8F1', dx: -1.1, dy: -1.3, opacity: 1 },
  { id: 'shade', width: 2.8, color: '#4B2D20', dx: 3.2, dy: 3.4, opacity: 0.16 },
  { id: 'light', width: 4, color: '#FFFFFF', dx: -1.9, dy: -2.2, opacity: 1 },
  { id: 'spark', width: 1.5, color: '#FFFFFF', dx: -3.2, dy: -3.5, opacity: 0.95 },
];

const format = (value) => value.toFixed(2);

/** Rotates the loop by `turn` degrees around the cup axis and projects it on screen. */
function projectCenterLine(turn, tilt) {
  const radians = (turn * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const squash = 1 - tilt * SHELL_SQUASH;

  const reach = 1 - tilt * TILT_PULL_IN;

  return CENTER_LINE.map(([x, y]) => {
    const radius = JOINT_RADIUS + (x - AXIS_X - JOINT_RADIUS) * reach;
    const depth = -radius * sin;
    const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - depth);
    /* The handle follows the body while it squashes, but keeps its own proportions:
       squashing the loop too would stretch it sideways during the tilt. */
    const pivotY = RIM_Y + (HANDLE_CENTER_Y - RIM_Y) * squash;
    return [AXIS_X + radius * cos * scale, pivotY + (y - HANDLE_CENTER_Y) * scale];
  });
}

function toPath(points, dx, dy) {
  const [start, ...curves] = points.map(([x, y]) => `${format(x + dx)} ${format(y + dy)}`);
  return `M${start} C ${curves.slice(0, 3).join(', ')} C ${curves.slice(3).join(', ')}`;
}

/** Path data of every layer for a given rotation (degrees) and camera tilt (0 → 1). */
export function getHandlePaths(turn = 0, tilt = 0) {
  const points = projectCenterLine(turn, tilt);
  return HANDLE_LAYERS.map((layer) => toPath(points, layer.dx, layer.dy));
}

/** Redraws the handle in place, without going through React. */
export function updateHandle(svg, turn, tilt) {
  if (!svg) return;
  const paths = getHandlePaths(turn, tilt);
  svg.querySelectorAll('path').forEach((path, index) => path.setAttribute('d', paths[index]));
}
