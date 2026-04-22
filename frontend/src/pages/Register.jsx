import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
  { value: 'customer', icon: '🛒', title: 'I need services', desc: 'Book AC repair, plumbing, grooming & more at home', color: 'var(--blue)', colorBg: 'rgba(59,130,246,0.08)', colorBorder: 'rgba(59,130,246,0.3)' },
  { value: 'provider', icon: '🔧', title: 'I provide services', desc: 'Join as a professional and earn by taking service jobs', color: 'var(--accent)', colorBg: 'rgba(255,92,43,0.08)', colorBorder: 'rgba(255,92,43,0.3)' },
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    const result = await register({ ...form, role: selectedRole });
    if (result.success) {
      if (result.role === 'provider') navigate('/provider/kyc');
      else navigate('/');
    } else setError(result.message);
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.3s ease' }}>
        {step === 1 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 36 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }}>Join QuickServe</h1>
              <p style={{ color: 'var(--text2)', marginTop: 8, fontSize: 15 }}>How do you want to use QuickServe?</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {roles.map(r => (
                <button key={r.value} onClick={() => setSelectedRole(r.value)} style={{
                  padding: '20px 22px', borderRadius: 'var(--radius)',
                  border: `2px solid ${selectedRole === r.value ? r.color : 'var(--border)'}`,
                  background: selectedRole === r.value ? r.colorBg : 'var(--bg)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, fontSize: 24, background: selectedRole === r.value ? r.colorBg : 'var(--surface2)', border: `1px solid ${selectedRole === r.value ? r.colorBorder : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                  {selectedRole === r.value && <div style={{ marginLeft: 'auto', color: r.color, fontSize: 20 }}>✓</div>}
                </button>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 15, fontSize: 15 }} disabled={!selectedRole} onClick={() => setStep(2)}>Continue →</button>
            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--text2)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link></p>
          </div>
        )}
        {step === 2 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 36 }}>
            <button onClick={() => setStep(1)} className="btn-ghost" style={{ marginBottom: 20, padding: '6px 0' }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{selectedRole === 'provider' ? '🔧' : '🛒'}</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>Create your account</h1>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${selectedRole === 'provider' ? 'badge-urgent' : 'badge-blue'}`} style={{ fontSize: 12 }}>{selectedRole === 'provider' ? '🔧 Service Provider' : '🛒 Customer'}</span>
              </div>
              {selectedRole === 'provider' && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,92,43,0.08)', border: '1px solid rgba(255,92,43,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                  📋 After registration you'll upload your <strong style={{ color: 'var(--text)' }}>Aadhaar or PAN</strong> + selfie for KYC verification before accepting jobs.
                </div>
              )}
            </div>
            {error && <div style={{ background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 18, fontSize: 14, color: 'var(--accent)' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                { k: 'name', label: 'Full Name', placeholder: 'Rahul Sharma', type: 'text' },
                { k: 'email', label: 'Email Address', placeholder: 'rahul@example.com', type: 'email' },
                { k: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                { k: 'password', label: 'Password', placeholder: 'Min. 6 characters', type: 'password' },
                { k: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat password', type: 'password' },
              ].map(({ k, label, placeholder, type }) => (
                <div key={k}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{label}</label>
                  <input type={type} placeholder={placeholder} required value={form[k]} onChange={set(k)} />
                </div>
              ))}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 15, marginTop: 6, fontSize: 15 }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating...</> : selectedRole === 'provider' ? 'Create Account & Start KYC →' : 'Create Account →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
