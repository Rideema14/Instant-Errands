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
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get(`/services/${serviceId}`),
      api.get(`/providers/match/${serviceId}`),
    ]).then(([svc, pvd]) => {
      setService(svc.data);
      setProviders(pvd.data);
    }).finally(() => setLoading(false));
  }, [serviceId]);

  const handleSubmit = async () => {
    if (!form.problem || !form.address.city) {
      alert('Please fill in your problem description and address.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        serviceId,
        isUrgent: form.isUrgent,
        problem: form.problem,
        address: form.address,
      });
      navigate(`/bookings/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!service) return <div className="page">Service not found.</div>;

  return (
    <div className="page" style={{ maxWidth: 780 }}>
      <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <h1 className="section-title">{service.icon} {service.name}</h1>
      <p style={{ color: 'var(--text2)', marginBottom: 32 }}>{service.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Form */}
        <div>
          {/* Urgency toggle */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              When do you need it?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: true, label: '⚡ Urgent (30-60 min)', sub: '+₹99 priority fee' },
                { value: false, label: '📅 Schedule Later', sub: 'Choose time slot' },
              ].map(({ value, label, sub }) => (
                <button
                  key={String(value)}
                  onClick={() => setForm(f => ({ ...f, isUrgent: value }))}
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${form.isUrgent === value ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.isUrgent === value ? 'rgba(255,92,43,0.1)' : 'var(--surface)',
                    color: 'var(--text)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Problem description */}
          <div className="card" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 10 }}>
              Describe your problem <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. My AC is not cooling, making loud noise..."
              value={form.problem}
              onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
              style={{ resize: 'none', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          {/* Address */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              Service Address <span style={{ color: 'var(--accent)' }}>*</span>
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

        {/* Sidebar summary */}
        <div>
          <div className="card" style={{ marginBottom: 16, position: 'sticky', top: 80 }}>
            <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
              Booking Summary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text2)' }}>Service</span>
                <span style={{ fontWeight: 600 }}>{service.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text2)' }}>Base Price</span>
                <span style={{ fontWeight: 600 }}>₹{service.basePrice}</span>
              </div>
              {form.isUrgent && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text2)' }}>Priority Fee</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>+₹99</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  ₹{service.basePrice + (form.isUrgent ? 99 : 0)}
                </span>
              </div>
            </div>

            {/* Matched providers */}
            {providers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                  {providers.length} provider{providers.length > 1 ? 's' : ''} available nearby
                </div>
                {providers.slice(0, 2).map(p => (
                  <div key={p._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', background: 'var(--surface2)',
                    borderRadius: 8, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'white',
                    }}>{p.user?.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>⭐ {p.rating?.toFixed(1)} · ⚡ {p.responseTime}min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 15 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Booking...</> : '⚡ Confirm Booking'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 10 }}>
              No payment until service is complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
