import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STEPS = ['Business', 'Location', 'Property', 'Documents'];

const initialForm = {
  hotelName: '',
  businessName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  latitude: 31.7419,
  longitude: 74.2630,
  description: '',
  roomCount: '',
  category: '',
  businessLicense: null,
  cnicDoc: null,
  logo: null,
  cover: null,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => {
    const value = e.target.type === 'file' ? e.target.files[0] : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value);
          }
        }
      });
      
      const res = await fetch(`${API_BASE_URL}/api/hotels/register`, {
        method: 'POST',
        body: formData // Don't set Content-Type header, let browser set it for multipart/form-data
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const result = await res.json();
      navigate('/pending');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
        <div className="aside-copy">
          <span className="eyebrow">Hotel Registration Request</span>
          <h2>Submit once. We review fast. You go live.</h2>
          <p>
            Your hotel stays in <b style={{ color: '#fff' }}>Pending Approval</b> until our team reviews
            it — usually within 48 hours. You'll be notified by email either way.
          </p>
          <ul className="auth-checklist">
            <li><span className="tick">✓</span> Rooms &amp; bookings unlock only after approval</li>
            <li><span className="tick">✓</span> Rejected requests can be edited and resubmitted</li>
            <li><span className="tick">✓</span> All fields save as you move between steps</li>
          </ul>
        </div>
        <span style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'rgba(251,246,236,.45)' }}>
          Step-by-step · 4 sections · ~6 minutes
        </span>
      </aside>

      <main className="auth-main">
        <div className="top-link">
          <Link to="/" className="btn btn-ghost btn-sm">← Back to home</Link>
          <span className="text-muted" style={{ fontSize: '.85rem' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 600 }}>Log in</Link>
          </span>
        </div>

        <div className="form-wrap">
          <span className="eyebrow">New Hotel Request</span>
          <h1>Tell us about your property</h1>
          <p className="lede">This information is reviewed by our admin team before your hotel goes live.</p>

          <div className="stepper">
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i === STEPS.length - 1 ? 'none' : 1 }}>
                <div className={`step-item${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
                  <div className="step-dot">{i < step ? '✓' : i + 1}</div>
                  <span className="step-label">{label}</span>
                </div>
                {i !== STEPS.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <div>
                <div className="field-group">
                  <label>Hotel name</label>
                  <input className="input" type="text" placeholder="e.g. The Marlow Hotel"
                    value={form.hotelName} onChange={update('hotelName')} required />
                </div>
                <div className="field-group">
                  <label>Business / owner name</label>
                  <input className="input" type="text" placeholder="Legal or trading name"
                    value={form.businessName} onChange={update('businessName')} required />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Primary contact email</label>
                    <input className="input" type="email" placeholder="owner@hotel.com"
                      value={form.email} onChange={update('email')} required />
                  </div>
                  <div className="field-group">
                    <label>Phone number</label>
                    <input className="input" type="tel" placeholder="+1 (___) ___ ____"
                      value={form.phone} onChange={update('phone')} required />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="field-group">
                  <label>Hotel address</label>
                  <input className="input" type="text" placeholder="Full street address"
                    value={form.address} onChange={update('address')} required />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>City</label>
                    <input className="input" type="text" placeholder="City"
                      value={form.city} onChange={update('city')} required />
                  </div>
                  <div className="field-group">
                    <label>Country</label>
                    <select className="input" value={form.country} onChange={update('country')} required>
                      <option value="" disabled>Select country</option>
                      <option>Pakistan</option>
                      <option>United Arab Emirates</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Turkey</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label>Google Maps location <span className="opt">— pin your exact spot</span></label>
                  <div className="map-box">
                    <div className="pin"></div>
                    <span className="coords">{form.latitude.toFixed(4)}° N, {form.longitude.toFixed(4)}° E</span>
                  </div>
                  <p className="input-hint">Hook this up to the Google Maps JS API / Places Autocomplete to set real coordinates.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="field-group">
                  <label>Hotel description</label>
                  <textarea className="input" placeholder="Describe your property, its style and what makes it stand out..."
                    value={form.description} onChange={update('description')} required></textarea>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Number of rooms</label>
                    <input className="input" type="number" min="1" placeholder="e.g. 24"
                      value={form.roomCount} onChange={update('roomCount')} required />
                  </div>
                  <div className="field-group">
                    <label>Hotel category</label>
                    <select className="input" value={form.category} onChange={update('category')} required>
                      <option value="" disabled>Select category</option>
                      <option>1-Star</option>
                      <option>2-Star</option>
                      <option>3-Star</option>
                      <option>4-Star</option>
                      <option>5-Star</option>
                      <option>Boutique</option>
                      <option>Guest House</option>
                      <option>Apartment</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Business license <span className="opt">(optional)</span></label>
                    <UploadBox file={form.businessLicense} onChange={update('businessLicense')} accept=".pdf,.jpg,.png" />
                  </div>
                  <div className="field-group">
                    <label>CNIC / identity verification <span className="opt">(optional)</span></label>
                    <UploadBox file={form.cnicDoc} onChange={update('cnicDoc')} accept=".pdf,.jpg,.png" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Hotel logo</label>
                    <UploadBox file={form.logo} onChange={update('logo')} accept="image/*" icon="◆" text="Upload logo" hint="Square image, PNG preferred" />
                  </div>
                  <div className="field-group">
                    <label>Cover image</label>
                    <UploadBox file={form.cover} onChange={update('cover')} accept="image/*" icon="▧" text="Upload cover" hint="Landscape, min. 1600px wide" />
                  </div>
                </div>
                {error && <p style={{ color: 'var(--rust)', fontSize: '.85rem' }}>{error}</p>}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-ghost btn-sm" style={{ visibility: step === 0 ? 'hidden' : 'visible' }} onClick={back}>
                ← Back
              </button>
              <div className="flex gap-12">
                <span className="text-muted" style={{ fontSize: '.8rem', alignSelf: 'center' }}>
                  All fields reviewed by admin before approval
                </span>
                {step < STEPS.length - 1 && (
                  <button type="button" className="btn btn-primary" onClick={next}>Continue →</button>
                )}
                {step === STEPS.length - 1 && (
                  <button type="submit" className="btn btn-brass" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit for review'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function UploadBox({ file, onChange, accept, icon = '⇪', text = 'Upload document', hint = 'PDF, JPG up to 10MB' }) {
  return (
    <label className="upload-box">
      <div className="u-ico">{icon}</div>
      <b>{file ? file.name : text}</b>
      <span>{hint}</span>
      <input type="file" className="hidden" accept={accept} onChange={onChange} />
    </label>
  );
}
