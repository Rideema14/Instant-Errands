import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 className="section-title">My Profile</h1>
      <p className="section-sub">Manage your account information</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Avatar */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--blink-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: 'white',
            fontFamily: 'Poppins, sans-serif',
          }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 20 }}>{user?.name}</div>
            <div style={{ color: 'var(--blink-text2)', fontSize: 14 }}>{user?.email}</div>
            <span className="badge badge-blue" style={{ marginTop: 8 }}>{user?.role}</span>
          </div>
        </div>

        {/* Personal Info */}
        <div className="card">
          <div style={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: 16 }}>Personal Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--blink-text2)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--blink-text2)', display: 'block', marginBottom: 6 }}>Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--blink-text2)', display: 'block', marginBottom: 6 }}>Email (read-only)</label>
              <input value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <div style={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: 16 }}>Default Address</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="Street / Flat No." value={form.address.street}
              onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="City" value={form.address.city}
                onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
              <input placeholder="Pincode" value={form.address.pincode}
                onChange={e => setForm(f => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} />
            </div>
            <input placeholder="State" value={form.address.state}
              onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button className="btn-secondary" onClick={handleLogout} style={{ padding: '14px 24px' }}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
