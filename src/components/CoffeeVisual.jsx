import cupImage from '../assets/cpinsai-cup.webp';
import { useUi } from '../pages/PageContext.jsx';
import { fillTemplate } from '../utils/text.js';

/**
 * The hero cup box (400 × 400 units, coffee surface at 50% 31.25%).
 * The still image is rendered from the same 3D model (src/assets/cpinsai-cup.glb):
 * it shows while the WebGL cup loads, and stays where WebGL is not used.
 */
export default function CoffeeVisual({ brandName }) {
  const ui = useUi();
  return (
    <div
      className="coffee"
      role="img"
      aria-label={fillTemplate(ui.cupLabel, { brand: brandName })}
    >
      <div className="coffee__camera">
        <img className="coffee__image" src={cupImage} alt="" width="1000" height="1000" decoding="async" />
      </div>
    </div>
  );
}
