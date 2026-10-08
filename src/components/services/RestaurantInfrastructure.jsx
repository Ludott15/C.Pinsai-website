import ServiceCard from './ServiceCard.jsx';

export default function RestaurantInfrastructure({ item }) {
  const [before, after] = [item.features.slice(0, 4), item.features.slice(4)];
  const module = (feature, index) => (
    <li key={feature} className="ops__module" style={{ '--i': index }}>
      <span className="ops__num">{String(index + 1).padStart(2, '0')}</span>
      {feature}
    </li>
  );

  return (
    <ServiceCard item={item} className="service--restaurant">
      <p className="service__concept service__concept--large">{item.concept}</p>
      <p className="service__description">{item.description}</p>

      <ul className="ops" aria-label={`Funzionalità: ${item.title}`}>
        {before.map((feature, index) => module(feature, index))}
        <li className="ops__hub" aria-hidden="true">
          <span className="ops__hub-ring" />
          <span className="ops__hub-label">{item.hubLabel}</span>
        </li>
        {after.map((feature, index) => module(feature, index + before.length))}
      </ul>
    </ServiceCard>
  );
}
