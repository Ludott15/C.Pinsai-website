export default function Logo({ name, className = '' }) {
  const [initial, rest] = name.split('.');
  return (
    <span className={`logo ${className}`.trim()} aria-label={name} role="img">
      <span aria-hidden="true">{initial}</span>
      <span className="logo__dot" aria-hidden="true" />
      <span aria-hidden="true">{rest}</span>
    </span>
  );
}
