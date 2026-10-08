import SectionHeader from './SectionHeader.jsx';
import RestaurantInfrastructure from './services/RestaurantInfrastructure.jsx';
import RestaurantEvents from './services/RestaurantEvents.jsx';
import GymInfrastructure from './services/GymInfrastructure.jsx';

const VERTICALS = {
  'restaurant-classic': RestaurantInfrastructure,
  'restaurant-events': RestaurantEvents,
  gym: GymInfrastructure,
};

export default function Verticals({ intro, items }) {
  return (
    <section id="infrastrutture" className="verticals" aria-labelledby="verticals-title">
      <div className="shell">
        <SectionHeader id="verticals-title" {...intro} />
        <div className="verticals__grid">
          {items.map((item) => {
            const Vertical = VERTICALS[item.id];
            return Vertical ? <Vertical key={item.id} item={item} /> : null;
          })}
        </div>
      </div>
    </section>
  );
}
