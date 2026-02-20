import { useState, useEffect } from 'react';

interface StatusCheck {
  react: boolean;
  api: boolean;
}

function App() {
  const [status, setStatus] = useState<StatusCheck>({ react: true, api: false });

  useEffect(() => {
    fetch('/api/example')
      .then((res) => res.json())
      .then(() => setStatus((s) => ({ ...s, api: true })))
      .catch(() => setStatus((s) => ({ ...s, api: false })));
  }, []);

  return (
    <div className="stoix-app">
      <main className="stoix-main">
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
                  {status.react ? 'OK' : '--'}
                </span>
              </div>
              <div className="stoix-status-item">
                <span className="stoix-status-label">API Connected</span>
                <span className={`stoix-status-value ${status.api ? 'ok' : ''}`}>
                  {status.api ? 'OK' : '--'}
                </span>
              </div>
            </div>
          </section>

          <div className="stoix-divider" />

          <blockquote className="stoix-quote">
            <p>
              "You have power over your mind -- not outside events. Realize this, and you will find strength."
            </p>
            <cite>- Marcus Aurelius</cite>
          </blockquote>

          <p className="stoix-principle">Structure before scale.</p>
        </div>
      </main>

      <footer className="stoix-footer">
        <div className="stoix-footer-line" />
        <p>Stoix v0.1</p>
      </footer>
    </div>
  );
}

export default App;
