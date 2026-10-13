import cupImage from '../assets/cpinsai-cup.webp';

/**
 * The hero cup box (400 × 540 units, coffee surface at 50% 54.8%).
 * The still image is rendered from the same 3D model (src/assets/cpinsai-cup.glb):
 * it shows while the WebGL cup loads, and stays where WebGL is not used.
 */
export default function CoffeeVisual({ brandName }) {
  return (
    <div
      className="coffee"
      role="img"
      aria-label={`Tazzina di caffè ${brandName} in stile pixel, con un vapore rosa fatto di bit`}
    >
      <div className="coffee__camera">
        <img className="coffee__image" src={cupImage} alt="" width="1000" height="1350" decoding="async" />
      </div>
    </div>
  );
}
