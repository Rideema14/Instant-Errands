import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const docTypes = [
  {
    value: 'aadhaar',
    icon: '🪪',
    title: 'Aadhaar Card',
    hint: '12-digit Aadhaar number',
    pattern: /^\d{12}$/,
    placeholder: '1234 5678 9012',
    needsBack: true,
  },
  {
    value: 'pan',
    icon: '💳',
    title: 'PAN Card',
    hint: '10-character PAN (e.g. ABCDE1234F)',
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    placeholder: 'ABCDE1234F',
    needsBack: false,
  },
];

function ImageUploadBox({ label, sub, fieldName, preview, onChange, required }) {
  const ref = useRef();
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </div>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: `2px dashed ${preview ? 'var(--green)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius)',
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: preview ? 'rgba(34,197,94,0.05)' : 'var(--bg)',
          position: 'relative', overflow: 'hidden',
        }}
        onMouseEnter={e => !preview && (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={e => !preview && (e.currentTarget.style.borderColor = 'var(--border2)')}
      >
        {preview ? (
          <div>
            <img src={preview} alt={label} style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>✓ Uploaded — click to change</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Click to upload</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" name={fieldName} hidden onChange={onChange} />
      </div>
    </div>
  );
}

export default function ProviderKYC() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [files, setFiles] = useState({ docFront: null, docBack: null, selfie: null });
  const [previews, setPreviews] = useState({ docFront: '', docBack: '', selfie: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedDoc = docTypes.find(d => d.value === docType);

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(f => ({ ...f, [field]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreviews(p => ({ ...p, [field]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!docType) return 'Please select a document type.';
    if (!selectedDoc.pattern.test(docType === 'pan' ? docNumber.toUpperCase() : docNumber))
      return selectedDoc.hint;
    if (!files.docFront) return 'Please upload the front image of your document.';
    if (selectedDoc.needsBack && !files.docBack) return 'Please upload the back image of your Aadhaar card.';
    if (!files.selfie) return 'Please upload a clear selfie photo.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('docType', docType);
      fd.append('docNumber', docType === 'pan' ? docNumber.toUpperCase() : docNumber);
      fd.append('docFront', files.docFront);
      if (files.docBack) fd.append('docBack', files.docBack);
      fd.append('selfie', files.selfie);
      await api.post('/auth/kyc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'KYC submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // Already approved
  if (user?.kyc?.status === 'approved') {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>KYC Approved!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Your identity has been verified. You can now accept service jobs.</p>
          <button className="btn-primary" onClick={() => navigate('/provider/dashboard')}>Go to Dashboard →</button>
        </div>
      </div>
    );
  }

  // Submitted / pending
  if (done || user?.kyc?.status === 'pending') {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>KYC Under Review</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
            Your documents have been submitted and are being reviewed by our team. This usually takes <strong style={{ color: 'var(--text)' }}>24–48 hours</strong>.
          </p>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24 }}>We'll notify you once your KYC is approved.</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  // Rejected — allow resubmit
  const isRejected = user?.kyc?.status === 'rejected';

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Identity Verification</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6 }}>
          To ensure safety for all users, providers must verify their identity before accepting jobs. Your documents are reviewed by our team and stored securely.
        </p>
        {isRejected && (
          <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)', borderRadius: 10, fontSize: 14 }}>
            <strong style={{ color: 'var(--accent)' }}>❌ Previous submission was rejected.</strong>
            <div style={{ color: 'var(--text2)', marginTop: 4 }}>Reason: {user.kyc.rejectionReason || 'Documents could not be verified'}</div>
            <div style={{ marginTop: 4, color: 'var(--text2)' }}>Please resubmit with clear, valid documents.</div>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {['Choose Document', 'Upload Photos', 'Take Selfie'].map((s, i) => (
          <div key={s} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Step {i+1}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{s}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(255,92,43,0.1)', border: '1px solid rgba(255,92,43,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: 'var(--accent)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step 1: Choose doc type */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Step 1 — Select Document Type
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {docTypes.map(d => (
            <button key={d.value} onClick={() => setDocType(d.value)} style={{
              flex: 1, padding: '16px', borderRadius: 10,
              border: `2px solid ${docType === d.value ? 'var(--accent)' : 'var(--border)'}`,
              background: docType === d.value ? 'rgba(255,92,43,0.08)' : 'var(--bg)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{d.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{d.hint}</div>
              {docType === d.value && <div style={{ color: 'var(--accent)', fontSize: 18, marginTop: 6 }}>✓</div>}
            </button>
          ))}
        </div>
        {docType && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              {selectedDoc.title} Number <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder={selectedDoc.placeholder}
              maxLength={docType === 'aadhaar' ? 12 : 10}
              style={{ letterSpacing: docType === 'aadhaar' ? '0.15em' : 'normal', fontFamily: 'monospace', fontSize: 16 }}
            />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{selectedDoc.hint}</div>
          </div>
        )}
      </div>

      {/* Step 2: Document photos */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Step 2 — Upload Document Photos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selectedDoc?.needsBack ? '1fr 1fr' : '1fr', gap: 16 }}>
          <ImageUploadBox
            label={docType === 'aadhaar' ? 'Aadhaar — Front Side' : 'PAN Card — Front'}
            sub="Clear photo, all 4 corners visible"
            fieldName="docFront"
            preview={previews.docFront}
            onChange={handleFile('docFront')}
            required
          />
          {selectedDoc?.needsBack && (
            <ImageUploadBox
              label="Aadhaar — Back Side"
              sub="Back of Aadhaar with address"
              fieldName="docBack"
              preview={previews.docBack}
              onChange={handleFile('docBack')}
              required
            />
          )}
        </div>

        {/* Aadhaar example mockup */}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text3)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>📌 Photo guidelines:</div>
          <ul style={{ paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Ensure the document is flat and fully visible</li>
            <li>No glare, blur, or fingers covering the text</li>
            <li>All 4 corners of the card must be in the frame</li>
            <li>Photo must be taken in good lighting</li>
            <li>Accepted formats: JPG, PNG, WEBP (max 10 MB)</li>
          </ul>
        </div>
      </div>

      {/* Step 3: Selfie */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
          Step 3 — Your Selfie Photo
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
          Take a clear photo of yourself holding your document. This helps us match you with the card. Make sure your face and the document are both clearly visible.
        </p>

        {/* Selfie mockup guide */}
        <div style={{
          background: 'var(--bg)', border: '1px dashed var(--border2)',
          borderRadius: 10, padding: '16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface2)',
            border: '2px solid var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4,
          }}>
            <div style={{ fontSize: 28 }}>🤳</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>Face + Card</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            <div>✅ Face must be clearly visible</div>
            <div>✅ Document readable in your hand</div>
            <div>✅ Good lighting, plain background preferred</div>
            <div>❌ No sunglasses, masks, or hats</div>
          </div>
        </div>

        <ImageUploadBox
          label="Upload Selfie with Document"
          sub="Hold your ID card next to your face"
          fieldName="selfie"
          preview={previews.selfie}
          onChange={handleFile('selfie')}
          required
        />
      </div>

      {/* Submit */}
      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Submitting KYC...</>
          : '🔒 Submit for Verification'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 12, lineHeight: 1.6 }}>
        Your data is encrypted and stored securely. It is only used for identity verification and never shared with third parties.
      </p>
    </div>
  );
}
