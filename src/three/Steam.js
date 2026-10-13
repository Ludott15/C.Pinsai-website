import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from 'three';

/*
 * The pink steam of the C.PINSAI cup, in hero units (coffee surface at y = 0):
 * two wisps of pixels that rise, sway and thin out, and a few bits (0/1) floating up with them.
 * Pixels are snapped to a grid, so the wisps read as pixel art from any angle.
 */

const PINK = '#E04A95';
const PINK_LIGHT = '#F59AC6';
/** Size of one steam pixel, and of the grid the pixels snap to. */
const PIXEL = 5.2;
const HEIGHT = 100;
const PIXELS_PER_WISP = 34;
/*
 * Three wisps leave the coffee at different speeds. Their shape travels upwards with them
 * (wave phase = k·height − ω·time), they widen and break apart as they rise.
 */
const WISPS = [
  { x: -10, z: 4, phase: 0, rise: 3600, sway: 9, wave: 0.0021 },
  { x: 9, z: -3, phase: 2.1, rise: 4300, sway: 8, wave: 0.0017 },
  { x: 0, z: 0, phase: 4.2, rise: 5200, sway: 6, wave: 0.0013 },
];
const BITS = [
  { char: '1', x: -40, phase: 0 },
  { char: '0', x: 38, phase: 0.25 },
  { char: '1', x: 30, phase: 0.5 },
  { char: '0', x: -34, phase: 0.75 },
];
const BIT_CYCLE = 3800;
const BIT_SIZE = 17;

const snap = (value) => Math.round(value / PIXEL) * PIXEL;

function bitTexture(char) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.fillStyle = PINK;
  context.font = '700 52px "JetBrains Mono Variable", ui-monospace, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(char, 32, 35);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createSteam() {
  const group = new Group();

  const geometry = new BoxGeometry(PIXEL, PIXEL, PIXEL);
  /* Unlit (steam is light, not a solid that shades); white base, the per-pixel colours are the real ones. */
  const material = new MeshBasicMaterial({ color: '#FFFFFF', toneMapped: false });
  /* Two pixels per step: the wisp is two pixels wide where it is densest. */
  const count = WISPS.length * PIXELS_PER_WISP * 2;
  const pixels = new InstancedMesh(geometry, material, count);
  pixels.frustumCulled = false;
  /* Every few pixels a lighter one, for some depth. */
  for (let index = 0; index < count; index += 1) {
    pixels.setColorAt(index, new Color(index % 7 === 0 || index % 2 ? PINK_LIGHT : PINK));
  }
  group.add(pixels);

  const textures = BITS.map((bit) => bitTexture(bit.char));
  const bits = BITS.map((bit, index) => {
    const sprite = new Sprite(
      new SpriteMaterial({ map: textures[index], transparent: true, depthWrite: false, toneMapped: false }),
    );
    sprite.scale.set(BIT_SIZE, BIT_SIZE, 1);
    group.add(sprite);
    return sprite;
  });

  const dummy = new Object3D();

  /** Places everything for `time` (ms); `amount` (0 → 1) fades the steam in or out. */
  function update(time, amount) {
    group.visible = amount > 0.001;
    if (!group.visible) return;

    WISPS.forEach((wisp, w) => {
      for (let i = 0; i < PIXELS_PER_WISP; i += 1) {
        /* A fixed pseudo-random value per pixel: its own speed, drift and flicker. */
        const seed = (Math.sin((w + 1) * 91.7 + i * 12.9898) * 43758.5453) % 1;
        const r = Math.abs(seed);
        /* Each pixel leaves the coffee, rises (slightly accelerating) and starts again. */
        const t = (i / PIXELS_PER_WISP + time / (wisp.rise * (0.9 + r * 0.2))) % 1;
        const y = 3 + HEIGHT * (t * 0.8 + t * t * 0.2);
        const wave = t * 5.5 - time * wisp.wave + wisp.phase;
        const spread = wisp.sway * (0.25 + 1.2 * t);
        const x =
          wisp.x +
          Math.sin(wave) * spread +
          Math.sin(t * 13 - time * 0.0031 + r * 6) * 2.5 * t +
          (r - 0.5) * 16 * t * t;
        const z = wisp.z + Math.cos(wave * 0.8) * spread * 0.5;
        /* Grows out of the coffee, thins out at the top, with a light flicker. */
        const flicker = 0.85 + 0.15 * Math.sin(time * 0.006 + r * 20);
        const size = Math.max(0, Math.min(1, t / 0.1, (1 - t) / 0.5)) * flicker * amount;
        const base = (w * PIXELS_PER_WISP + i) * 2;
        dummy.position.set(snap(x), snap(y), snap(z));
        dummy.scale.setScalar(Math.max(0.0001, size));
        dummy.updateMatrix();
        pixels.setMatrixAt(base, dummy.matrix);
        /* The side pixel: only in the thick lower body of the wisp, on the side it sways to. */
        const side = t > 0.08 && t < 0.55 ? size : 0;
        dummy.position.x = snap(x) + (Math.cos(wave) > 0 ? PIXEL : -PIXEL);
        dummy.scale.setScalar(Math.max(0.0001, side));
        dummy.updateMatrix();
        pixels.setMatrixAt(base + 1, dummy.matrix);
      }
    });
    pixels.instanceMatrix.needsUpdate = true;

    bits.forEach((sprite, index) => {
      const t = (time / BIT_CYCLE + BITS[index].phase) % 1;
      /* Bits pop out of the coffee and drift up and outwards, turning slowly. */
      const side = Math.sign(BITS[index].x);
      sprite.position.set(BITS[index].x * (0.5 + t * 0.7) + Math.sin(t * 6 + index) * 4, 6 + t * 92, 14);
      sprite.material.rotation = side * Math.sin(t * 3 + index) * 0.35;
      sprite.material.opacity = Math.min(1, t / 0.15, (1 - t) / 0.35) * amount;
    });
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    pixels.dispose();
    bits.forEach((sprite) => sprite.material.dispose());
    textures.forEach((texture) => texture.dispose());
  }

  return { group, update, dispose };
}
