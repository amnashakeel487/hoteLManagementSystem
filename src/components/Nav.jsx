import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="site-nav">
      <div className="container">
        <Link to="/" className="brand">
          <span className="mark"></span> Stayfolio
        </Link>
        <div className={`nav-links${open ? ' open' : ''}`}>
          <Link to="/#pathways" onClick={() => setOpen(false)}>Onboarding</Link>
          <Link to="/#workflow" onClick={() => setOpen(false)}>Approval Flow</Link>
          <Link to="/#dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register your hotel</Link>
          <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
