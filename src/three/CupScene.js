import {
  BackSide,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/*
 * The hero cup: the C.PINSAI ceramic cup (src/assets/cpinsai-cup.glb).
 *
 * The scene works in the units of the 400-wide hero cup box, with y pointing up and the
 * coffee surface at y = 0, so the model lines up with the dive portal (which opens from
 * the coffee) and with the fallback image. The scroll timeline drives it:
 * --turn rotates the cup, --tilt raises the camera to look into it, --zoom dollies in.
 *
 * The ivory body sits on a cream page, almost the same colour: contrast comes from light,
 * not from paint. A soft key from the top left casts real shadows (cup on saucer, saucer
 * on the table), and two back lights plus a studio environment draw bright rims along the
 * glossy edges, product-shot style. Base colours stay those of the model.
 */

/* Model space (metres) → hero units. */
const MODEL_SCALE = 1950;
/** Height of the coffee surface in the model (top of the meniscus). */
const MODEL_COFFEE_Y = 0.0697;
const FOV = 20;
const START_ELEVATION = 12;
const TILT_ELEVATION = 40;
/* The dive portal and the Coffee Check are var(--brown-800): as the camera approaches, the
   coffee settles on that same brown, so the circle that opens from it has no seam. */
const DIVE_BROWN = new Color('#2A1810');
const BLACK = new Color(0, 0, 0);
/** Dark, smooth coffee: a clean highlight, not a mirror that would wash out the brown. */
const COFFEE_EXPOSURE = 0.62;
const COFFEE_GLOSS = { clearcoat: 0.5, specularIntensity: 0.5, envMapIntensity: 0.25 };
const DARKEN_FROM = 0.36;
const DARKEN_TO = 0.56;

/*
 * Proportions, adjusted on the loaded geometry (model space, metres):
 * a narrower, squarer cup (the front reads as a square, the mouth too), the handle pulled in
 * closer to the body, a slightly smaller saucer with a thick navy lip like the cup's.
 */
const CUP_NARROW_X = 0.76;
const CUP_NARROW_Z = 0.88;
/** Handle: the part outside the wall is squeezed towards it. */
const HANDLE_ROOT_X = 0.04;
const HANDLE_SQUEEZE = 0.78;
const SAUCER_SCALE = 0.86;
/** Saucer lip: a navy ring as thick as the cup's rim, all round the edge. */
const LIP = { radius: 0.0727, tube: 0.0017, y: 0.0106 };

function reshape(node) {
  const name = node.name.replace(/_/g, ' ');
  const position = node.geometry.attributes.position;
  const cupPart = /^(Cup|Handle|Coffee)/.test(name);
  const saucerPart = /^Saucer/.test(name);
  for (let index = 0; index < position.count; index += 1) {
    let x = position.getX(index);
    let z = position.getZ(index);
    if (/^Handle/.test(name)) {
      if (x > HANDLE_ROOT_X) x = HANDLE_ROOT_X + (x - HANDLE_ROOT_X) * HANDLE_SQUEEZE;
      position.setX(index, x * CUP_NARROW_X);
      continue;
    }
    if (cupPart) {
      x *= CUP_NARROW_X;
      z *= CUP_NARROW_Z;
    } else if (saucerPart) {
      x *= SAUCER_SCALE;
      z *= SAUCER_SCALE;
    }
    position.setX(index, x);
    position.setZ(index, z);
  }
  position.needsUpdate = true;
}

/* Contact shadow: the darkest, tightest shade right under the saucer. */
function contactTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(42, 24, 16, 0.5)');
  gradient.addColorStop(0.62, 'rgba(42, 24, 16, 0.34)');
  gradient.addColorStop(0.8, 'rgba(42, 24, 16, 0.1)');
  gradient.addColorStop(1, 'rgba(42, 24, 16, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/*
 * Studio environment for reflections: a warm, dim room with softboxes, one above and two
 * strips behind. On glossy ceramic they read as clean highlights and rim lines.
 */
function studioScene() {
  const studio = new Scene();
  studio.add(new Mesh(new SphereGeometry(10, 32, 16), new MeshBasicMaterial({ color: '#4a3f38', side: BackSide })));
  const panel = (width, height, intensity, position) => {
    const mesh = new Mesh(
      new PlaneGeometry(width, height),
      new MeshBasicMaterial({ color: new Color(1, 0.98, 0.95).multiplyScalar(intensity) }),
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  };
  panel(8, 4, 3, [-2, 7, 3]);
  panel(1.2, 10, 14, [-7, 1, -4]);
  panel(1.2, 10, 14, [7, 1, -4]);
  panel(0.8, 8, 8, [-8, 1, 3]);
  panel(6, 4, 1.2, [0, 1.5, 8]);
  return studio;
}

/* glTF colour factors are linear; this model stores its sRGB brand colours there. */
function ceramic(source, options) {
  const color = source.color.clone().convertSRGBToLinear();
  return new MeshPhysicalMaterial({
    color,
    roughness: source.roughness,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.06,
    ...options,
  });
}

/**
 * Creates the scene on `canvas`. Returns controls to feed it the scroll state and the layout
 * of the hero (where the cup box sits on the sticky stage).
 */
export async function createCupScene({ canvas, modelUrl, maxPixelRatio = 2 }) {
  const gltf = await new GLTFLoader().loadAsync(modelUrl);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studioScene(), 0.02).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.8;

  scene.add(new HemisphereLight('#FBF8F1', '#8A6E58', 0.38));

  /* Front fill, from the viewer: keeps the ivory bright where it faces the camera. */
  const fill = new DirectionalLight('#FFF9F0', 0.45);
  fill.position.set(80, 120, 600);
  scene.add(fill);

  /* Key: soft, from the top left, the only light that casts shadows. */
  const key = new DirectionalLight('#FFF8EE', 2.6);
  key.position.set(-400, 640, 280);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.6;
  Object.assign(key.shadow.camera, { left: -260, right: 260, top: 260, bottom: -260, near: 100, far: 1600 });
  scene.add(key);

  /* Back lights: bright rims on both sides of the silhouette, separating ivory from cream. */
  const rimRight = new DirectionalLight('#FFFFFF', 3.6);
  rimRight.position.set(460, 320, -420);
  scene.add(rimRight);
  const rimLeft = new DirectionalLight('#FFF1E0', 2.2);
  rimLeft.position.set(-460, 200, -420);
  scene.add(rimLeft);

  /* The model, scaled to hero units with the coffee surface at y = 0. */
  const model = gltf.scene;
  const coffeeMaterials = [];
  let navy = null;
  const thinRims = [];
  model.traverse((node) => {
    if (!node.isMesh) return;
    reshape(node);
    /* The export carries positions only: smooth normals are rebuilt here. */
    node.geometry.computeVertexNormals();
    if (/^Saucer.Outer.Rim/.test(node.name)) thinRims.push(node);
    const isNavy = /navy/i.test(node.material.name);
    const coffee = /coffee/i.test(node.material.name);
    node.material = ceramic(
      node.material,
      /* Not tone mapped: the curve would shift the final brown away from the page's. */
      coffee
        ? { ...COFFEE_GLOSS, clearcoatRoughness: 0.04, roughness: 0.3, toneMapped: false }
        : {},
    );
    if (isNavy) navy = node.material;
    if (coffee) {
      /* The top light falls straight on the liquid: compensate, so it reads as the brand brown. */
      node.material.color.multiplyScalar(COFFEE_EXPOSURE);
      coffeeMaterials.push({ material: node.material, base: node.material.color.clone() });
    }
    node.castShadow = !coffee;
    node.receiveShadow = true;
  });
  /* The exported saucer rim is a thin band: replaced by a round navy lip. */
  thinRims.forEach((node) => node.removeFromParent());
  const lipGeometry = new TorusGeometry(LIP.radius * SAUCER_SCALE, LIP.tube, 20, 160);
  const lip = new Mesh(lipGeometry, navy);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = LIP.y;
  lip.castShadow = true;
  lip.receiveShadow = true;
  model.add(lip);

  const cup = new Group();
  cup.add(model);
  cup.scale.setScalar(MODEL_SCALE);
  cup.position.y = -MODEL_COFFEE_Y * MODEL_SCALE;
  scene.add(cup);

  /* The table: real shadow from the key light, plus a tight contact shade under the saucer. */
  const tableY = cup.position.y - 0.4;
  const groundGeometry = new PlaneGeometry(900, 900);
  const groundMaterial = new ShadowMaterial({ color: '#2A1810', opacity: 0.22 });
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = tableY;
  ground.receiveShadow = true;
  scene.add(ground);

  const contactMap = contactTexture();
  const contactGeometry = new PlaneGeometry(1, 1);
  const contactMaterial = new MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false });
  const contact = new Mesh(contactGeometry, contactMaterial);
  contact.rotation.x = -Math.PI / 2;
  contact.scale.set(300, 300, 1);
  contact.position.y = tableY + 0.2;
  scene.add(contact);

  const camera = new PerspectiveCamera(FOV, 1, 1, 20000);
  const layout = { width: 1, height: 1, x: 0.5, y: 0.5, unit: 1 };
  const state = { turn: 0, tilt: 0, zoom: 1, darken: 0 };
  let active = true;
  let dirty = true;
  let frame = 0;

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

  function render() {
    cup.rotation.y = MathUtils.degToRad(state.turn);
    coffeeMaterials.forEach(({ material, base }) => {
      /* Lit colour out, flat (emissive) brown in: at the end the light no longer changes it. */
      material.color.lerpColors(base, BLACK, state.darken);
      material.emissive.copy(DIVE_BROWN).multiplyScalar(state.darken);
      material.clearcoat = COFFEE_GLOSS.clearcoat * (1 - state.darken);
      material.specularIntensity = COFFEE_GLOSS.specularIntensity * (1 - state.darken);
      material.envMapIntensity = COFFEE_GLOSS.envMapIntensity * (1 - state.darken);
    });
    placeCamera();
    renderer.render(scene, camera);
  }

  /* Renders only when the scroll state or the layout change. */
  function loop() {
    frame = requestAnimationFrame(loop);
    if (!dirty) return;
    dirty = false;
    render();
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
      state.darken = MathUtils.smootherstep(next['--p'], DARKEN_FROM, DARKEN_TO);
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
      [groundGeometry, groundMaterial, contactGeometry, contactMaterial, contactMap].forEach((item) => item.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
