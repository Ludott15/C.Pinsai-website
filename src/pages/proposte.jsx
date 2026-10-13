import Proposals from '../components/Proposals.jsx';
import ContactSection from '../components/ContactSection.jsx';
import PageShell from './PageShell.jsx';
import { mount } from './mount.jsx';

mount(
  'proposte',
  ({ site, proposals }) => (
    <PageShell>
      <Proposals intro={site.proposalsIntro} data={proposals} phone={site.contact.phoneE164} />
      <ContactSection content={site.contact} />
    </PageShell>
  ),
  { anchors: ['#contatti'] },
);
