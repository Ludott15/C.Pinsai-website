import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CoffeeVisual from './CoffeeVisual.jsx';
import ScrollDive from './ScrollDive.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollProgress } from '../hooks/useScrollProgress.js';
import { applyDiveState, clearDiveState } from '../utils/dive.js';
import { updateHandle } from '../utils/handle.js';
import { toBinary } from '../utils/text.js';

/** Vertical position of the coffee surface inside the cup visual box (see CoffeeVisual geometry). */
const COFFEE_CENTER_Y = 296 / 540;
/** Time constant (ms) of the scroll smoothing: the dive glides instead of following every wheel step. */
const SCROLL_SMOOTHING = 140;
const MOBILE_QUERY = '(max-width: 640px)';

/** The WebGL cup is loaded only where it can run comfortably; everywhere else the SVG cup stays. */
function canUseWebGL() {
  if (navigator.connection?.saveData) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return false;
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Hero({ content, dive, brandName }) {
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({ state: null, layout: null });
  const [renderer, setRenderer] = useState('svg');
  const reducedMotion = useReducedMotion();

  const onProgress = useCallback((progress) => {
    const state = applyDiveState(trackRef.current, progress);
    latest.current.state = state;
    if (sceneRef.current) {
      sceneRef.current.setState(state);
      sceneRef.current.setActive(progress < 0.92);
    } else {
      updateHandle(handleRef.current, state['--turn'], state['--tilt']);
    }
  }, []);
  useScrollProgress(trackRef, onProgress, !reducedMotion, SCROLL_SMOOTHING);

  useEffect(() => {
    if (!reducedMotion || !trackRef.current) return;
    clearDiveState(trackRef.current);
    updateHandle(handleRef.current, 0, 0);
  }, [reducedMotion]);

  /* 3D cup: loaded after the page is interactive, never blocking the first paint. */
  useEffect(() => {
    if (reducedMotion || !canUseWebGL()) return undefined;
    let disposed = false;
    let scene = null;

    const start = async () => {
      try {
        const { createCupScene } = await import('../three/CupScene.js');
        if (disposed) return;
        const mobile = window.matchMedia(MOBILE_QUERY).matches;
        scene = await createCupScene({ canvas: canvasRef.current, brandName, maxPixelRatio: mobile ? 1.5 : 2 });
        if (disposed) {
          scene.dispose();
          return;
        }
        if (latest.current.layout) scene.setLayout(latest.current.layout);
        if (latest.current.state) scene.setState(latest.current.state);
        sceneRef.current = scene;
        setRenderer('webgl');
      } catch {
        setRenderer('svg');
      }
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 400);

    const canvas = canvasRef.current;
    const onLost = () => {
      sceneRef.current = null;
      setRenderer('svg');
    };
    canvas.addEventListener('webglcontextlost', onLost);

    /* Off screen, the scene stops rendering. */
    const observer = new IntersectionObserver(([entry]) => sceneRef.current?.setActive(entry.isIntersecting));
    observer.observe(trackRef.current);

    return () => {
      disposed = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      sceneRef.current = null;
      scene?.dispose();
      setRenderer('svg');
    };
  }, [reducedMotion, brandName]);

  /* The dive opens from the centre of the coffee: keep its position (relative to the sticky stage) up to date. */
  useEffect(() => {
    const track = trackRef.current;
    if (reducedMotion || !track) return undefined;
    const stage = track.querySelector('.hero__stage');
    const cup = track.querySelector('.coffee');

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const cupRect = cup.getBoundingClientRect();
      const x = cupRect.left - stageRect.left + cupRect.width / 2;
      const y = cupRect.top - stageRect.top + cupRect.height * COFFEE_CENTER_Y;
      track.style.setProperty('--cx', `${x.toFixed(1)}px`);
      track.style.setProperty('--cy', `${y.toFixed(1)}px`);
      /* The cup box is 400 units wide: the 3D model uses the same units. */
      latest.current.layout = { width: stageRect.width, height: stageRect.height, x, y, unit: cupRect.width / 400 };
      sceneRef.current?.setLayout(latest.current.layout);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(cup);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const lineB = content.headline[1];
  const accentAt = lineB.lastIndexOf(' ') + 1;
  const binaryRow = useMemo(() => Array(3).fill(toBinary(brandName)).join('  '), [brandName]);

  return (
    <section
      id="home"
      ref={trackRef}
      className={`hero${reducedMotion ? ' hero--static' : ''}`}
      data-renderer={renderer}
      aria-labelledby="hero-title"
    >
      <div className="hero__stage">
        <div className="hero__binary" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} style={{ '--row': index }}>
              {binaryRow}
            </span>
          ))}
        </div>

        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />

        <div className="hero__grid shell">
          <p className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            {content.kicker}
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__line hero__line--a">{content.headline[0]}</span>{' '}
            <span className="hero__line hero__line--b">
              {lineB.slice(0, accentAt)}
              <em>{lineB.slice(accentAt)}</em>
            </span>
          </h1>

          <div className="hero__visual">
            <CoffeeVisual brandName={brandName} handleRef={handleRef} />
          </div>

          <div className="hero__aside">
            <p className="hero__sub">{content.subheadline}</p>
            <a className="button button--primary hero__cta" href={content.cta.href}>
              {content.cta.label}
              <span className="button__arrow" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>

          <p className="hero__hint" aria-hidden="true">
            <span className="hero__hint-line" />
            {content.scrollHint}
          </p>
        </div>

        <ScrollDive {...dive} />
      </div>
    </section>
  );
}
