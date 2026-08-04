import { useEffect, useRef, useState } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const TurnstileWidget = ({ onChange, theme = 'dark' }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      setLoadError(true);
      return undefined;
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      try {
        if (containerRef.current.childNodes.length) containerRef.current.innerHTML = '';
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: 'normal',
          callback: (token) => onChange(token),
          'expired-callback': () => onChange(''),
          'error-callback': () => {
            onChange('');
            setLoadError(true);
          },
        });
      } catch (err) {
        setLoadError(true);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (loadError) {
    return (
      <div className="w-full min-h-[65px] flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
        <p className="text-xs text-red-400">Unable to load the security check. Please refresh the page and try again.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
};

export default TurnstileWidget;
