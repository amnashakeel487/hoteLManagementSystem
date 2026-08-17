import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ role = 'owner', items, who }) {
  const [navigating, setNavigating] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (href) => {
    if (href && href !== '#') {
      setNavigating(true);
      // Small delay to show visual feedback
      setTimeout(() => {
        navigate(href);
        setNavigating(false);
      }, 50);
    }
  };

  return (
    <aside className="app-sidebar">
      <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
      <nav className="side-nav">
        {items.map((group, gi) => (
          <div key={gi}>
            {group.label && <span className="nav-sep">{group.label}</span>}
            {group.links.map((link) => {
              if (link.onClick) {
                return (
                  <button 
                    key={link.text} 
                    onClick={link.onClick} 
                    className={`nav-btn ${link.active ? 'active' : ''}`}
                    disabled={navigating}
                  >
                    <span className="ico">{link.icon}</span> {link.text}
                  </button>
                );
              }
              
              if (link.href && link.href !== '#') {
                return (
                  <button
                    key={link.text}
                    onClick={() => handleNavigation(link.href)}
                    className={`nav-btn ${link.active ? 'active' : ''}`}
                    disabled={navigating}
                    style={{ 
                      opacity: navigating ? 0.7 : 1,
                      transition: 'all 0.15s ease-out'
                    }}
                  >
                    <span className="ico">{link.icon}</span> {link.text}
                  </button>
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
        <div className="avatar" style={who.avatarStyle}>{who.initials}</div>
        <div className="who">
          <b>{who.name}</b>
          <span>{who.subtitle}</span>
        </div>
      </div>
    </aside>
  );
}
