import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BookService() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    isUrgent: true,
    problem: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/book/${serviceId}` } } }); return; }
    Promise.all([
      api.get(`/services/${serviceId}`),
      api.get(`/providers/match/${serviceId}`),
    ]).then(([svc, pvd]) => { setService(svc.data); setProviders(pvd.data); })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleSubmit = async () => {
    if (!form.problem || !form.address.city) return alert('Please fill in problem description and city.');
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', { serviceId, ...form });
      navigate(`/bookings/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );
  if (!service) return <div className="page">Service not found.</div>;

  const totalPrice = service.basePrice + (form.isUrgent ? 99 : 0);

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Top banner */}
      <div style={{ background: 'linear-gradient(135deg, #0c831f, #16a34a)', padding: '20px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
            padding: '8px 14px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>← Back</button>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: 'white' }}>
              {service.icon} {service.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{service.description}</p>
          </div>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Left — Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Urgency selector */}
            <div className="blink-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                When do you need it?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: true, icon: '⚡', label: 'Urgent', sub: '30–60 min arrival', extra: '+₹99 priority fee', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                  { value: false, icon: '📅', label: 'Schedule Later', sub: 'Choose a time slot', extra: 'No extra charge', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
                ].map(({ value, icon, label, sub, extra, color, bg, border }) => (
                  <button key={String(value)} onClick={() => setForm(f => ({ ...f, isUrgent: value }))} style={{
                    flex: 1, padding: '16px', borderRadius: 14,
                    border: `2px solid ${form.isUrgent === value ? border : '#e5e7eb'}`,
                    background: form.isUrgent === value ? bg : 'white',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: form.isUrgent === value ? color : 'var(--blink-text)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--blink-text2)', marginTop: 3 }}>{sub}</div>
                    <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 4 }}>{extra}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem description */}
            <div className="blink-card" style={{ padding: 22 }}>
              <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                Describe your problem <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={4} placeholder={`e.g. My ${service.name.toLowerCase()} is not working properly...`}
                value={form.problem}
                onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
                style={{ resize: 'none', borderRadius: 12, fontSize: 14 }}
              />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                More details = faster, better service ✓
              </div>
            </div>

            {/* Address */}
            <div className="blink-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                📍 Service Address <span style={{ color: '#ef4444' }}>*</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="Street / Flat No." value={form.address.street}
                  onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input placeholder="City *" value={form.address.city}
                    onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
                  <input placeholder="Pincode" value={form.address.pincode}
                    onChange={e => setForm(f => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} />
                </div>
                <input placeholder="State" value={form.address.state}
                  onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
              </div>
            </div>
          </div>

          {/* Right — Summary sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="blink-card" style={{ padding: 22, marginBottom: 14 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>
                Booking Summary
              </div>

              {/* Service thumb */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 18, padding: '12px', background: '#f9fafb', borderRadius: 12 }}>
                <div style={{ fontSize: 32 }}>{service.icon || '🛠️'}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{service.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--blink-text2)' }}>{service.category}</div>
                  <div className="delivery-badge" style={{ marginTop: 6 }}>⚡ 30 min</div>
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  { label: 'Base Price', val: `₹${service.basePrice}` },
                  form.isUrgent && { label: 'Priority Fee', val: '+₹99', color: '#f97316' },
                  { label: 'Platform Fee', val: '₹0', color: 'var(--blink-green)', tag: 'FREE' },
                ].filter(Boolean).map(({ label, val, color, tag }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
                    <span style={{ color: 'var(--blink-text2)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: color || 'var(--blink-text)', display: 'flex', gap: 6, alignItems: 'center' }}>
                      {val}
                      {tag && <span style={{ fontSize: 10, fontWeight: 900, background: '#f0fdf4', color: 'var(--blink-green)', padding: '1px 6px', borderRadius: 4 }}>{tag}</span>}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--blink-text)' }}>₹{totalPrice}</span>
                </div>
              </div>

              {/* Nearby providers */}
              {providers.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--blink-text2)', fontWeight: 700, marginBottom: 8 }}>
                    🟢 {providers.length} provider{providers.length !== 1 ? 's' : ''} available nearby
                  </div>
                  {providers.slice(0, 2).map(p => (
                    <div key={p._id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', background: '#f9fafb', borderRadius: 10, marginBottom: 6,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--blink-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: 'white',
                      }}>{p.user?.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.user?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--blink-text2)' }}>⭐ {p.rating?.toFixed(1)} · ⚡ {p.responseTime}min avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}
                onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Booking...</>
                  : '⚡ Confirm Booking'}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                💳 No payment until service is complete
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🛡️', text: 'Verified professional, background checked' },
                { icon: '↩️', text: 'Free re-service if not satisfied' },
                { icon: '📞', text: '24/7 support during your booking' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--blink-text2)', fontWeight: 600 }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
