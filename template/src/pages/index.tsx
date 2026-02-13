import { useState, useEffect } from 'react';

interface StatusCheck {
  react: boolean;
  api: boolean;
}

function HomePage() {
  const [status, setStatus] = useState<StatusCheck>({ react: true, api: false });

  useEffect(() => {
    fetch('/api/example')
      .then((res) => res.json())
      .then(() => setStatus((s) => ({ ...s, api: true })))
      .catch(() => setStatus((s) => ({ ...s, api: false })));
  }, []);

  return (
    <div className="stoix-page">
      <header className="stoix-hero">
        <h1 className="stoix-title">Stoix</h1>
        <p className="stoix-subtitle">
          A disciplined TypeScript framework built on React and Express.
        </p>
      </header>

      <div className="stoix-divider" />

      <section className="stoix-status">
        <h2 className="stoix-section-heading">System Status</h2>
        <div className="stoix-status-grid">
          <div className="stoix-status-item">
            <span className="stoix-status-label">React Rendering</span>
            <span className={`stoix-status-value ${status.react ? 'ok' : ''}`}>
              {status.react ? '✓' : '—'}
            </span>
          </div>
          <div className="stoix-status-item">
            <span className="stoix-status-label">API Connected</span>
            <span className={`stoix-status-value ${status.api ? 'ok' : ''}`}>
              {status.api ? '✓' : '—'}
            </span>
          </div>
        </div>
      </section>

      <div className="stoix-divider" />

      <blockquote className="stoix-quote">
        <p>
          "If it is not right, do not do it; if it is not true, do not say it."
        </p>
        <cite>— Marcus Aurelius</cite>
      </blockquote>

      <p className="stoix-principle">Structure before scale.</p>
    </div>
  );
}

export default HomePage;
