import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    const result = await register(form.name, form.email, form.password, form.phone);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 36,
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 6, fontSize: 14 }}>
            Join QuickServe and get help in minutes
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            fontSize: 14, color: 'var(--accent)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Full Name</label>
            <input placeholder="John Doe" required value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="you@example.com" required value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Phone Number</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="Min. 6 characters" required value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
            <input type="password" placeholder="Repeat password" required value={form.confirmPassword} onChange={set('confirmPassword')} />
          </div>
          <button
            type="submit" className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 16, marginTop: 6, fontSize: 15 }}
            disabled={loading}
          >
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
