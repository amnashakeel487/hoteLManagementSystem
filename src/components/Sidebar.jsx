import { Link } from 'react-router-dom';

export default function Sidebar({ role = 'owner', items, who }) {
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
  );
}
