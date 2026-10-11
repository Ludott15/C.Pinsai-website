import {
  AmbientLight,
  BackSide,
  CanvasTexture,
  CircleGeometry,
  CubicBezierCurve3,
  CurvePath,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HANDLE_CENTER_LINE } from '../utils/handle.js';

/*
 * The hero cup as a real 3D model.
 *
 * Units are the same as the SVG cup (a 400-wide drawing), with y pointing up and the
 * coffee surface at y = 0, so the WebGL cup lines up exactly with the steam, the dive
 * portal and the SVG fallback. The scroll timeline drives the same values as before:
 * --turn rotates the cup, --tilt raises the camera to look into it, --zoom dollies in.
 */

const COLORS = {
  white: '#FFFFFF',
  cream: '#F5EFE2',
  cream50: '#FBF8F1',
  pink: '#E04A95',
  brown: '#4B2D20',
  brown800: '#2A1810',
  brown900: '#1C100B',
};

/** SVG y of the coffee surface: world y = SURFACE_Y - svg y. */
const SURFACE_Y = 76;
const FOV = 20;
const START_ELEVATION = 12;
const TILT_ELEVATION = 40;
const OUTLINE = 2.4;

const toWorldY = (svgY) => SURFACE_Y - svgY;

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/* Outer silhouette of the body, from the base up to the rim: [radius, world y]. */
const BODY_CURVE = [
  [28, toWorldY(236)],
  [82, toWorldY(226)],
  [114, toWorldY(150)],
  [116, toWorldY(72)],
];
const bodyAt = (t) => cubic(...BODY_CURVE, t);

/** Body radius at a given world height (the curve is monotonic in y). */
function bodyRadiusAt(y) {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (bodyAt(mid)[1] < y) low = mid;
    else high = mid;
  }
  return bodyAt((low + high) / 2)[0];
}

/* Returns the full solid profile and, separately, the outer skin used for the brown contour
   (the contour must not include the points on the axis, which would turn into spikes). */
function bodyProfile() {
  const foot = [
    [0, -169],
    [42, -169],
    [47, -173.5],
    [55, -173],
    [58, -169],
    [57, -164],
    [53, -161.5],
  ];
  let start = 0;
  while (bodyAt(start)[0] < 55) start += 0.01;
  const outer = [];
  for (let i = 0; i <= 28; i += 1) outer.push(bodyAt(start + ((1 - start) * i) / 28));
  const lip = [
    [117.2, 5.6],
    [115.8, 7.7],
    [113, 8.3],
    [110.4, 7.3],
    [109.2, 5],
  ];
  const inner = [];
  for (let i = 0; i <= 18; i += 1) {
    const [r, y] = bodyAt(1 - (0.62 * i) / 18);
    inner.push([r - 7, y - 1]);
  }
  const bottom = inner[inner.length - 1];
  const toVectors = (points) => points.map(([x, y]) => new Vector2(x, y));
  return {
    solid: toVectors([...foot, ...outer, ...lip, ...inner, [0, bottom[1] - 4]]),
    skin: toVectors([...foot.slice(1), ...outer, ...lip.slice(0, 3)]),
  };
}

const SAUCER_PROFILE = [
    [0, -175],
    [62, -175],
    [104, -173.4],
    [111, -171.6],
    [118, -172],
    [150, -169.5],
    [174, -165.6],
    [179.5, -165.4],
    [180.5, -168],
    [178, -170.6],
    [168, -173],
    [130, -178.5],
    [121, -182.5],
    [117, -185],
    [110, -185],
    [106, -181.5],
    [0, -180.5],
];
const saucerProfile = (from = 0, to = SAUCER_PROFILE.length) =>
  SAUCER_PROFILE.slice(from, to).map(([x, y]) => new Vector2(x, y));

/** Height of the saucer's top face at a given radius. */
function saucerTopAt(radius) {
  for (let i = 1; i < 7; i += 1) {
    const [r0, y0] = SAUCER_PROFILE[i - 1];
    const [r1, y1] = SAUCER_PROFILE[i];
    if (radius <= r1) return y0 + ((radius - r0) / (r1 - r0)) * (y1 - y0);
  }
  return SAUCER_PROFILE[6][1];
}

/* Thin painted band hugging the body between two heights (decoration, filet). */
function bodyBand(yTop, yBottom, offset) {
  return new LatheGeometry(
    [new Vector2(bodyRadiusAt(yBottom) + offset, yBottom), new Vector2(bodyRadiusAt(yTop) + offset, yTop)],
    160,
  );
}

/* Inverted hull: the brand's brown contour, drawn as the back faces of a slightly fatter copy. */
function outlineOf(geometry, thickness, material) {
  const hull = geometry.clone();
  hull.computeVertexNormals();
  const position = hull.attributes.position;
  const normal = hull.attributes.normal;
  for (let i = 0; i < position.count; i += 1) {
    position.setXYZ(
      i,
      position.getX(i) + normal.getX(i) * thickness,
      position.getY(i) + normal.getY(i) * thickness,
      position.getZ(i) + normal.getZ(i) * thickness,
    );
  }
  return new Mesh(hull, material);
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const result = draw(context, canvas) ?? {};
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, ...result };
}

function coffeeTexture() {
  return canvasTexture(512, 512, (context) => {
    const body = context.createRadialGradient(236, 226, 10, 256, 256, 256);
    body.addColorStop(0, COLORS.brown);
    body.addColorStop(0.55, COLORS.brown800);
    body.addColorStop(1, COLORS.brown900);
    context.fillStyle = body;
    context.fillRect(0, 0, 512, 512);
    const crema = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    crema.addColorStop(0.72, 'rgba(245, 239, 226, 0)');
    crema.addColorStop(0.9, 'rgba(245, 239, 226, 0.3)');
    crema.addColorStop(1, 'rgba(245, 239, 226, 0.08)');
    context.fillStyle = crema;
    context.fillRect(0, 0, 512, 512);
  });
}

function blobTexture(color, alpha) {
  return canvasTexture(256, 256, (context) => {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
    gradient.addColorStop(0.55, `rgba(${color}, ${alpha * 0.45})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  });
}

/* Printed logo for the curved decal. Returns where the pink dot lands (0 → 1 across the decal). */
function logoTexture(brandName) {
  const [initial, rest] = brandName.split('.');
  return canvasTexture(2048, 420, (context, canvas) => {
    const size = 300;
    context.font = `800 ${size}px "Bricolage Grotesque Variable", system-ui, sans-serif`;
    context.textBaseline = 'alphabetic';
    const gap = size * 0.06;
    const dot = size * 0.2;
    const initialWidth = context.measureText(initial).width;
    const restWidth = context.measureText(rest).width;
    const total = initialWidth + gap + dot + gap + restWidth;
    const x = (canvas.width - total) / 2;
    const baseline = canvas.height / 2 + size * 0.35;

    context.fillStyle = COLORS.brown;
    context.fillText(initial, x, baseline);
    context.fillText(rest, x + initialWidth + gap * 2 + dot, baseline);
    const dotX = x + initialWidth + gap + dot / 2;
    const dotY = baseline - dot / 2;
    context.fillStyle = COLORS.pink;
    context.beginPath();
    context.arc(dotX, dotY, dot / 2, 0, Math.PI * 2);
    context.fill();

    return { dotU: dotX / canvas.width, dotV: dotY / canvas.height };
  });
}

function glowTexture() {
  return canvasTexture(128, 128, (context) => {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(224, 74, 149, 0.95)');
    gradient.addColorStop(0.28, 'rgba(224, 74, 149, 0.55)');
    gradient.addColorStop(1, 'rgba(224, 74, 149, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  });
}

function handleCurve() {
  const points = HANDLE_CENTER_LINE.map(([x, y]) => new Vector3(x - 200, toWorldY(y), 0));
  const path = new CurvePath();
  path.add(new CubicBezierCurve3(points[0], points[1], points[2], points[3]));
  path.add(new CubicBezierCurve3(points[3], points[4], points[5], points[6]));
  return path;
}

/**
 * Creates the scene on `canvas`. Returns controls to feed it the scroll state and the layout
 * of the hero (where the cup box sits on the sticky stage).
 */
export async function createCupScene({ canvas, brandName, maxPixelRatio = 2 }) {
  await document.fonts?.load('800 100px "Bricolage Grotesque Variable"');

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.55;

  scene.add(new HemisphereLight(COLORS.cream50, COLORS.brown, 0.7));
  scene.add(new AmbientLight(COLORS.cream, 0.25));
  const key = new DirectionalLight(COLORS.white, 1.7);
  key.position.set(-320, 520, 420);
  scene.add(key);
  const rim = new DirectionalLight(COLORS.cream, 0.5);
  rim.position.set(380, 160, -260);
  scene.add(rim);

  const disposables = [environment, pmrem];
  const track = (...items) => {
    disposables.push(...items);
    return items[0];
  };

  const porcelain = track(
    new MeshPhysicalMaterial({
      color: COLORS.white,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      side: DoubleSide,
    }),
  );
  const outline = track(new MeshBasicMaterial({ color: COLORS.brown, side: BackSide }));
  const withOutline = (parent, geometry, skin) => {
    parent.add(new Mesh(geometry, porcelain));
    const hull = outlineOf(skin, OUTLINE, outline);
    track(skin, hull.geometry);
    parent.add(hull);
  };

  const root = new Group();
  const cup = new Group();
  root.add(cup);
  scene.add(root);

  /* Saucer */
  const saucerGeometry = track(new LatheGeometry(saucerProfile(), 160));
  withOutline(root, saucerGeometry, new LatheGeometry(saucerProfile(4, 15), 160));
  const saucerLine = track(
    new LatheGeometry([new Vector2(158, saucerTopAt(158) + 0.35), new Vector2(161.5, saucerTopAt(161.5) + 0.35)], 160),
  );
  const pinkPaint = track(new MeshStandardMaterial({ color: COLORS.pink, roughness: 0.35, side: DoubleSide }));
  root.add(new Mesh(saucerLine, pinkPaint));

  /* Soft shadows: on the table under the saucer, and where the cup sits */
  const shadow = blobTexture('42, 24, 16', 0.42);
  const contact = blobTexture('28, 16, 11', 0.55);
  track(shadow.texture, contact.texture);
  const table = new Mesh(
    track(new PlaneGeometry(470, 470)),
    track(new MeshBasicMaterial({ map: shadow.texture, transparent: true, depthWrite: false })),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = -189;
  table.scale.set(1, 0.92, 1);
  root.add(table);
  const seat = new Mesh(
    track(new PlaneGeometry(170, 170)),
    track(new MeshBasicMaterial({ map: contact.texture, transparent: true, depthWrite: false })),
  );
  seat.rotation.x = -Math.PI / 2;
  seat.position.y = -174.6;
  root.add(seat);

  /* Cup body */
  const profile = bodyProfile();
  const bodyGeometry = track(new LatheGeometry(profile.solid, 180));
  withOutline(cup, bodyGeometry, new LatheGeometry(profile.skin, 180));

  const band = new Mesh(track(bodyBand(toWorldY(96), toWorldY(100.5), 0.3)), pinkPaint);
  cup.add(band);
  const filet = new Mesh(
    track(bodyBand(toWorldY(106), toWorldY(107), 0.3)),
    track(new MeshBasicMaterial({ color: COLORS.brown, transparent: true, opacity: 0.35, side: DoubleSide })),
  );
  cup.add(filet);

  /* Coffee */
  const coffee = coffeeTexture();
  track(coffee.texture);
  const coffeeMesh = new Mesh(
    track(new CircleGeometry(bodyRadiusAt(0) - 7.4, 96)),
    /* Mostly its own colour: a dark liquid reflects only a little of the room. */
    track(
      new MeshPhysicalMaterial({
        map: coffee.texture,
        roughness: 0.3,
        clearcoat: 0.25,
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.08,
      }),
    ),
  );
  coffeeMesh.rotation.x = -Math.PI / 2;
  cup.add(coffeeMesh);

  /* Printed logo: a curved decal following the conical body */
  const logo = logoTexture(brandName);
  track(logo.texture);
  logo.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const logoTop = toWorldY(128);
  const logoBottom = toWorldY(172);
  const arc = 2;
  const logoMesh = new Mesh(
    track(
      new CylinderGeometry(
        bodyRadiusAt(logoTop) + 0.5,
        bodyRadiusAt(logoBottom) + 0.5,
        logoTop - logoBottom,
        96,
        1,
        true,
        -arc / 2,
        arc,
      ),
    ),
    track(
      new MeshStandardMaterial({
        map: logo.texture,
        transparent: true,
        roughness: 0.3,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    ),
  );
  logoMesh.position.y = (logoTop + logoBottom) / 2;
  cup.add(logoMesh);

  /* The pink dot glows softly, like a small sun */
  const glow = glowTexture();
  track(glow.texture);
  const glowMaterial = track(new SpriteMaterial({ map: glow.texture, transparent: true, depthWrite: false }));
  const glowSprite = new Sprite(glowMaterial);
  const dotTheta = -arc / 2 + logo.dotU * arc;
  const dotY = logoTop - logo.dotV * (logoTop - logoBottom);
  const dotRadius = bodyRadiusAt(dotY) + 2.5;
  glowSprite.position.set(Math.sin(dotTheta) * dotRadius, dotY, Math.cos(dotTheta) * dotRadius);
  cup.add(glowSprite);

  /* Handle: a porcelain tube along the same loop as the SVG fallback */
  const curve = handleCurve();
  const handleGeometry = track(new TubeGeometry(curve, 96, 6.2, 24));
  cup.add(new Mesh(handleGeometry, porcelain));
  cup.add(new Mesh(track(new TubeGeometry(curve, 96, 6.2 + OUTLINE, 24)), outline));

  /* Camera */
  const camera = new PerspectiveCamera(FOV, 1, 1, 20000);
  const layout = { width: 1, height: 1, x: 0.5, y: 0.5, unit: 1 };
  const state = { turn: 0, tilt: 0, zoom: 1, progress: 0 };
  let active = true;
  let dirty = true;
  let frame = 0;
  let lastGlow = 0;

  function placeCamera() {
    const distance =
      layout.height / (2 * Math.tan(MathUtils.degToRad(FOV / 2))) / layout.unit / state.zoom;
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

  function updateGlow(time) {
    const pulse = (Math.sin(time / 380) + 1) / 2;
    const worldTheta = dotTheta + cup.rotation.y;
    const facing = MathUtils.clamp(Math.cos(worldTheta) * 3, 0, 1);
    const size = 15 + pulse * 7;
    glowSprite.scale.set(size, size, 1);
    glowMaterial.opacity = (0.45 + pulse * 0.4) * facing;
  }

  function render(time) {
    cup.rotation.y = MathUtils.degToRad(state.turn);
    placeCamera();
    updateGlow(time);
    renderer.render(scene, camera);
  }

  /* Renders on demand: scroll changes, plus a gentle 30 fps pulse while the logo is in view. */
  function loop(time) {
    frame = requestAnimationFrame(loop);
    const pulsing = state.progress < 0.35;
    if (!dirty && !(pulsing && time - lastGlow > 33)) return;
    dirty = false;
    lastGlow = time;
    render(time);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  render(performance.now());
  start();

  return {
    setState(next) {
      state.turn = next['--turn'];
      state.tilt = next['--tilt'];
      state.zoom = next['--zoom'];
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
      disposables.forEach((item) => item.dispose?.());
      renderer.dispose();
    },
  };
}
