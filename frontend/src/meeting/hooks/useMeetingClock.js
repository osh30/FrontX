import { useEffect, useState } from 'react';

// Provides a `now` timestamp that ticks every second so schedule-window based
// Join gates (Upcoming -> Active -> Ended) update automatically on the page.
// A shared module-level timestamp lets multiple components stay in sync and
// avoids each component running its own interval.
export const useMeetingClock = (intervalMs = 5000) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};

export default useMeetingClock;