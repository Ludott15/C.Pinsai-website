/** Wavy edge at the bottom of a section, in the colour of the section that follows. */
export default function SectionWave({ to }) {
  return (
    <div className={`wave wave--${to}`} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 120 L0 64 C 160 20, 320 96, 520 60 C 720 24, 860 92, 1060 58 C 1220 30, 1340 70, 1440 44 L1440 120 Z" />
      </svg>
    </div>
  );
}
