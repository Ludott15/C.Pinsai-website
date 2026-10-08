import ServiceCard from './ServiceCard.jsx';

export default function RestaurantEvents({ item }) {
  return (
    <ServiceCard item={item} className="service--events">
      <p className="service__concept">{item.concept}</p>
      <p className="service__description">{item.description}</p>

      <ol className="journey">
        {item.journey.map((step, index) => (
          <li key={step.label} className="journey__step" style={{ '--i': index }}>
            <span className="journey__dot" aria-hidden="true" />
            <span className="journey__label">{step.label}</span>
            <span className="journey__detail">{step.detail}</span>
          </li>
        ))}
      </ol>

      <figure className="story">
        <figcaption className="story__label">Un esempio</figcaption>
        <p className="story__text">{item.story}</p>
      </figure>
    </ServiceCard>
  );
}
