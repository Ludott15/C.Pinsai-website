import site from '../data/site.json';
import services from '../data/services.json';
import Services from '../components/Services.jsx';
import ProposalsTeaser from '../components/ProposalsTeaser.jsx';
import PageShell from './PageShell.jsx';
import { mount } from './mount.jsx';

mount(
  { id: 'soluzioni', root: '../' },
  <PageShell>
    <Services intro={site.solutionsIntro} items={services.solutions} />
    <ProposalsTeaser content={site.proposalsTeaser} />
  </PageShell>,
);
