import { useEffect, useRef, useState } from 'react';

/** Counts up from 0 to `value` once visible. suffix e.g. "+", "%", " countries" */
export default function Counter({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const t0 = performance.now();
          const dur = 1400;
          function tick(now) {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay((value * eased).toFixed(decimals));
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, decimals]);

  return (
    <b ref={ref}>
      {display}
      {suffix}
    </b>
  );
}
