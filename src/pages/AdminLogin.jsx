import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const resText = await res.text();
      let data = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (e) {
        throw new Error(res.ok ? 'Received invalid response from server' : `Server error (${res.status})`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || data.message || `Login failed (${res.status})`);
      }
      
      const { access_token, role, user } = data;
      
      if (role !== 'admin') {
        throw new Error('Access denied. This login portal is restricted strictly to Platform Administrators.');
      }
      
      login(access_token, user);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside" style={{ background: '#0b1329', borderRight: '1px solid rgba(255,255,255,0.1)', justifyContent: 'flex-start', gap: '28px' }}>
        <Link to="/" className="brand" style={{ color: '#FBF6EC', display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span className="mark" style={{ background: 'var(--brass)' }}></span>
          <span style={{ color: '#FBF6EC', fontWeight: 700, letterSpacing: '-0.01em' }}>Stayfolio</span>
        </Link>
        <div className="aside-copy" style={{ marginTop: '0px' }}>
          <span className="eyebrow" style={{ color: 'var(--brass)' }}>Platform Administration</span>
          <h2 style={{ color: '#fff', marginTop: '8px' }}>Admin Control Console</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Restricted authentication area for Stayfolio platform administrators to manage hotel registrations, reviews, cleaning services, and system settings.
          </p>
          <ul className="auth-checklist" style={{ marginTop: '28px' }}>
            <li><span className="tick" style={{ background: 'var(--brass)', color: '#000' }}>✓</span> Review and approve pending hotel registrations</li>
            <li><span className="tick" style={{ background: 'var(--brass)', color: '#000' }}>✓</span> Suspend, reactivate, and audit hotel properties</li>
            <li><span className="tick" style={{ background: 'var(--brass)', color: '#000' }}>✓</span> Platform analytics, exports, and team assignments</li>
          </ul>
        </div>
        <span style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 'auto', paddingTop: '20px' }}>
          System Security Level: Restricted (Admin Only)
        </span>
      </aside>

      <main className="auth-main" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="form-wrap" style={{ width: '100%' }}>
          <div className="top-link" style={{ marginBottom: '36px' }}>
            <Link to="/" className="btn btn-ghost btn-sm">← Back to home</Link>
          </div>
          <span className="eyebrow" style={{ color: 'var(--emerald)' }}>Admin Authentication</span>
          <h1>Admin Console Login</h1>
          <p className="lede">Enter your administrator credentials to access the platform control panel.</p>

          <div style={{ background: 'rgba(176, 141, 87, 0.08)', border: '1px solid rgba(176, 141, 87, 0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '.85rem' }}>
            💡 <strong>Demo Credentials:</strong> <code>admin@stayfolio.com</code> / <code>admin123</code>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Admin Email Address</label>
              <input className="input" type="email" placeholder="admin@stayfolio.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Admin Password</label>
              <input className="input" type="password" placeholder="••••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <p style={{ color: 'var(--rust)', fontSize: '.85rem', marginTop: '8px' }}>⚠️ {error}</p>}

            <button type="submit" className="btn btn-primary btn-block mt-24" style={{ background: 'var(--ink)' }} disabled={submitting}>
              {submitting ? 'Authenticating Admin…' : 'Log in as Admin'}
            </button>
          </form>

          <div className="mt-32" style={{ paddingTop: '24px', borderTop: '1px solid var(--hairline)', textAlign: 'center' }}>
            <Link to="/login" className="text-muted" style={{ fontSize: '.85rem', color: 'var(--brass-dark)', fontWeight: 600 }}>
              Hotel Owner? Log in to Owner Portal instead →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
