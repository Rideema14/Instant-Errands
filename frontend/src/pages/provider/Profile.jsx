import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function ProviderProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ bio:'', experience:'', pricePerHour:'', responseTime:'', videoPreviewUrl:'' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'provider') { navigate('/'); return; }
    Promise.all([api.get('/auth/me'), api.get('/services')]).then(([me, svc]) => {
      const p = me.data.providerProfile;
      setProfile(p);
      setServices(svc.data);
      if (p) {
        setForm({
          bio: p.bio || '',
          experience: p.experience || '',
          pricePerHour: p.pricePerHour || 300,
          responseTime: p.responseTime || 15,
          videoPreviewUrl: p.videoPreviewUrl || '',
        });
        setSelectedServices(p.services?.map(s => s._id) || []);
      }
      if (user.avatar) setAvatarPreview(user.avatar);
    });
  }, []);

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const r = new FileReader();
    r.onload = ev => setAvatarPreview(ev.target.result);
    r.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Upload avatar if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        await refreshUser();
      }
      // Update provider profile
      await api.put(`/providers/profile`, { ...form, services: selectedServices });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (!profile) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );

  const kycStatus = user?.kyc?.status;

  return (
    <div className="page" style={{ maxWidth:700 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="section-sub" style={{ marginBottom:0 }}>Manage your provider settings and services</p>
        </div>
        <button onClick={() => navigate('/provider/dashboard')} className="btn-ghost">← Dashboard</button>
      </div>

      {/* KYC status notice */}
      {kycStatus !== 'approved' && (
        <div style={{ marginBottom:20, padding:'14px 18px', borderRadius:10, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', fontSize:14, color:'var(--text2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>⚠️ Your profile won't be visible to customers until your KYC is approved.</span>
          <button className="btn-primary" style={{ padding:'8px 16px', fontSize:13 }} onClick={() => navigate('/provider/kyc')}>
            {kycStatus === 'not_submitted' ? 'Start KYC' : kycStatus === 'rejected' ? 'Resubmit' : 'View Status'}
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="card" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background: avatarPreview ? 'transparent' : 'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:30, fontWeight:800, color:'white', fontFamily:'var(--font-display)',
            overflow:'hidden', border:'3px solid var(--border)',
          }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <label style={{
            position:'absolute', bottom:0, right:0,
            width:26, height:26, borderRadius:'50%',
            background:'var(--accent)', color:'white',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', fontSize:13, border:'2px solid var(--bg)',
          }}>
            ✏️
            <input type="file" accept="image/*" hidden onChange={handleAvatar} />
          </label>
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18 }}>{user?.name}</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>{user?.email}</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Click the ✏️ icon to change your photo</div>
        </div>
      </div>

      {/* Bio & Info */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:16 }}>About You</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:6 }}>Bio / Introduction</label>
            <textarea rows={4} placeholder="Tell customers about your experience, skills, and why they should choose you..."
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              style={{ resize:'none' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:6 }}>Experience (years)</label>
              <input type="number" min="0" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:6 }}>Price / Hour (₹)</label>
              <input type="number" min="100" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:6 }}>Avg. Response (min)</label>
              <input type="number" min="5" value={form.responseTime} onChange={e => setForm(f => ({ ...f, responseTime: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:6 }}>Intro Video URL (optional)</label>
            <input placeholder="https://youtube.com/..." value={form.videoPreviewUrl} onChange={e => setForm(f => ({ ...f, videoPreviewUrl: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Services selection */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:6 }}>Services You Offer</div>
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>Select all services you are qualified to perform.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {services.map(s => {
            const selected = selectedServices.includes(s._id);
            return (
              <button key={s._id} onClick={() => toggleService(s._id)} style={{
                padding:'12px 14px', borderRadius:10, textAlign:'left',
                border:`2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                background: selected ? 'rgba(255,92,43,0.08)' : 'var(--bg)',
                cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:10,
              }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>₹{s.basePrice} base</div>
                </div>
                {selected && <span style={{ marginLeft:'auto', color:'var(--accent)', fontSize:16 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <button className="btn-primary" onClick={saveProfile} disabled={saving}
        style={{ width:'100%', justifyContent:'center', padding:16, fontSize:15 }}>
        {saving ? <><div className="spinner" style={{ width:18, height:18 }} /> Saving...</>
          : saved ? '✅ Saved!' : '💾 Save Profile'}
      </button>
    </div>
  );
}
