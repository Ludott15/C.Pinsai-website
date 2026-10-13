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
const HEIGHT = 92;
const PIXELS_PER_WISP = 34;
const WISPS = [
  { x: -12, z: 4, phase: 0, speed: 0.000085, sway: 13 },
  { x: 12, z: -4, phase: 2.4, speed: 0.00007, sway: 11 },
];
/* Bits float beside the wisps, slightly in front of them. */
const BITS = [
  { char: '1', x: -40, phase: 0 },
  { char: '0', x: 38, phase: 0.25 },
  { char: '1', x: 30, phase: 0.5 },
  { char: '0', x: -34, phase: 0.75 },
];
const BIT_CYCLE = 4600;
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
        /* Each pixel travels up the wisp and starts again at the bottom. */
        const t = (i / PIXELS_PER_WISP + time * wisp.speed) % 1;
        const y = 6 + t * HEIGHT;
        const x = wisp.x + Math.sin(t * 5.2 + wisp.phase + time * 0.0011) * wisp.sway * (0.35 + t);
        const z = wisp.z + Math.cos(t * 4 + wisp.phase) * 4;
        /* Small at the start, full in the middle, gone at the top. */
        const size = Math.min(1, t / 0.12, (1 - t) / 0.45) * amount;
        const base = (w * PIXELS_PER_WISP + i) * 2;
        dummy.position.set(snap(x), snap(y), snap(z));
        dummy.scale.setScalar(Math.max(0.0001, size));
        dummy.updateMatrix();
        pixels.setMatrixAt(base, dummy.matrix);
        /* The side pixel: only in the body of the wisp, on the side it sways towards. */
        const side = t > 0.12 && t < 0.62 ? size : 0;
        dummy.position.x = snap(x) + (Math.cos(t * 5.2 + wisp.phase) > 0 ? PIXEL : -PIXEL);
        dummy.scale.setScalar(Math.max(0.0001, side));
        dummy.updateMatrix();
        pixels.setMatrixAt(base + 1, dummy.matrix);
      }
    });
    pixels.instanceMatrix.needsUpdate = true;

    bits.forEach((sprite, index) => {
      const t = (time / BIT_CYCLE + BITS[index].phase) % 1;
      sprite.position.set(BITS[index].x + Math.sin(t * 6 + index) * 5, 18 + t * 80, 14);
      sprite.material.opacity = Math.min(1, t / 0.2, (1 - t) / 0.35) * amount;
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
