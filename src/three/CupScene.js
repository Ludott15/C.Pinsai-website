import {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
 * The hero cup: the C.PINSAI voxel cup (src/assets/cpinsai-cup.glb).
 *
 * The scene works in the units of the 400-wide hero cup box, with y pointing up and the
 * coffee surface at y = 0, so the model lines up with the dive portal (which opens from
 * the coffee) and with the fallback image. The scroll timeline drives it:
 * --turn rotates the cup, --tilt raises the camera to look into it, --zoom dollies in.
 * The pixel steam and the floating bits of the model are animated here.
 */

/* Model space (metres, as exported from Blender) → hero units. */
const MODEL_SCALE = 100;
/** Height of the coffee surface in the model. */
const MODEL_COFFEE_Y = 1.8;
const FOV = 20;
const START_ELEVATION = 12;
const TILT_ELEVATION = 40;
/** The steam fades out early in the dive, before the camera gets close. */
const STEAM_UNTIL = 0.46;
const STEAM_NODES = ['Fumo pixel 0', 'Fumo pixel 1'];
const BIT_PREFIX = 'Numero pixel';
/** How far a bit rises (model units) during one cycle, and how long a cycle lasts (ms). */
const BIT_RISE = 0.45;
const BIT_CYCLE = 4200;

function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(42, 24, 16, 0.42)');
  gradient.addColorStop(0.55, 'rgba(42, 24, 16, 0.18)');
  gradient.addColorStop(1, 'rgba(42, 24, 16, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/* Gives every animated part its own material, so each one can fade on its own. */
function ownMaterial(mesh) {
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
    }
  });
}

function setOpacity(object, opacity) {
  object.traverse((child) => {
    if (child.isMesh) child.material.opacity = opacity;
  });
}

/**
 * Creates the scene on `canvas`. Returns controls to feed it the scroll state and the layout
 * of the hero (where the cup box sits on the sticky stage).
 */
export async function createCupScene({ canvas, modelUrl, maxPixelRatio = 2, animate = true }) {
  const gltf = await new GLTFLoader().loadAsync(modelUrl);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.45;

  scene.add(new HemisphereLight('#FBF8F1', '#4B2D20', 0.8));
  scene.add(new AmbientLight('#F5EFE2', 0.35));
  const key = new DirectionalLight('#FFFFFF', 1.8);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new DirectionalLight('#F5EFE2', 0.5);
  rim.position.set(4, 2, -3);
  scene.add(rim);

  /* The model, scaled to hero units with the coffee surface at y = 0. */
  const model = gltf.scene;
  const cup = new Group();
  cup.add(model);
  cup.scale.setScalar(MODEL_SCALE);
  cup.position.y = -MODEL_COFFEE_Y * MODEL_SCALE;
  scene.add(cup);

  /* The loader turns spaces in node names into underscores: compare names without them. */
  const plainName = (node) => node.name.replace(/_/g, ' ');
  const steam = [];
  const bits = [];
  model.traverse((node) => {
    if (STEAM_NODES.includes(plainName(node))) steam.push(node);
    else if (plainName(node).startsWith(BIT_PREFIX)) bits.push(node);
  });
  [...steam, ...bits].forEach(ownMaterial);
  const bitBase = bits.map((bit) => bit.position.y);

  /* Soft shadow on the table under the saucer. */
  const shadowMap = shadowTexture();
  const shadowGeometry = new PlaneGeometry(1, 1);
  const shadowMaterial = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
  const shadow = new Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(4.2, 3.9, 1);
  shadow.position.y = -0.005;
  model.add(shadow);

  const camera = new PerspectiveCamera(FOV, 1, 1, 20000);
  const layout = { width: 1, height: 1, x: 0.5, y: 0.5, unit: 1 };
  const state = { turn: 0, tilt: 0, zoom: 1, steam: 1, progress: 0 };
  let active = true;
  let dirty = true;
  let frame = 0;
  let last = 0;

  function placeCamera() {
    const distance = layout.height / (2 * Math.tan(MathUtils.degToRad(FOV / 2))) / layout.unit / state.zoom;
    const elevation = MathUtils.degToRad(START_ELEVATION + state.tilt * TILT_ELEVATION);
    camera.position.set(0, distance * Math.sin(elevation), distance * Math.cos(elevation));
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(1, distance * 0.05);
    camera.far = distance + 4000;
    camera.aspect = layout.width / layout.height;
    camera.setViewOffset(
      layout.width,
      layout.height,
      layout.width / 2 - layout.x,
      layout.height / 2 - layout.y,
      layout.width,
      layout.height,
    );
    camera.updateProjectionMatrix();
  }

  /* Pixel steam sways and breathes; the bits rise and fade, one after the other. */
  function animateSteam(time) {
    steam.forEach((wisp, index) => {
      const phase = time / 1300 + index * 1.7;
      wisp.rotation.z = Math.sin(phase) * 0.035;
      wisp.scale.y = 1 + Math.sin(phase * 0.8) * 0.035;
      setOpacity(wisp, state.steam);
    });
    bits.forEach((bit, index) => {
      const t = ((time + index * (BIT_CYCLE / bits.length)) % BIT_CYCLE) / BIT_CYCLE;
      bit.position.y = bitBase[index] + t * BIT_RISE;
      const fade = Math.min(1, t / 0.2, (1 - t) / 0.3);
      setOpacity(bit, fade * state.steam);
    });
  }

  function render(time) {
    cup.rotation.y = MathUtils.degToRad(state.turn);
    placeCamera();
    if (animate) animateSteam(time);
    renderer.render(scene, camera);
  }

  /* Renders on scroll changes, plus a 30 fps steam animation while the steam is visible. */
  function loop(time) {
    frame = requestAnimationFrame(loop);
    const steaming = animate && state.progress < STEAM_UNTIL;
    if (!dirty && !(steaming && time - last > 33)) return;
    dirty = false;
    last = time;
    render(time);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  start();

  return {
    setState(next) {
      state.turn = next['--turn'];
      state.tilt = next['--tilt'];
      state.zoom = next['--zoom'];
      state.steam = 1 - MathUtils.smoothstep(next['--p'], 0.18, STEAM_UNTIL);
      state.progress = next['--p'];
      dirty = true;
    },
    setLayout({ width, height, x, y, unit }) {
      Object.assign(layout, { width, height, x, y, unit });
      renderer.setSize(width, height, false);
      dirty = true;
    },
    setActive(value) {
      if (value === active) return;
      active = value;
      if (active) {
        dirty = true;
        start();
      } else {
        stop();
      }
    },
    dispose() {
      stop();
      model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      shadowMap.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
