import site from './data/site.json';
import assessment from './data/assessment.json';
import services from './data/services.json';
import metrics from './data/metrics.json';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import SelfAssessment from './components/SelfAssessment.jsx';
import Services from './components/Services.jsx';
import Verticals from './components/Verticals.jsx';
import Metrics from './components/Metrics.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <Header brand={site.brand} navigation={site.navigation} cta={site.navCta} />
      <main id="main" tabIndex={-1}>
        <Hero content={site.hero} dive={site.dive} brandName={site.brand.name} />
        <SelfAssessment data={assessment} />
        <Services intro={site.solutionsIntro} items={services.solutions} />
        <Verticals intro={site.verticalsIntro} items={services.verticals} />
        <Metrics intro={site.metricsIntro} items={metrics.items} />
        <FinalCTA content={site.finalCta} />
        <ContactSection content={site.contact} />
      </main>
      <Footer
        brand={site.brand}
        content={site.footer}
        navigation={site.navigation}
        contact={site.contact}
        legal={site.legal}
      />
    </>
  );
}
