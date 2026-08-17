import { Link } from 'react-router-dom';

export default function PublicNav() {
  return (
    <nav style={{
      background: '#0a1128',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '68px',
        padding: '0 24px'
      }}>
        {/* Brand */}
        <Link to="/explore" style={{
          color: '#ffffff',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.3rem',
          fontWeight: 700,
          letterSpacing: '-0.01em'
        }}>
          <span style={{
            width: '14px',
            height: '14px',
            background: '#c5a880',
            borderRadius: '3px',
            display: 'inline-block'
          }}></span>
          Stayfolio
          <span style={{
            fontSize: '.7rem',
            color: '#c5a880',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            border: '1px solid #c5a880',
            background: 'rgba(197, 168, 128, 0.12)',
            padding: '3px 8px',
            borderRadius: '4px',
            marginLeft: '4px'
          }}>
            Guest Portal
          </span>
        </Link>

        {/* Links & Navigation CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/explore" style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '.92rem',
            fontWeight: 600,
            transition: 'color 0.2s'
          }}>
            Explore Stays
          </Link>
          <Link to="/" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '.92rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}>
            List Your Hotel
          </Link>
          <Link to="/login" style={{
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            textDecoration: 'none',
            fontSize: '.85rem',
            fontWeight: 600,
            padding: '8px 18px',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}>
            Owner / Admin Login →
          </Link>
        </div>
      </div>
    </nav>
  );
}
