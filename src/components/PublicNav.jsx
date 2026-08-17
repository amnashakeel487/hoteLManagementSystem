import { Link } from 'react-router-dom';

export default function PublicNav() {
  return (
    <nav className="nav" style={{ background: 'var(--navy-900)', borderBottom: '1px solid rgba(251,246,236,0.1)' }}>
      <div className="container nav-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
        <Link to="/explore" className="brand" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
          <span className="mark" style={{ width: '12px', height: '12px', background: 'var(--brass)', borderRadius: '2px' }}></span>
          Stayfolio <span style={{ fontSize: '.72rem', color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, border: '1px solid var(--brass)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Guest Portal</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/explore" style={{ color: 'rgba(251,246,236,0.85)', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 }}>
            Explore Stays
          </Link>
          <Link to="/" style={{ color: 'rgba(251,246,236,0.7)', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 }}>
            List Your Hotel
          </Link>
          <Link to="/login" className="btn btn-ghost btn-sm on-dark" style={{ borderColor: 'rgba(251,246,236,0.25)', color: '#fff' }}>
            Owner / Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
