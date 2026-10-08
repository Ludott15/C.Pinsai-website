import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const getInitial = () =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
