/**
 * Wavy edge between sections. At the bottom (default) it is drawn in the colour of the section
 * that follows; with edge="top" it rises above the section, in the section's own colour.
 */
export default function SectionWave({ to, edge = 'bottom' }) {
  return (
    <div className={`wave wave--${to}${edge === 'top' ? ' wave--top' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 120 L0 64 C 160 20, 320 96, 520 60 C 720 24, 860 92, 1060 58 C 1220 30, 1340 70, 1440 44 L1440 120 Z" />
      </svg>
    </div>
  );
}
