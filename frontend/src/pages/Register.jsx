import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    value: 'customer', icon: '🛒', title: 'I need services',
    desc: 'Book AC repair, plumbing, grooming & more at home',
    color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd',
  },
  {
    value: 'provider', icon: '🔧', title: 'I provide services',
    desc: 'Join as a professional and earn by taking service jobs',
    color: 'var(--blink-green)', bg: '#dcfce7', border: '#bbf7d0',
  },
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError("Passwords don't match");
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    const result = await register({ ...form, role });
    if (result.success) navigate(result.role === 'provider' ? '/provider/kyc' : '/');
    else setError(result.message);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f0fdf4',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, background: 'var(--blink-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 12px',
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24 }}>Join QuickServe</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s ? 'var(--blink-green)' : '#e5e7eb',
                color: step >= s ? 'white' : '#9ca3af',
                transition: 'all 0.3s',
              }}>{s}</div>
              {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--blink-green)' : '#e5e7eb', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        <div className="blink-card animate-scale-in" style={{ padding: 32 }}>
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Choose your role</h2>
              <p style={{ fontSize: 13, color: 'var(--blink-text2)', marginBottom: 22 }}>How do you want to use QuickServe?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {ROLES.map(r => (
                  <button key={r.value} onClick={() => setRole(r.value)} style={{
                    padding: '18px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${role === r.value ? r.color : '#e5e7eb'}`,
                    background: role === r.value ? r.bg : 'white',
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, fontSize: 22,
                      background: role === r.value ? r.bg : '#f9fafb',
                      border: `1.5px solid ${role === r.value ? r.border : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: role === r.value ? r.color : 'var(--blink-text)' }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--blink-text2)', marginTop: 3 }}>{r.desc}</div>
                    </div>
                    {role === r.value && <div style={{ fontSize: 20, color: r.color }}>✓</div>}
                  </button>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 15 }}
                disabled={!role} onClick={() => setStep(2)}>
                Continue →
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--blink-text2)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--blink-green)', fontWeight: 800 }}>Sign in →</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                color: 'var(--blink-text2)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 4,
              }}>← Back</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 28 }}>{role === 'provider' ? '🔧' : '🛒'}</div>
                <div>
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18 }}>Create your account</h2>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 100,
                    background: role === 'provider' ? '#dcfce7' : '#e0f2fe',
                    color: role === 'provider' ? 'var(--blink-green)' : '#0284c7',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{role}</span>
                </div>
              </div>

              {role === 'provider' && (
                <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                  📋 After registration you'll submit <strong>Aadhaar / PAN + selfie</strong> for KYC before accepting jobs.
                </div>
              )}

              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { k: 'name', label: 'Full Name', placeholder: 'Rahul Sharma', type: 'text', icon: '👤' },
                  { k: 'email', label: 'Email Address', placeholder: 'rahul@example.com', type: 'email', icon: '📧' },
                  { k: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel', icon: '📱' },
                  { k: 'password', label: 'Password', placeholder: 'Min. 6 characters', type: 'password', icon: '🔑' },
                  { k: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat password', type: 'password', icon: '🔒' },
                ].map(({ k, label, placeholder, type, icon }) => (
                  <div key={k}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--blink-text2)', display: 'block', marginBottom: 5 }}>{label}</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon" style={{ fontSize: 15 }}>{icon}</span>
                      <input type={type} placeholder={placeholder} required value={form[k]} onChange={set(k)} style={{ paddingLeft: 42 }} />
                    </div>
                  </div>
                ))}
                <button type="submit" className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: 15, marginTop: 6, fontSize: 15 }}
                  disabled={loading}>
                  {loading
                    ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating...</>
                    : role === 'provider' ? 'Create Account & Start KYC →' : 'Create Account →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
