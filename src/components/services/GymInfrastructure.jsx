import ServiceCard from './ServiceCard.jsx';

export default function GymInfrastructure({ item }) {
  return (
    <ServiceCard item={item} className="service--gym">
      <p className="service__concept service__concept--large">{item.concept}</p>

      <div className="gym">
        <div className="gym__stack" aria-hidden="true">
          {item.layers.map((layer, index) => (
            <span key={layer.id} className={`gym__plate gym__plate--${layer.id}`} style={{ '--i': index }}>
              <span>{layer.name}</span>
            </span>
          ))}
        </div>

        <ol className="gym__layers">
          {item.layers.map((layer) => (
            <li key={layer.id} className={`gym__layer${layer.gem ? ' gym__layer--gem' : ''}`}>
              <p className="gym__level">
                <span className="mono">{layer.level}</span>
                <span className="gym__name">{layer.name}</span>
                {layer.gem && (
                  <span className="gym__gem">
                    <span aria-hidden="true">◆</span> {layer.gem}
                  </span>
                )}
              </p>
              <p className="gym__lead">{layer.lead}:</p>
              <ul className="gym__items">
                {layer.items.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </ServiceCard>
  );
}
