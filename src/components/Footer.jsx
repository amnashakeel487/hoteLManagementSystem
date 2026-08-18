import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
            <p>The onboarding and approval layer for hotel booking platforms — from first submission to live listing.</p>
          </div>
          <div className="foot-col">
            <h5>Platform</h5>
            <Link to="/#pathways">Onboarding</Link>
            <Link to="/#workflow">Approval flow</Link>
            <Link to="/#dashboard">Owner dashboard</Link>
          </div>
          <div className="foot-col">
            <h5>Access</h5>
            <Link to="/register">Register a hotel</Link>
            <Link to="/login">Owner Login</Link>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Support</a>
            <a href="#">Security &amp; RLS policy</a>
          </div>
        </div>
        <div className="foot-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>© 2026 Stayfolio</span>
            <span style={{ color: 'var(--brass-light)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              Built by <strong style={{ fontFamily: 'var(--font-body)', letterSpacing: 'normal' }}>Amna Shakeel</strong> · SE · Full Stack · AI &amp; ML
            </span>
          </div>
          <span>Built for hotel owners, run by admins</span>
        </div>
      </div>
    </footer>
  );
}
