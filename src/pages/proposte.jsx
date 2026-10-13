import site from '../data/site.json';
import proposals from '../data/proposals.json';
import Proposals from '../components/Proposals.jsx';
import PageShell from './PageShell.jsx';
import ContactSection from '../components/ContactSection.jsx';
import { mount } from './mount.jsx';

mount(
  { id: 'proposte', root: '../', anchors: ['#contatti'] },
  <PageShell>
    <Proposals intro={site.proposalsIntro} data={proposals} phone={site.contact.phoneE164} />
    <ContactSection content={site.contact} />
  </PageShell>,
);
