import CoffeeSteam from './CoffeeSteam.jsx';

/* Shared silhouette of the porcelain body (viewBox 400 × 320). */
const BODY_PATH = 'M84 72 C 86 150, 118 226, 172 236 L 228 236 C 282 226, 314 150, 316 72 A 116 24 0 0 1 84 72 Z';
const HANDLE_PATH = 'M16 14 C 52 2, 80 20, 76 50 C 72 80, 42 92, 4 84';

/**
 * The hero cup, built from independent layers so it can move in 3D:
 * - the saucer and the porcelain body are SVG planes (the cup is symmetric, so they never need to turn);
 * - the handle orbits the vertical axis in real CSS 3D space and is occluded by the body when it passes behind;
 * - the printed logo slides around the body following the same rotation;
 * - the coffee mouth opens up as the camera tilts, until the camera falls into it (see ScrollDive).
 * Every moving value comes from CSS custom properties written by the scroll timeline.
 *
 * Shading is built only from the brand palette: white and cream for the porcelain,
 * translucent brown for shadows and occlusion, darker browns and cream for the espresso and its crema.
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
              <radialGradient id="cup-saucer-top" cx="46%" cy="30%" r="72%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#FBF8F1" />
                <stop offset="100%" stopColor="#F5EFE2" />
              </radialGradient>
              <linearGradient id="cup-saucer-edge" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#4B2D20" stopOpacity=".34" />
                <stop offset="22%" stopColor="#4B2D20" stopOpacity=".1" />
                <stop offset="45%" stopColor="#4B2D20" stopOpacity="0" />
                <stop offset="78%" stopColor="#4B2D20" stopOpacity=".14" />
                <stop offset="100%" stopColor="#4B2D20" stopOpacity=".4" />
              </linearGradient>
              <radialGradient id="cup-saucer-well" cx="50%" cy="58%" r="55%">
                <stop offset="0%" stopColor="#FBF8F1" />
                <stop offset="72%" stopColor="#F5EFE2" />
                <stop offset="100%" stopColor="#4B2D20" stopOpacity=".16" />
              </radialGradient>
              <filter id="cup-blur-soft" x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <filter id="cup-blur-tight" x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Cast shadow on the table */}
            <ellipse className="coffee__shadow" cx="200" cy="294" rx="184" ry="22" filter="url(#cup-blur-soft)" />

            {/* Saucer thickness: underside, foot ring and lit edge */}
            <ellipse cx="200" cy="278" rx="118" ry="15" fill="#3A2218" opacity=".5" />
            <ellipse cx="200" cy="270" rx="178" ry="37.5" fill="#F5EFE2" />
            <ellipse cx="200" cy="270" rx="178" ry="37.5" fill="url(#cup-saucer-edge)" />
            <path d="M22 270 A 178 37.5 0 0 0 378 270" fill="none" stroke="#4B2D20" strokeWidth="3.5" />

            {/* Top face */}
            <ellipse cx="200" cy="264" rx="178" ry="38" fill="url(#cup-saucer-top)" stroke="#4B2D20" strokeWidth="3.5" />
            <path d="M34 266 A 168 33 0 0 0 366 266" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".9" />
            <ellipse cx="200" cy="264" rx="160" ry="31.5" fill="none" stroke="#E04A95" strokeWidth="1.6" opacity=".85" />
            <ellipse cx="200" cy="264" rx="155" ry="30" fill="none" stroke="#4B2D20" strokeWidth="1" opacity=".12" />

            {/* Central well where the cup sits */}
            <ellipse cx="200" cy="259" rx="110" ry="20.5" fill="url(#cup-saucer-well)" />
            <path d="M90 259 A 110 20.5 0 0 1 310 259" fill="none" stroke="#4B2D20" strokeWidth="2" opacity=".2" />
            <path d="M92 261 A 108 19.5 0 0 0 308 261" fill="none" stroke="#FFFFFF" strokeWidth="2.4" opacity=".95" />

            {/* Contact shadow of the cup foot */}
            <ellipse cx="204" cy="248" rx="72" ry="11" fill="#2A1810" opacity=".34" filter="url(#cup-blur-tight)" />
            <ellipse cx="200" cy="244" rx="58" ry="7" fill="#1C100B" opacity=".28" />
          </svg>

          <div className="coffee__orbit" aria-hidden="true">
            <div className="coffee__handle">
              <svg viewBox="0 0 90 100">
                <defs>
                  <linearGradient id="cup-handle" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="55%" stopColor="#FBF8F1" />
                    <stop offset="100%" stopColor="#F5EFE2" />
                  </linearGradient>
                </defs>
                <path d={HANDLE_PATH} fill="none" stroke="#4B2D20" strokeWidth="22" strokeLinecap="round" />
                <path d={HANDLE_PATH} fill="none" stroke="url(#cup-handle)" strokeWidth="14.5" strokeLinecap="round" />
                {/* Inner occlusion on the lower curve, light along the outer top */}
                <path d="M74 58 C 70 78, 44 88, 10 82" fill="none" stroke="#4B2D20" strokeOpacity=".16" strokeWidth="5" strokeLinecap="round" />
                <path d="M30 11 C 54 8, 72 22, 73 40" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M40 18 C 58 22, 66 34, 66 48" fill="none" stroke="#4B2D20" strokeOpacity=".1" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="coffee__handle-edge" />
          </div>

          <svg className="coffee__body" viewBox="0 0 400 320" aria-hidden="true">
            <defs>
              <linearGradient id="cup-porcelain" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#F5EFE2" />
                <stop offset="14%" stopColor="#FBF8F1" />
                <stop offset="34%" stopColor="#FFFFFF" />
                <stop offset="52%" stopColor="#FFFFFF" />
                <stop offset="78%" stopColor="#FBF8F1" />
                <stop offset="100%" stopColor="#F5EFE2" />
              </linearGradient>
              <linearGradient id="cup-form-shadow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#4B2D20" stopOpacity=".16" />
                <stop offset="18%" stopColor="#4B2D20" stopOpacity=".03" />
                <stop offset="56%" stopColor="#4B2D20" stopOpacity="0" />
                <stop offset="82%" stopColor="#4B2D20" stopOpacity=".12" />
                <stop offset="94%" stopColor="#4B2D20" stopOpacity=".2" />
                <stop offset="100%" stopColor="#4B2D20" stopOpacity=".1" />
              </linearGradient>
              <linearGradient id="cup-occlusion" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4B2D20" stopOpacity=".1" />
                <stop offset="16%" stopColor="#4B2D20" stopOpacity="0" />
                <stop offset="70%" stopColor="#4B2D20" stopOpacity="0" />
                <stop offset="100%" stopColor="#4B2D20" stopOpacity=".22" />
              </linearGradient>
              <linearGradient id="cup-foot" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#2A1810" />
                <stop offset="40%" stopColor="#4B2D20" />
                <stop offset="100%" stopColor="#1C100B" />
              </linearGradient>
              <linearGradient id="cup-inner-wall" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FBF8F1" />
                <stop offset="45%" stopColor="#F5EFE2" />
                <stop offset="100%" stopColor="#4B2D20" stopOpacity=".35" />
              </linearGradient>
              <radialGradient id="cup-coffee" cx="44%" cy="38%" r="64%">
                <stop offset="0%" stopColor="#4B2D20" />
                <stop offset="48%" stopColor="#3A2218" />
                <stop offset="82%" stopColor="#2A1810" />
                <stop offset="100%" stopColor="#1C100B" />
              </radialGradient>
              <radialGradient id="cup-crema" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F5EFE2" stopOpacity=".1" />
                <stop offset="45%" stopColor="#F5EFE2" stopOpacity=".06" />
                <stop offset="78%" stopColor="#F5EFE2" stopOpacity=".2" />
                <stop offset="92%" stopColor="#F5EFE2" stopOpacity=".38" />
                <stop offset="100%" stopColor="#1C100B" stopOpacity=".5" />
              </radialGradient>
              <filter id="cup-crema-texture" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035 0.16" numOctaves="3" seed="7" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.96  0 0 0 0 0.94  0 0 0 0 0.89  0 0 0 1.8 -0.82"
                />
                <feComposite in2="SourceGraphic" operator="in" />
              </filter>
              <filter id="cup-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <clipPath id="cup-body-clip">
                <path d={BODY_PATH} />
              </clipPath>
              <clipPath id="cup-coffee-clip">
                <ellipse cx="200" cy="76" rx="101" ry="17.5" />
              </clipPath>
            </defs>

            <g className="coffee__shell">
              {/* Foot ring */}
              <ellipse cx="200" cy="239" rx="58" ry="10.5" fill="url(#cup-foot)" />
              <path d="M146 238 A 54 8 0 0 0 254 238" fill="none" stroke="#F5EFE2" strokeWidth="1.4" opacity=".35" />

              {/* Porcelain body with form shadow, ambient occlusion and reflected light */}
              <path d={BODY_PATH} fill="url(#cup-porcelain)" />
              <g clipPath="url(#cup-body-clip)">
                <path d={BODY_PATH} fill="url(#cup-form-shadow)" />
                <path d={BODY_PATH} fill="url(#cup-occlusion)" />

                {/* Shadow cast by the rim just below the lip */}
                <path d="M80 80 A 120 26 0 0 0 320 80 L 320 72 A 116 24 0 0 1 84 72 Z" fill="#4B2D20" opacity=".08" />

                {/* Pink band and fine brown filet: the brand's decoration around the cup */}
                <path d="M84 98 A 116 24 0 0 0 316 98" fill="none" stroke="#E04A95" strokeWidth="4" />
                <path d="M86 106 A 114 23 0 0 0 314 106" fill="none" stroke="#4B2D20" strokeWidth="1" opacity=".35" />

                {/* Soft specular highlight + crisp sparkle on the lit side */}
                <path d="M118 96 C 120 150, 140 196, 168 222" fill="none" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" filter="url(#cup-glow)" />
                <path d="M114 112 C 118 150, 132 182, 150 204" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="128" cy="118" r="2.6" fill="#FFFFFF" />

                {/* Reflected light from the saucer along the shadow side */}
                <path d="M306 104 C 300 158, 276 204, 240 226" fill="none" stroke="#FBF8F1" strokeWidth="3" strokeLinecap="round" opacity=".9" />

                <g className="coffee__logo">
                  <text x="200" y="160" textAnchor="middle">
                    {initial}
                    <tspan fill="#E04A95">.</tspan>
                    {rest}
                  </text>
                </g>
              </g>
              <path d={BODY_PATH} fill="none" stroke="#4B2D20" strokeWidth="3.5" strokeLinejoin="round" />
            </g>

            <g className="coffee__mouth">
              {/* Rim and the visible inner wall of the cup */}
              <ellipse cx="200" cy="72" rx="116" ry="24" fill="#FFFFFF" stroke="#4B2D20" strokeWidth="3.5" />
              <ellipse cx="200" cy="72.5" rx="109" ry="20.5" fill="url(#cup-inner-wall)" />
              <path d="M91 72.5 A 109 20.5 0 0 1 309 72.5" fill="none" stroke="#4B2D20" strokeWidth="1.2" opacity=".22" />

              {/* Espresso, crema and its tiger-striped texture */}
              <ellipse cx="200" cy="76" rx="101" ry="17.5" fill="url(#cup-coffee)" />
              <ellipse cx="200" cy="76" rx="101" ry="17.5" fill="url(#cup-crema)" />
              <g clipPath="url(#cup-coffee-clip)">
                <rect x="99" y="58" width="202" height="36" fill="#FFFFFF" filter="url(#cup-crema-texture)" opacity=".26" />
                <path d="M150 82 C 174 76, 200 78, 216 82 C 232 86, 250 85, 264 79" fill="none" stroke="#F5EFE2" strokeWidth="1.6" strokeLinecap="round" opacity=".2" />
                <circle cx="114" cy="78" r="1.8" fill="#F5EFE2" opacity=".55" />
                <circle cx="121" cy="84" r="1.2" fill="#F5EFE2" opacity=".5" />
                <circle cx="282" cy="72" r="1.6" fill="#F5EFE2" opacity=".5" />
                <circle cx="276" cy="83" r="1.1" fill="#F5EFE2" opacity=".45" />
                <circle cx="230" cy="90" r="1.3" fill="#F5EFE2" opacity=".4" />
              </g>

              {/* Meniscus: shadow of the front lip, light on the far edge */}
              <path d="M99 76 A 101 17.5 0 0 0 301 76" fill="none" stroke="#1C100B" strokeWidth="3" opacity=".55" />
              <path d="M112 70 A 101 17.5 0 0 1 288 70" fill="none" stroke="#F5EFE2" strokeWidth="1.4" opacity=".45" />
              <ellipse className="coffee__surface-glint" cx="174" cy="71" rx="28" ry="4" fill="#F5EFE2" opacity=".22" />

              {/* Glaze highlight on the back of the rim */}
              <path d="M120 58 A 116 24 0 0 1 176 49" fill="none" stroke="#F5EFE2" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
