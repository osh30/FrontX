import { useEffect, useRef, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

const format = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const useMeetingTimer = (active) => {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active) return undefined;
    if (startRef.current === null) startRef.current = Date.now();
    const id = setInterval(() => {
      if (!activeRef.current) return;
      setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return { value: elapsed, display: format(elapsed) };
};
