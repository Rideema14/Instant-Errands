import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm QuickServe AI 🤖 Tell me what problem you're facing at home and I'll match you with the right service instantly!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', {
        messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.recommendedService) setRecommendation(data.recommendedService);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: 400, maxHeight: '80vh',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🤖</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>QuickServe AI</div>
              <div style={{ fontSize: 11, color: 'var(--green)' }}>● Always online</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface)', border: 'none', color: 'var(--text2)',
            width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                color: 'var(--text)',
                fontSize: 14, lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--surface)', borderRadius: 14, alignSelf: 'flex-start', width: 60 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--text3)',
                  animation: `pulse-glow 1s ease ${i * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          )}
          {recommendation && (
            <div style={{
              background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)',
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                🎯 Recommended service:
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
                {recommendation}
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}
                onClick={() => { navigate('/services'); onClose(); }}
              >
                Book Now →
              </button>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your problem..."
              style={{ flex: 1, borderRadius: 10, padding: '10px 14px', fontSize: 14 }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--surface)',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '0 16px', cursor: 'pointer',
                transition: 'all 0.2s', fontSize: 18,
                opacity: !input.trim() ? 0.5 : 1,
              }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}
