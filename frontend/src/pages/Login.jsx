import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECT = { admin: '/admin', provider: '/provider/dashboard', customer: '/' };

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_REDIRECT[result.role] || '/');
    } else setError(result.message);
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div style={{
      minHeight: '100vh', background: '#f0fdf4',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, background: 'var(--blink-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 12px',
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--blink-text)' }}>
            Welcome back!
          </h1>
          <p style={{ color: 'var(--blink-text2)', marginTop: 4, fontSize: 14 }}>
            Sign in to your QuickServe account
          </p>
        </div>

        <div className="blink-card animate-scale-in" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 14, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--blink-text)', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <div className="input-icon-wrap">
                <span className="input-icon" style={{ fontSize: 16 }}>📧</span>
                <input
                  type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--blink-text)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div className="input-icon-wrap">
                <span className="input-icon" style={{ fontSize: 16 }}>🔑</span>
                <input
                  type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <button
              type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16, marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
                : 'Sign In →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 20, background: '#f9fafb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎭 Try Demo Accounts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { role: 'Customer', email: 'user@quickserve.in', color: '#0284c7', bg: '#e0f2fe', icon: '🛒' },
                { role: 'Provider', email: 'provider@quickserve.in', color: 'var(--blink-green)', bg: '#dcfce7', icon: '🔧' },
                { role: 'Admin', email: 'admin@quickserve.in', color: '#7c3aed', bg: '#ede9fe', icon: '🛡️' },
              ].map(({ role, email, color, bg, icon }) => (
                <button key={role} onClick={() => fillDemo(email)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: bg, border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>
                    {icon} {role}
                  </span>
                  <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                    {email}
                  </span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
              Password: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>password123</span>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--blink-text2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blink-green)', fontWeight: 800 }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
