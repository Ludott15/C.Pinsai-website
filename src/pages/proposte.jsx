import site from '../data/site.json';
import proposals from '../data/proposals.json';
import Proposals from '../components/Proposals.jsx';
import PageShell from './PageShell.jsx';
import { mount } from './mount.jsx';

mount(
  { id: 'proposte', root: '../' },
  <PageShell>
    <Proposals intro={site.proposalsIntro} categories={proposals.categories} />
  </PageShell>,
);
