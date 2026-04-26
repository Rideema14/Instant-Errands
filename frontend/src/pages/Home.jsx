import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ServiceCard from '../components/ServiceCard';
import AIChat from '../components/AIChat';

const CATEGORIES = [
  { name: 'All', icon: '🏠' },
  { name: 'AC Repair', icon: '❄️' },
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Laundry', icon: '👕' },
  { name: 'Grooming', icon: '✂️' },
  { name: 'Electrical', icon: '⚡' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Carpentry', icon: '🪚' },
  { name: 'Pest Control', icon: '🐛' },
];

const PROMOS = [
  {
    title: '30-Min Guaranteed Arrival',
    sub: 'Book any service, get help in minutes',
    cta: 'Book Now',
    bg: 'linear-gradient(120deg, #0c831f 0%, #1db954 100%)',
    img: '⚡',
    badge: 'FAST',
  },
  {
    title: 'New User? ₹100 Off',
    sub: 'Use code FIRST100 on your first booking',
    cta: 'Claim Offer',
    bg: 'linear-gradient(120deg, #f8c000 0%, #fde68a 100%)',
    img: '🎁',
    badge: 'OFFER',
    dark: true,
  },
  {
    title: 'AC Service Starting ₹299',
    sub: 'Summer special — deep clean + gas check',
    cta: 'Book AC Service',
    bg: 'linear-gradient(120deg, #0284c7 0%, #38bdf8 100%)',
    img: '❄️',
    badge: 'HOT',
  },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [promoBanner, setPromoBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    const t = setInterval(() => setPromoBanner(p => (p + 1) % PROMOS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch {
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

  const promo = PROMOS[promoBanner];

  return (
    <div>
      {/* HERO — Blinkit-style green banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0c831f 0%, #16a34a 60%, #22c55e 100%)',
        padding: '40px 20px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(248,192,0,0.15)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          {/* Top label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px',
            marginBottom: 20,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f8c000' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>⚡ 30–60 MIN GUARANTEED ARRIVAL</span>
          </div>

          <h1 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 56px)',
            color: 'white', lineHeight: 1.1, marginBottom: 14, maxWidth: 600,
          }}>
            Home services,<br />
            <span style={{ color: '#f8c000' }}>delivered fast.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, maxWidth: 420, lineHeight: 1.6 }}>
            Trusted professionals for AC repair, plumbing, grooming & more — at your doorstep.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-yellow" onClick={() => navigate('/services')} style={{ fontSize: 16, padding: '14px 32px' }}>
              Book a Service →
            </button>
            <button onClick={() => setShowAI(true)} style={{
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: 'white', border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              🤖 Ask AI Assistant
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 36, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '2K+', label: 'Verified Pros' },
              { value: '4.9★', label: 'Avg Rating' },
              { value: '30min', label: 'Avg Arrival' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: 'white' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* White wave separator */}
      <div style={{ height: 32, background: 'white', marginTop: -20, borderRadius: '20px 20px 0 0', position: 'relative', zIndex: 2 }} />

      <div style={{ background: 'white', marginTop: -2 }}>
        <div className="page" style={{ paddingTop: 0 }}>

          {/* Category icon grid */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="section-label">What do you need?</div>
              <button onClick={() => navigate('/services')} style={{
                color: 'var(--blink-green)', fontSize: 13, fontWeight: 800,
                background: 'none', border: 'none', cursor: 'pointer',
              }}>See all →</button>
            </div>
            <div className="grid-categories">
              {CATEGORIES.map(cat => (
                <div
                  key={cat.name}
                  className={`cat-icon-card ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  <div style={{ fontSize: 30 }}>{cat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: activeCategory === cat.name ? 'var(--blink-green)' : 'var(--blink-text)', lineHeight: 1.3, textAlign: 'center' }}>
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo banner */}
          <div style={{ marginBottom: 36 }}>
            <div className="promo-banner" style={{ background: promo.bg, transition: 'background 0.8s ease' }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 6, marginBottom: 10,
                  background: promo.dark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.08em',
                  color: promo.dark ? '#1a1a1a' : 'white',
                }}>{promo.badge}</div>
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24,
                  color: promo.dark ? '#1a1a1a' : 'white', marginBottom: 8, lineHeight: 1.2,
                }}>{promo.title}</h2>
                <p style={{ fontSize: 14, color: promo.dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)', marginBottom: 18 }}>{promo.sub}</p>
                <button onClick={() => navigate('/services')} style={{
                  background: promo.dark ? 'var(--blink-green)' : 'white',
                  color: promo.dark ? 'white' : 'var(--blink-green)',
                  border: 'none', borderRadius: 10, padding: '10px 22px',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                }}>{promo.cta}</button>
              </div>
              <div style={{ fontSize: 90, opacity: 0.25, position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{promo.img}</div>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
              {PROMOS.map((_, i) => (
                <div key={i} onClick={() => setPromoBanner(i)} style={{
                  width: promoBanner === i ? 20 : 8, height: 8, borderRadius: 4,
                  background: promoBanner === i ? 'var(--blink-green)' : '#d1d5db',
                  cursor: 'pointer', transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>

          {/* Services grid */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="section-label">
                  {activeCategory === 'All' ? 'All Services' : activeCategory}
                </div>
                <div className="section-sub">Professional help available 24/7</div>
              </div>
              {/* Category pills — scrollable */}
              <div className="scroll-row" style={{ maxWidth: 480 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    className={`cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.name)}
                  >{cat.name}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <div className="shimmer-box" style={{ height: 110 }} />
                    <div style={{ padding: '14px 16px', background: 'white' }}>
                      <div className="shimmer-box" style={{ height: 14, marginBottom: 8, borderRadius: 6 }} />
                      <div className="shimmer-box" style={{ height: 10, width: '60%', borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No services found</div>
                <p style={{ color: 'var(--blink-text2)', marginBottom: 20 }}>Try a different category</p>
                <button className="btn-primary" onClick={() => setActiveCategory('All')}>Show All</button>
              </div>
            ) : (
              <div className="grid-services animate-fade-in">
                {filtered.map(s => <ServiceCard key={s._id} service={s} />)}
              </div>
            )}
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div className="section-label">How QuickServe Works</div>
              <div className="section-sub">3 simple steps to get help fast</div>
            </div>
            <div className="grid-3">
              {[
                { icon: '🔍', step: '01', title: 'Pick a Service', desc: 'Browse from 50+ services or ask our AI assistant to identify your issue.', color: '#e0f2fe' },
                { icon: '⚡', step: '02', title: 'Instant Match', desc: 'Our algorithm finds the nearest, top-rated professional in under 60 seconds.', color: '#dcfce7' },
                { icon: '🎉', step: '03', title: 'Job Done!', desc: 'Track live, pay securely after completion, and rate your experience.', color: '#fef9c3' },
              ].map(({ icon, step, title, desc, color }) => (
                <div key={step} className="blink-card" style={{ padding: 28, textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: 18, right: 20,
                    fontFamily: 'Poppins, sans-serif', fontSize: 36, fontWeight: 900,
                    color: '#f3f4f6', lineHeight: 1,
                  }}>{step}</div>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, margin: '0 auto 16px',
                  }}>{icon}</div>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--blink-text2)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div style={{
            background: '#f0fdf4',
            borderRadius: 20,
            padding: '28px 36px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            flexWrap: 'wrap', gap: 24,
            border: '1.5px solid #bbf7d0',
          }}>
            {[
              { icon: '🛡️', label: 'Verified Professionals', sub: 'Background-checked & certified' },
              { icon: '💳', label: 'Secure Payments', sub: 'Pay only after job is done' },
              { icon: '⭐', label: '4.9/5 Rating', sub: 'Avg across 50K+ bookings' },
              { icon: '📞', label: '24/7 Support', sub: 'Always here to help' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--blink-text)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--blink-text2)' }}>{sub}</div>
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
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0c831f, #16a34a)',
          color: 'white', fontSize: 24, border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(12,131,31,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-ring 2.5s infinite',
        }}
        title="Ask AI Assistant"
      >🤖</button>

      {showAI && <AIChat onClose={() => setShowAI(false)} />}
    </div>
  );
}
