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

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 36, animation: 'fadeIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', marginTop: 6, fontSize: 14 }}>Sign in to your QuickServe account</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--accent)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, marginTop: 6, fontSize: 15 }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        {/* Demo accounts hint */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Accounts</div>
          {[
            { role: 'Admin', email: 'admin@quickserve.in', color: 'var(--purple)' },
            { role: 'Provider', email: 'provider@quickserve.in', color: 'var(--accent)' },
            { role: 'Customer', email: 'user@quickserve.in', color: 'var(--blue)' },
          ].map(({ role, email, color }) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color, fontWeight: 600 }}>{role}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>{email} / password123</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one →</Link>
        </p>
      </div>
    </div>
  );
}
