import { useState, useEffect } from 'react';
import api from '../utils/api';
import ServiceCard from '../components/ServiceCard';

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

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data)).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tags?.some(t => t.includes(search.toLowerCase()));
    const matchUrgent = !urgentOnly || s.isUrgent;
    return matchCat && matchSearch && matchUrgent;
  });

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Top banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0c831f 0%, #16a34a 100%)',
        padding: '28px 20px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, color: 'white', marginBottom: 4 }}>
            All Services
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Professional help across 8+ categories, available 24/7</p>
        </div>
      </div>

      <div className="page" style={{ background: 'white' }}>
        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
            <span className="input-icon">🔍</span>
            <input
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <button
            onClick={() => setUrgentOnly(!urgentOnly)}
            style={{
              background: urgentOnly ? '#fff7ed' : 'white',
              color: urgentOnly ? 'var(--blink-orange)' : 'var(--blink-text2)',
              border: `2px solid ${urgentOnly ? 'var(--blink-orange)' : '#e5e7eb'}`,
              borderRadius: 12, padding: '12px 20px',
              fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >⚡ Urgent Only</button>
        </div>

        {/* Category pills */}
        <div className="scroll-row" style={{ marginBottom: 28, paddingBottom: 6 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className={`cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >{cat.icon} {cat.name}</button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ fontSize: 13, color: 'var(--blink-text2)', marginBottom: 16, fontWeight: 600 }}>
            {filtered.length} service{filtered.length !== 1 ? 's' : ''} found
            {activeCategory !== 'All' && ` in "${activeCategory}"`}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#f9fafb' }}>
                <div className="shimmer-box" style={{ height: 110 }} />
                <div style={{ padding: '14px 16px' }}>
                  <div className="shimmer-box" style={{ height: 14, marginBottom: 8, borderRadius: 6 }} />
                  <div className="shimmer-box" style={{ height: 10, width: '60%', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No services found</div>
            <p style={{ color: 'var(--blink-text2)', marginBottom: 24 }}>Try a different search or category</p>
            <button className="btn-primary" onClick={() => { setSearch(''); setActiveCategory('All'); setUrgentOnly(false); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-services animate-fade-in">
            {filtered.map(s => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
