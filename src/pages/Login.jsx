import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

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
      
      login(access_token, user);
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/owner');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
        <div className="aside-copy">
          <span className="eyebrow">Hotel Owner Portal</span>
          <h2>Welcome back to your operating dashboard.</h2>
          <p>Hotel owners can log in here once their registered property has been reviewed and approved by platform administration.</p>
          <ul className="auth-checklist">
            <li><span className="tick">✓</span> Access after hotel registration approval</li>
            <li><span className="tick">✓</span> Manage room categories, pricing &amp; gallery photos</li>
            <li><span className="tick">✓</span> Accept booking requests &amp; review guest ratings</li>
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
          <span className="eyebrow">Hotel Owner Access</span>
          <h1>Owner Login</h1>
          <p className="lede">Log in to manage your property once your registered hotel has been approved.</p>

          <form onSubmit={handleSubmit} className="mt-32">
            <div className="field-group">
              <label>Owner Email address</label>
              <input className="input" type="email" placeholder="owner@marlowhotel.com"
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
            {error && <p style={{ color: 'var(--rust)', fontSize: '.85rem', marginTop: '8px' }}>⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary btn-block mt-24" disabled={submitting}>
              {submitting ? 'Signing in as Owner…' : 'Owner Log in'}
            </button>
          </form>

          <div className="mt-32" style={{ textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '.88rem' }}>Haven't registered your hotel yet?</span>
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--ink)', marginLeft: '6px' }}>Register hotel →</Link>
          </div>

          <div className="mt-32" style={{ paddingTop: '24px', borderTop: '1px solid var(--hairline)', textAlign: 'center' }}>
            <Link to="/admin-login" className="text-muted" style={{ fontSize: '.8rem', fontFamily: 'var(--font-mono)', color: 'var(--brass-dark)', fontWeight: 600 }}>
              Platform Administrator? Log in to Admin Console →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
