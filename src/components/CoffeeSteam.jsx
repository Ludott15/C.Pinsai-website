import { useMemo } from 'react';
import { createRandom } from '../utils/text.js';

const GLYPHS = ['0', '1', '0', '1', '1', '0', '01', '10', '1', '0', '{', '}', '/', ';', '0', '1'];

/** Three wisps, each with its own lateral offset, sway rhythm and density. */
const WISPS = [
  { offset: -14, count: 10, sway: 9.5 },
  { offset: 2, count: 14, sway: 7.5 },
  { offset: 16, count: 9, sway: 11 },
];

const px = (value) => `${value.toFixed(1)}px`;

function buildParticles(seed) {
  const random = createRandom(seed);
  const range = (min, max) => min + random() * (max - min);

  return WISPS.map((wisp, wispIndex) => ({
    ...wisp,
    id: wispIndex,
    particles: Array.from({ length: wisp.count }, (_, index) => {
      const duration = range(4.8, 8.6);
      const drift = range(-1, 1);
      return {
        id: index,
        glyph: GLYPHS[Math.floor(random() * GLYPHS.length)],
        blurred: random() > 0.68,
        style: {
          '--x0': `${range(-20, 20).toFixed(1)}%`,
          '--x1': px(drift * range(6, 16)),
          '--x2': px(drift * range(14, 30) + range(-8, 8)),
          '--x3': px(drift * range(20, 44) + range(-14, 14)),
          '--rot': `${range(-70, 70).toFixed(0)}deg`,
          '--s0': range(0.55, 0.85).toFixed(2),
          '--s1': range(1.05, 1.6).toFixed(2),
          '--o': range(0.45, 0.95).toFixed(2),
          '--size': `${range(0.62, 1.05).toFixed(2)}em`,
          '--py': range(0.15, 0.85).toFixed(2),
          '--dur': `${duration.toFixed(2)}s`,
          '--delay': `${(-random() * duration).toFixed(2)}s`,
        },
      };
    }),
  }));
}

/**
 * Steam made of binary fragments: every glyph is born on the coffee surface,
 * rises along its own curved path, swells, turns and dissolves.
 * Wisps sway independently so the plume bends like real vapour instead of scrolling text.
 */
export default function CoffeeSteam({ seed = 1907 }) {
  const wisps = useMemo(() => buildParticles(seed), [seed]);

  return (
    <div className="steam" aria-hidden="true">
      {wisps.map((wisp) => (
        <div
          key={wisp.id}
          className="steam__wisp"
          style={{ '--offset': `${wisp.offset}%`, '--sway': `${wisp.sway}s` }}
        >
          {wisp.particles.map((particle) => (
            <span
              key={particle.id}
              className={`steam__bit${particle.blurred ? ' steam__bit--soft' : ''}`}
              style={particle.style}
            >
              {particle.glyph}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
