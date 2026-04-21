import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ServiceCard from '../components/ServiceCard';
import AIChat from '../components/AIChat';

const CATEGORIES = ['All', 'AC Repair', 'Plumbing', 'Laundry', 'Grooming', 'Electrical', 'Cleaning', 'Carpentry', 'Pest Control'];

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch {
      // Seed if empty
      try {
        await api.post('/services/seed');
        const { data } = await api.get('/services');
        setServices(data);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--bg)',
        position: 'relative', overflow: 'hidden',
        padding: '80px 20px 60px',
        textAlign: 'center',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(255,92,43,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div className="badge badge-urgent" style={{ marginBottom: 20, fontSize: 13, padding: '6px 16px' }}>
            ⚡ 30-60 Min Guaranteed Arrival
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 800, lineHeight: 1.05,
            color: 'var(--text)', marginBottom: 20,
          }}>
            Home services,<br />
            <span style={{ color: 'var(--accent)' }}>fixed fast.</span>
          </h1>
          <p style={{
            fontSize: 18, color: 'var(--text2)',
            maxWidth: 500, margin: '0 auto 36px',
            lineHeight: 1.6,
          }}>
            Book trusted professionals for AC repair, plumbing, grooming & more — within 30 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/services')} style={{ fontSize: 16, padding: '16px 32px' }}>
              Book a Service →
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowAI(true)}
              style={{ fontSize: 16, padding: '16px 28px' }}
            >
              🤖 Ask AI Assistant
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          maxWidth: 700, margin: '48px auto 0',
          display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap',
        }}>
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '2K+', label: 'Verified Providers' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '30min', label: 'Avg. Response' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text)' }}>
                {value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="page">
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">Our Services</div>
          <div className="section-sub">Professional help across 8+ categories, available 24/7</div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                  background: activeCategory === cat ? 'var(--accent)' : 'var(--surface)',
                  color: activeCategory === cat ? 'white' : 'var(--text2)',
                  border: `1px solid ${activeCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div className="grid-4">
            {filtered.map(s => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 80 }}>
          <div className="section-title" style={{ textAlign: 'center' }}>How QuickServe Works</div>
          <div className="section-sub" style={{ textAlign: 'center' }}>3 simple steps to get help fast</div>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {[
              { icon: '🔍', step: '01', title: 'Select Service', desc: 'Browse services or ask our AI assistant to identify your problem.' },
              { icon: '⚡', step: '02', title: 'AI Matches Provider', desc: 'Our algorithm finds the nearest, top-rated provider in under 60 seconds.' },
              { icon: '🎉', step: '03', title: 'Job Done!', desc: 'Track live, pay securely, and rate your experience.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900,
                  color: 'var(--border)', lineHeight: 1,
                }}>{step}</div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI button */}
      <button
        onClick={() => setShowAI(true)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          color: 'white', fontSize: 24, border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255,92,43,0.4)',
          animation: 'pulse-glow 3s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Ask AI Assistant"
      >🤖</button>

      {showAI && <AIChat onClose={() => setShowAI(false)} />}
    </div>
  );
}
