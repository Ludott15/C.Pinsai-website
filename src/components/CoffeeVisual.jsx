import CoffeeSteam from './CoffeeSteam.jsx';

/**
 * The hero cup, built from independent layers so it can move in 3D:
 * - the saucer and the porcelain body are SVG planes (the cup is symmetric, so they never need to turn);
 * - the handle orbits the vertical axis in real CSS 3D space and is occluded by the body when it passes behind;
 * - the printed logo slides around the body following the same rotation;
 * - the coffee mouth opens up as the camera tilts, until the camera falls into it (see ScrollDive).
 * Every moving value comes from CSS custom properties written by the scroll timeline.
 */
export default function CoffeeVisual({ brandName }) {
  const [initial, rest] = brandName.split('.');

  return (
    <div
      className="coffee"
      role="img"
      aria-label={`Tazzina di caffè ${brandName} da cui sale un vapore fatto di codice binario rosa`}
    >
      <div className="coffee__camera">
        <CoffeeSteam />

        <div className="coffee__cup">
          <svg className="coffee__saucer" viewBox="0 0 400 320" aria-hidden="true">
            <defs>
              <radialGradient id="cup-saucer" cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#FBF8F1" />
                <stop offset="100%" stopColor="#F5EFE2" />
              </radialGradient>
            </defs>
            <ellipse className="coffee__shadow" cx="200" cy="292" rx="186" ry="24" />
            <ellipse cx="200" cy="272" rx="178" ry="38" fill="#4B2D20" />
            <ellipse cx="200" cy="264" rx="178" ry="38" fill="url(#cup-saucer)" stroke="#4B2D20" strokeWidth="4" />
            <ellipse cx="200" cy="258" rx="106" ry="18" fill="none" stroke="#4B2D20" strokeOpacity=".18" strokeWidth="3" />
            <ellipse cx="200" cy="246" rx="96" ry="14" fill="#4B2D20" opacity=".16" />
          </svg>

          <div className="coffee__orbit" aria-hidden="true">
            <div className="coffee__handle">
              <svg viewBox="0 0 90 100">
                <path
                  d="M16 14 C 52 2, 80 20, 76 50 C 72 80, 42 92, 4 84"
                  fill="none"
                  stroke="#4B2D20"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d="M16 14 C 52 2, 80 20, 76 50 C 72 80, 42 92, 4 84"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <path
                  d="M38 16 C 60 20, 68 34, 66 50"
                  fill="none"
                  stroke="#4B2D20"
                  strokeOpacity=".14"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="coffee__handle-edge" />
          </div>

          <svg className="coffee__body" viewBox="0 0 400 320" aria-hidden="true">
            <defs>
              <linearGradient id="cup-porcelain" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#F5EFE2" />
                <stop offset="28%" stopColor="#FFFFFF" />
                <stop offset="62%" stopColor="#FBF8F1" />
                <stop offset="100%" stopColor="#F5EFE2" />
              </linearGradient>
              <radialGradient id="cup-coffee" cx="46%" cy="40%" r="62%">
                <stop offset="0%" stopColor="#4B2D20" />
                <stop offset="55%" stopColor="#2A1810" />
                <stop offset="100%" stopColor="#1C100B" />
              </radialGradient>
              <radialGradient id="cup-crema" cx="50%" cy="50%" r="50%">
                <stop offset="72%" stopColor="#F5EFE2" stopOpacity="0" />
                <stop offset="90%" stopColor="#F5EFE2" stopOpacity=".32" />
                <stop offset="100%" stopColor="#F5EFE2" stopOpacity=".1" />
              </radialGradient>
              <clipPath id="cup-body-clip">
                <path d="M84 72 C 86 150, 118 226, 172 236 L 228 236 C 282 226, 314 150, 316 72 A 116 24 0 0 1 84 72 Z" />
              </clipPath>
            </defs>

            <g className="coffee__shell">
              <ellipse cx="200" cy="238" rx="56" ry="10" fill="#4B2D20" />
              <path
                d="M84 72 C 86 150, 118 226, 172 236 L 228 236 C 282 226, 314 150, 316 72 A 116 24 0 0 1 84 72 Z"
                fill="url(#cup-porcelain)"
                stroke="#4B2D20"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <g clipPath="url(#cup-body-clip)">
                <path d="M104 92 C 108 150, 132 200, 160 222" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" opacity=".9" />
                <path d="M300 84 C 296 150, 270 206, 232 228" fill="none" stroke="#4B2D20" strokeOpacity=".08" strokeWidth="26" strokeLinecap="round" />
                <g className="coffee__logo">
                  <text x="200" y="158" textAnchor="middle">
                    {initial}
                    <tspan fill="#E04A95">.</tspan>
                    {rest}
                  </text>
                </g>
              </g>
            </g>

            <g className="coffee__mouth">
              <ellipse cx="200" cy="72" rx="116" ry="24" fill="#FFFFFF" stroke="#4B2D20" strokeWidth="4" />
              <ellipse cx="200" cy="76" rx="102" ry="18" fill="url(#cup-coffee)" />
              <ellipse cx="200" cy="76" rx="102" ry="18" fill="url(#cup-crema)" />
              <ellipse className="coffee__surface-glint" cx="176" cy="72" rx="26" ry="4" fill="#F5EFE2" opacity=".22" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
