import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ role = 'owner', items, who }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (originalOnClick) => (e) => {
    setIsOpen(false);
    if (originalOnClick) {
      originalOnClick(e);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Trigger (visible only on mobile below 860px) */}
      <button 
        type="button"
        className="mobile-sidebar-toggle"
        aria-label="Toggle Dashboard Menu"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="toggle-icon">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Backdrop overlay for mobile drawer */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 8px' }}>
          <Link to="/" className="brand" onClick={() => setIsOpen(false)} style={{ color: 'var(--parchment)', display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span className="mark"></span> Stayfolio
          </Link>
          <button 
            type="button"
            className="sidebar-close-btn"
            aria-label="Close Sidebar"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="side-nav">
          {items.map((group, gi) => (
            <div key={gi}>
              {group.label && <span className="nav-sep">{group.label}</span>}
              {group.links.map((link) => {
                if (link.onClick) {
                  return (
                    <button 
                      key={link.text} 
                      onClick={handleLinkClick(link.onClick)} 
                      className={`nav-btn ${link.active ? 'active' : ''}`}
                    >
                      <span className="ico">{link.icon}</span> {link.text}
                    </button>
                  );
                }
                
                if (link.href && link.href !== '#') {
                  return (
                    <Link
                      key={link.text}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`nav-btn ${link.active ? 'active' : ''}`}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="ico">{link.icon}</span> {link.text}
                    </Link>
                  );
                }
                
                return (
                  <button key={link.text} className={link.active ? 'active nav-btn' : 'nav-btn'} disabled>
                    <span className="ico">{link.icon}</span> {link.text}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="avatar" style={who?.avatarStyle}>{who?.initials}</div>
          <div className="who">
            <b>{who?.name}</b>
            <span>{who?.subtitle}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
