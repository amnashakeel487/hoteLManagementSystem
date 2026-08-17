import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
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
      
      // Use auth context to store credentials
      login(access_token, user);
      
      // Navigate based on role
      navigate(role === 'admin' ? '/admin' : '/owner');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
        <div className="aside-copy">
          <span className="eyebrow">Welcome back</span>
          <h2>Your dashboard picks up right where you left it.</h2>
          <p>Owners see their hotel's status and tools. Admins see every request across the platform.</p>
          <ul className="auth-checklist">
            <li><span className="tick">✓</span> Role-based access — owners see only their hotel</li>
            <li><span className="tick">✓</span> Admins get full platform oversight</li>
            <li><span className="tick">✓</span> Secured with hashed passwords &amp; JWT sessions</li>
          </ul>
        </div>
        <span style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'rgba(251,246,236,.45)' }}>
          Trouble logging in? support@stayfolio.com
        </span>
      </aside>

      <main className="auth-main" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="form-wrap" style={{ width: '100%' }}>
          <div className="top-link" style={{ marginBottom: '36px' }}>
            <Link to="/" className="btn btn-ghost btn-sm">← Back to home</Link>
          </div>
          <span className="eyebrow">Sign in</span>
          <h1>Log in to Stayfolio</h1>
          <p className="lede">Enter your credentials to reach your dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-32">
            <div className="field-group">
              <label>Email address</label>
              <input className="input" type="email" placeholder="you@hotel.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input className="input" type="password" placeholder="••••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-between items-center mt-8" style={{ marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 400, fontSize: '.85rem', margin: 0 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '.85rem', color: 'var(--brass-dark)', fontWeight: 600 }}>Forgot password?</a>
            </div>
            {error && <p style={{ color: 'var(--rust)', fontSize: '.85rem' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-block mt-24" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <div className="mt-32" style={{ textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '.88rem' }}>Don't have an account?</span>
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--ink)', marginLeft: '6px' }}>Register your hotel →</Link>
          </div>

          <div className="mt-32" style={{ paddingTop: '24px', borderTop: '1px solid var(--hairline)', textAlign: 'center' }}>
            <Link to="/admin" className="text-muted" style={{ fontSize: '.8rem', fontFamily: 'var(--font-mono)' }}>
              Preview admin console instead →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
