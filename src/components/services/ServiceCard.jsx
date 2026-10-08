import { useRef } from 'react';
import { useInView } from '../../hooks/useInView.js';

/**
 * Shared shell for every solution and vertical: reveal on scroll, pointer-following accent line,
 * index/kicker header and a CTA tied to the card title for assistive technologies.
 */
export default function ServiceCard({ item, className = '', children }) {
  const [ref, inView] = useInView({ threshold: 0.06 });
  const frame = useRef(0);
  const titleId = `${item.id}-title`;

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    const node = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--mx', ((clientX - rect.left) / rect.width).toFixed(3));
      node.style.setProperty('--my', ((clientY - rect.top) / rect.height).toFixed(3));
    });
  };

  return (
    <article
      ref={ref}
      className={`service ${className}${inView ? ' is-visible' : ''}`}
      aria-labelledby={titleId}
      onPointerMove={onPointerMove}
    >
      <div className="service__head">
        <span className="service__index">{item.index}</span>
        <span className="service__kicker">{item.kicker}</span>
        {item.status && <span className="badge">{item.status}</span>}
      </div>

      <h3 id={titleId} className="service__title">
        {item.title}
      </h3>

      {children}

      <a className="service__cta" href={item.cta.href} aria-describedby={titleId}>
        {item.cta.label}
        <span className="service__cta-arrow" aria-hidden="true">
          →
        </span>
      </a>

      <span className="service__tracker" aria-hidden="true" />
      <span className="service__corner service__corner--tl" aria-hidden="true" />
      <span className="service__corner service__corner--br" aria-hidden="true" />
    </article>
  );
}
