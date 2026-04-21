import { useState, useEffect } from 'react';
import api from '../utils/api';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = ['All', 'AC Repair', 'Plumbing', 'Laundry', 'Grooming', 'Electrical', 'Cleaning', 'Carpentry', 'Pest Control'];

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
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">All Services</h1>
        <p className="section-sub">Find the right service for your home needs</p>

        {/* Search + Filter row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, maxWidth: 340 }}
          />
          <button
            onClick={() => setUrgentOnly(!urgentOnly)}
            className={urgentOnly ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '12px 20px', fontSize: 13 }}
          >
            ⚡ Urgent Only
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No services found</div>
          <div style={{ fontSize: 14 }}>Try a different search or category</div>
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map(s => <ServiceCard key={s._id} service={s} />)}
        </div>
      )}
    </div>
  );
}
