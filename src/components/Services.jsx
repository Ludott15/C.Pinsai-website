import SectionHeader from './SectionHeader.jsx';
import TailoredService from './services/TailoredService.jsx';
import FacilitAI from './services/FacilitAI.jsx';

const SOLUTIONS = {
  tailored: TailoredService,
  facilitai: FacilitAI,
};

export default function Services({ intro, items }) {
  return (
    <section id="soluzioni" className="services" aria-labelledby="services-title">
      <div className="shell">
        <SectionHeader id="services-title" as="h1" {...intro} />
        <div className="services__grid">
          {items.map((item) => {
            const Solution = SOLUTIONS[item.id];
            return Solution ? <Solution key={item.id} item={item} /> : null;
          })}
        </div>
      </div>
    </section>
  );
}
