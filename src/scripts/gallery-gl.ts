import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

/**
 * The gallery's WebGL layer: a uniform grid of textured planes that bulge
 * toward the camera while the page scrolls.
 *
 * Each photo is a finely subdivided plane. The vertex shader pushes every
 * vertex out along Z by a radial falloff, scaled by a bulge amount the caller
 * feeds in from scroll velocity. Because the displacement is per-vertex rather
 * than per-element, the photos genuinely bend — a CSS transform can only move a
 * rectangle rigidly, which is why this cannot be done outside WebGL.
 *
 * The falloff is deliberately anisotropic, and that asymmetry is the whole look:
 * vertically it is measured from the centre of the VIEWPORT, so the swell fades
 * out toward the top and bottom of the screen; horizontally it is measured from
 * the centre of EACH PHOTO, so every tile puffs up as its own cushion with a
 * crease at every gap. Measuring x from the viewport centre too would give one
 * smooth dome over the grid — which reads as a zoom, not as bumps.
 */

const VERTEX = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uBulge;    // world-unit height of the bulge at its peak
  uniform float uRadius;   // vertical reach, in world units from the centre line
  uniform float uCushion;  // horizontal reach, in multiples of a tile's half-width

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // View space: the camera looks down -Z at the origin, so mv.y is the
    // vertex's offset from the horizontal centre line of the viewport.
    vec4 mv = modelViewMatrix * vec4(position, 1.0);

    // Both axes are normalised to their own reach before being combined, so a
    // distance of 1 means "out of range" on either. position.x runs -0.5..0.5
    // across the unscaled plane, so dividing by uCushion measures the tile in
    // its own widths and needs no knowledge of how wide it ended up on screen.
    float nx = position.x * 2.0 / uCushion;
    float ny = mv.y / uRadius;
    float dist = sqrt(nx * nx + ny * ny);

    float falloff = max(0.0, 1.0 - dist);
    // sin() eases the swell to nothing at its edges; the exponent sharpens the
    // shoulder so each crest reads as a lens rather than a tent.
    mv.z += pow(sin(falloff * 1.5707963), 1.2) * uBulge;

    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;
  uniform vec2 uCover; // uv scale that crops the photo to the tile, like object-fit:cover

  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    gl_FragColor = texture2D(tMap, uv);
  }
`;

const FOV = 45;
const CAMERA_Z = 4.2;
/**
 * Grid width as a fraction of the viewport *at rest*, so the tiles sit inside
 * the frame with a margin when nothing is moving. The canvas itself spans the
 * full viewport (see the `.g-stage` full-bleed rule): that margin is the room
 * the bulge expands into, and past the edge, before drawing back in.
 */
const REST_WIDTH = 0.93;
/**
 * Peak displacement toward the camera, as a fraction of the visible height.
 * The reference sits at 0.23, but its grid runs edge-to-edge at rest so that is
 * already enough to throw tiles off-screen. Ours rests inside the frame, so it
 * needs a deeper push to clear the edges — this is what makes the photos leave
 * the frame mid-scroll and draw back in as the bulge relaxes.
 */
const BULGE_PEAK = 0.36;
/**
 * Vertical reach of the swell, as a fraction of the visible height. Rows this
 * far above or below the centre line sit flat, which is what keeps the effect
 * a band moving through the grid instead of the whole grid inflating.
 */
const BULGE_RADIUS = 0.63;
/**
 * Horizontal reach of each photo's cushion, in multiples of its own half-width.
 * This is what makes the grid bumpy rather than domed: at 2.32 a tile's outer
 * edge sits 0.43 of the way through the falloff, so it lifts noticeably less
 * than its middle and a crease forms at every gap. Lower it for fatter, more
 * separated cushions; raise it and the tiles flatten back into one ridge.
 */
const BULGE_CUSHION = 2.32;
/**
 * Scroll distance per screen-height of grid overflow, in vh. The grid is meant
 * to drift rather than track the scroll, so this is deliberately far above 100:
 * at 490 the desktop layout resolves to the 280vh the stage used to hardcode.
 */
const SCROLL_DAMPING = 490;

export interface GalleryGL {
  /** 0 = flat, 1 = full bulge. */
  setBulge(amount: number): void;
  /** 0..1 progress through the pinned stage; travels the grid vertically. */
  setScroll(progress: number): void;
  /** Index of the photo under these client coordinates, or null. */
  hitTest(clientX: number, clientY: number): number | null;
  /**
   * Height the pinned stage needs, in vh, for this breakpoint's grid. Fewer
   * columns means more rows means further to travel, so it cannot be a constant.
   */
  stageVh(): number;
  /** Draws, but only if something actually moved since the last frame. */
  render(): void;
  resize(): void;
  destroy(): void;
}

function columnsFor(width: number): number {
  if (width <= 640) return 2;
  if (width <= 1024) return 3;
  return 4;
}

export function createGalleryGL(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
): GalleryGL {
  const host = canvas.parentElement ?? canvas;
  const renderer = new Renderer({
    canvas,
    alpha: true,
    antialias: true,
    dpr: Math.min(2, window.devicePixelRatio || 1),
  });
  const gl = renderer.gl;

  const camera = new Camera(gl, { fov: FOV });
  camera.position.z = CAMERA_Z;

  const scene = new Transform();
  const group = new Transform();
  group.setParent(scene);

  // One shared geometry: a unit plane, subdivided enough to bend smoothly.
  const geometry = new Plane(gl, {
    width: 1,
    height: 1,
    widthSegments: 24,
    heightSegments: 24,
  });

  // Shared uniform objects so a single write drives every mesh.
  const uBulge = { value: 0 };
  const uRadius = { value: 1 };
  const uCushion = { value: BULGE_CUSHION };

  // Declared before the meshes: an already-cached photo attaches synchronously
  // below and reads these straight away.
  let tileW = 1;
  let tileH = 1;
  let travel = 0;
  let peakBulge = 1;
  let gridVh = 100;
  /**
   * The render loop runs for the whole time the stage is anywhere near the
   * viewport, which is several screens of scrolling. Redrawing an unchanged
   * scene for all of that is pure waste, so every mutation flags this and
   * render() is a no-op until one does.
   */
  let needsDraw = true;

  /** Crops the photo to the tile the way object-fit:cover would. */
  function applyCover(mesh: Mesh, img: HTMLImageElement): void {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const tileAspect = tileW / tileH;
    const cover =
      imgAspect > tileAspect
        ? [tileAspect / imgAspect, 1] // photo is wider — trim the sides
        : [1, imgAspect / tileAspect]; // photo is taller — trim top and bottom
    (mesh.program.uniforms.uCover.value as number[]) = cover;
  }

  // The markup grid is folded away behind the canvas, so its images are lazy
  // and would never enter the viewport on their own. They are the textures, so
  // ask for them outright.
  const meshes = images.map((img) => {
    if (!img.complete) img.loading = 'eager';
    const texture = new Texture(gl, { generateMipmaps: true });
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        tMap: { value: texture },
        uCover: { value: [1, 1] },
        uBulge,
        uRadius,
        uCushion,
      },
      cullFace: null,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(group);
    // Stay hidden until the photo has actually decoded, so no blank quad flashes.
    mesh.visible = false;

    const attach = () => {
      texture.image = img;
      mesh.visible = true;
      applyCover(mesh, img);
      // A photo that decodes after the scene has gone quiet still has to appear.
      needsDraw = true;
    };
    if (img.complete && img.naturalWidth > 0) attach();
    else img.addEventListener('load', attach, { once: true });

    return { mesh, img };
  });

  function layout(): void {
    // Measure the host, never the canvas: setSize() writes inline width/height
    // onto the canvas, so measuring the canvas would just re-read our own last
    // output and lock the size in place forever.
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;

    renderer.setSize(width, height);
    camera.perspective({ aspect: width / height });

    const visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
    const visW = visH * (width / height);

    const cols = columnsFor(window.innerWidth);
    // Sits inside the frame at rest; the bulge is what pushes it past the edges.
    const colStep = (visW * REST_WIDTH) / cols;
    const gap = colStep * 0.14;
    tileW = colStep - gap;
    tileH = tileW * 1.25; // portrait tiles suit the bar's photography
    const rowStep = tileH + gap;

    const rows = Math.ceil(meshes.length / cols);
    const gridH = rows * tileH + (rows - 1) * gap;

    const startX = -((cols - 1) * colStep) / 2;
    const startY = ((rows - 1) * rowStep) / 2;

    meshes.forEach(({ mesh, img }, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      mesh.scale.set(tileW, tileH, 1);
      mesh.position.x = startX + col * colStep;
      mesh.position.y = startY - row * rowStep;
      applyCover(mesh, img);
    });

    uRadius.value = visH * BULGE_RADIUS;
    // How far the grid slides across the pinned stage.
    travel = Math.max(0, (gridH - visH) / 2 + tileH * 0.15);
    peakBulge = visH * BULGE_PEAK;

    // The stage is one sticky screen plus however much scrolling it takes to
    // walk the grid past it. Two columns on a phone make roughly twice the rows
    // of four on a desktop, so a fixed height would race the grid past on the
    // narrow layout and leave the wide one idling.
    gridVh = 100 + Math.min(800, Math.max(0, (gridH - visH) / visH) * SCROLL_DAMPING);

    needsDraw = true;
  }

  layout();

  // The stage can still be settling when this runs (fonts, images, the sticky
  // resolving its height), so re-lay out whenever the host actually changes
  // size rather than trusting the first measurement.
  const observer = new ResizeObserver(() => layout());
  observer.observe(host);

  return {
    setBulge(amount: number) {
      const next = amount * peakBulge;
      if (next === uBulge.value) return;
      uBulge.value = next;
      needsDraw = true;
    },
    setScroll(progress: number) {
      const next = -travel + progress * 2 * travel;
      if (next === group.position.y) return;
      group.position.y = next;
      needsDraw = true;
    },
    hitTest(clientX: number, clientY: number) {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;

      // Client point -> world point on the z=0 plane the tiles sit on.
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
      const visW = visH * (rect.width / rect.height);
      const worldX = (ndcX * visW) / 2;
      const worldY = (ndcY * visH) / 2;

      for (let i = 0; i < meshes.length; i++) {
        const { mesh } = meshes[i];
        if (!mesh.visible) continue;
        const dx = Math.abs(worldX - mesh.position.x);
        const dy = Math.abs(worldY - (mesh.position.y + group.position.y));
        if (dx <= tileW / 2 && dy <= tileH / 2) return i;
      }
      return null;
    },
    stageVh() {
      return gridVh;
    },
    render() {
      if (!needsDraw) return;
      renderer.render({ scene, camera });
      needsDraw = false;
    },
    resize() {
      layout();
    },
    destroy() {
      observer.disconnect();
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    },
  };
}
