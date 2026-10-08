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
      <div className="services__crema" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 120 L0 64 C 160 20, 320 96, 520 60 C 720 24, 860 92, 1060 58 C 1220 30, 1340 70, 1440 44 L1440 120 Z" />
        </svg>
      </div>
      <div className="shell">
        <SectionHeader id="services-title" {...intro} />
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
