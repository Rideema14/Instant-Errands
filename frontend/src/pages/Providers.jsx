import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProviderCard from '../components/ProviderCard';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/providers').then(({ data }) => setProviders(data)).finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter(p =>
    !search || p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.services?.some(s => s.category?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0c831f, #16a34a)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, color: 'white', marginBottom: 4 }}>
            Our Providers
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Verified professionals ready to help you today</p>
        </div>
      </div>
      <div className="page">
        <div className="input-icon-wrap" style={{ maxWidth: 380, marginBottom: 28 }}>
          <span className="input-icon">🔍</span>
          <input placeholder="Search by name or service..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>👷</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No providers found</div>
            <p style={{ color: 'var(--blink-text2)' }}>Try a different search term</p>
          </div>
        ) : (
          <div className="grid-3 animate-fade-in">
            {filtered.map(p => <ProviderCard key={p._id} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
