export default function Logo({ name, className = '' }) {
  const [initial, rest] = name.split('.');
  // Split the suffix into the base part and "AI" — the last two characters — for bicolor branding.
  const aiSuffix = 'AI';
  const base = rest.endsWith(aiSuffix) ? rest.slice(0, -aiSuffix.length) : rest;
  const ai = rest.endsWith(aiSuffix) ? aiSuffix : '';
  return (
    <span className={`logo ${className}`.trim()} aria-label={name} role="img">
      <span aria-hidden="true">{initial}</span>
      <span className="logo__dot" aria-hidden="true" />
      <span aria-hidden="true">{base}</span>
      {ai && <span className="logo__ai" aria-hidden="true">{ai}</span>}
    </span>
  );
}
