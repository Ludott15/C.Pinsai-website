import { useInView } from '../hooks/useInView.js';

export default function SectionHeader({ id, index, kicker, title, subtitle, tone = 'light', align = 'start' }) {
  const [ref, inView] = useInView();

  return (
    <header
      ref={ref}
      className={`section-head section-head--${tone} section-head--${align}${inView ? ' is-visible' : ''}`}
    >
      <p className={`kicker${tone === 'dark' ? ' kicker--dark' : ''}`}>
        <span className="kicker__index">{index}</span>
        {kicker}
      </p>
      <h2 id={id} className="section-head__title">
        {title}
      </h2>
      {subtitle && <p className="section-head__subtitle">{subtitle}</p>}
    </header>
  );
}
