import { useInView } from '../hooks/useInView.js';

export default function SectionHeader({
  id,
  index,
  kicker,
  title,
  subtitle,
  tone = 'light',
  align = 'start',
  as: Heading = 'h2',
}) {
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
      <Heading id={id} className="section-head__title">
        {title}
      </Heading>
      {subtitle && <p className="section-head__subtitle">{subtitle}</p>}
    </header>
  );
}
