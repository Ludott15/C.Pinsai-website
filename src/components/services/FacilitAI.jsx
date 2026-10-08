import ServiceCard from './ServiceCard.jsx';

export default function FacilitAI({ item }) {
  const [word, suffix] = item.title.split('-');

  return (
    <ServiceCard item={item} className="service--facilitai">
      <p className="facilitai__wordmark" aria-hidden="true">
        {word}
        <span>-{suffix}</span>
      </p>
      <p className="facilitai__concept">{item.concept}</p>
      <dl className="facilitai__pillars">
        {item.pillars.map((pillar) => (
          <div key={pillar.label}>
            <dt>{pillar.label}</dt>
            <dd>{pillar.value}</dd>
          </div>
        ))}
      </dl>
      <p className="facilitai__aside">{item.aside}</p>
    </ServiceCard>
  );
}
