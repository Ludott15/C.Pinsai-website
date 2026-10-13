import Hero from '../components/Hero.jsx';
import SelfAssessment from '../components/SelfAssessment.jsx';
import Services from '../components/Services.jsx';
import ProposalsTeaser from '../components/ProposalsTeaser.jsx';
import Metrics from '../components/Metrics.jsx';
import ContactSection from '../components/ContactSection.jsx';
import PageShell from './PageShell.jsx';
import { mount } from './mount.jsx';

mount('home', ({ site, assessment, services, metrics }) => (
  <PageShell>
    <Hero content={site.hero} dive={site.dive} brandName={site.brand.name} />
    <SelfAssessment data={assessment} />
    <Services intro={site.solutionsIntro} items={services.solutions} />
    <ProposalsTeaser content={site.proposalsTeaser} />
    <Metrics intro={site.metricsIntro} items={metrics.items} whyLabel={metrics.whyLabel} />
    <ContactSection content={site.contact} />
  </PageShell>
));
