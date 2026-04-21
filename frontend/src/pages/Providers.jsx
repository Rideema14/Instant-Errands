import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProviderCard from '../components/ProviderCard';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/providers').then(({ data }) => setProviders(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="section-title">Our Providers</h1>
      <p className="section-sub">Verified professionals ready to help you today</p>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48 }}>👷</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>No providers found</div>
          <p style={{ marginTop: 8 }}>Providers will appear here once registered.</p>
        </div>
      ) : (
        <div className="grid-3">
          {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
