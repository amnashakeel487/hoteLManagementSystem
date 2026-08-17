import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const pathways = document.getElementById('pathways');
        const workflow = document.getElementById('workflow');
        const dashboard = document.getElementById('dashboard');
        const scrollPos = window.scrollY + 250;

        if (dashboard && scrollPos >= dashboard.offsetTop) {
          setActiveSection('dashboard');
        } else if (workflow && scrollPos >= workflow.offsetTop) {
          setActiveSection('workflow');
        } else if (pathways && scrollPos >= pathways.offsetTop) {
          setActiveSection('pathways');
        } else {
          setActiveSection('');
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location]);

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    setOpen(false);
    setActiveSection(sectionId);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="site-nav">
      <div className="container">
        <Link to="/" className="brand">
          <span className="mark"></span> Stayfolio
        </Link>
        <div className={`nav-links${open ? ' open' : ''}`}>
          <Link to="/explore" onClick={() => setOpen(false)} style={{ color: 'var(--brass)', fontWeight: 600 }}>Explore Stays ↗</Link>
          <a 
            href="#pathways" 
            onClick={(e) => handleSectionClick(e, 'pathways')}
            className={activeSection === 'pathways' ? 'active-nav-link' : ''}
          >
            Onboarding
          </a>
          <a 
            href="#workflow" 
            onClick={(e) => handleSectionClick(e, 'workflow')}
            className={activeSection === 'workflow' ? 'active-nav-link' : ''}
          >
            Approval Flow
          </a>
          <a 
            href="#dashboard" 
            onClick={(e) => handleSectionClick(e, 'dashboard')}
            className={activeSection === 'dashboard' ? 'active-nav-link' : ''}
          >
            Dashboard
          </a>
          <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
        </div>
        <div className="nav-cta">
          <Link to="/explore" className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--brass)', color: 'var(--brass-dark)' }}>Book a stay</Link>
          <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register hotel</Link>
          <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
