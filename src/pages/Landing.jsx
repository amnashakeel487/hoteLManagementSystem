import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import Counter from '../components/Counter';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('pathways');

  useEffect(() => {
    const handleScroll = () => {
      const pathways = document.getElementById('pathways');
      const workflow = document.getElementById('workflow');
      const dashboard = document.getElementById('dashboard');
      const scrollPos = window.scrollY + 280;

      if (dashboard && scrollPos >= dashboard.offsetTop) {
        setActiveTab('dashboard');
      } else if (workflow && scrollPos >= workflow.offsetTop) {
        setActiveTab('workflow');
      } else if (pathways && scrollPos >= pathways.offsetTop) {
        setActiveTab('pathways');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Nav />

      <header className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Owner Onboarding &amp; Approval</span>
            <h1>Every stay starts with a <em>stamp of approval.</em></h1>
            <p className="lede">
              List your property in minutes, submit it for review, and get verified by our team.
              Once approved, your rooms go live and bookings start flowing — all from one dashboard
              built for hotel owners.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-primary" style={{ background: '#fff', color: '#0a1128', fontWeight: 700 }}>
                🏨 Explore &amp; Book Stays
              </Link>
              <Link to="/register" className="btn btn-brass">List Your Hotel</Link>
              <Link to="/admin" className="btn btn-ghost on-dark">Admin Console</Link>
            </div>
            <div className="hero-meta">
              <div><Counter value={1240} suffix="+" /><span>Hotels onboarded</span></div>
              <div><Counter value={98} suffix="%" /><span>Requests reviewed &lt; 48h</span></div>
              <div><Counter value={42} suffix=" countries" /><span>Where owners list</span></div>
            </div>
          </div>
          <div className="stamp-stage">
            <div className="doc-card card-back">
              <div className="doc-head"><b>Coral Bay Villas</b><span>#REQ-2291</span></div>
              <div className="doc-line w80"></div>
              <div className="doc-line w60"></div>
              <div className="doc-line w40"></div>
            </div>
            <div className="doc-card card-front">
              <div className="doc-head"><b>The Marlow Hotel</b><span>#REQ-2304</span></div>
              <div className="doc-line w60"></div>
              <div className="doc-line w80"></div>
              <div className="doc-line w40"></div>
              <div className="stamp approved">Approved</div>
            </div>
            <div className="float-chip"><span className="dot"></span> Owner notified by email</div>
          </div>
        </div>
      </header>

      {/* Interactive Platform Navigation Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'var(--parchment)',
        borderBottom: '1px solid var(--hairline)',
        padding: '16px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px'
        }}>
          <button 
            type="button"
            className={`landing-tab-btn ${activeTab === 'pathways' ? 'active' : ''}`}
            onClick={() => scrollToSection('pathways')}
          >
            Onboarding
          </button>
          <button 
            type="button"
            className={`landing-tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => scrollToSection('workflow')}
          >
            Approval Flow
          </button>
          <button 
            type="button"
            className={`landing-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => scrollToSection('dashboard')}
          >
            Dashboard
          </button>
        </div>
      </div>

      <section id="pathways">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">01 — Onboarding</span>
            <h2>Two ways onto the platform</h2>
          </Reveal>
          <div className="pathways">
            <Reveal className="pathway-card">
              <span className="num">Option 01</span>
              <h3>Admin adds the hotel</h3>
              <p>For partnerships and managed accounts — admin sets the property up directly and hands over the keys.</p>
              <ul>
                <li>Admin manually creates the hotel profile</li>
                <li>Assigns it to an existing owner or creates a new owner account</li>
                <li>Owner receives login credentials by email</li>
                <li>Owner can manage only their assigned hotel after login</li>
              </ul>
            </Reveal>
            <Reveal className="pathway-card">
              <span className="num">Option 02</span>
              <h3>Owner submits a request</h3>
              <p>Self-serve registration — an owner signs up and submits a full hotel registration request for review.</p>
              <ul>
                <li>Hotel name, business/owner name, email &amp; phone</li>
                <li>Full address, city, country, pinned map location</li>
                <li>Description, room count, category, license &amp; ID</li>
                <li>Logo and cover image upload</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="workflow" className="section-dark">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">02 — Approval Workflow</span>
            <h2>From draft to fully active — one status at a time</h2>
            <p className="lede" style={{ color: 'rgba(251,246,236,.65)' }}>
              A hotel can't take bookings until it clears review. Every step is visible to both the owner and the admin team.
            </p>
          </Reveal>
          <Reveal className="flow">
            <div className="flow-step">
              <span className="fnum">01</span>
              <h4>Draft</h4>
              <p>Owner is filling out the registration request. Nothing is submitted yet.</p>
            </div>
            <div className="flow-step">
              <span className="fnum">02</span>
              <h4>Pending Approval</h4>
              <p>Submitted and awaiting review. Rooms can't be published or booked.</p>
            </div>
            <div className="flow-step">
              <span className="fnum">03</span>
              <h4>Approved</h4>
              <p>Admin approves. Owner is emailed and the full dashboard unlocks.</p>
            </div>
            <div className="flow-step">
              <span className="fnum">04</span>
              <h4>Active</h4>
              <p>Visible on the public site. Accepting reservations and reviews.</p>
            </div>
            <div className="flow-step state-suspend">
              <span className="fnum">05</span>
              <h4>Suspended</h4>
              <p>Admin can pause a listing at any time, then reactivate it later.</p>
            </div>
          </Reveal>
          <p className="mt-32" style={{ color: 'rgba(251,246,236,.5)', fontSize: '.85rem' }}>
            If rejected instead of approved, the admin attaches a reason and the owner can edit and resubmit the same request.
          </p>
        </div>
      </section>

      <section id="dashboard">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">03 — Owner Dashboard</span>
            <h2>Everything unlocks the moment you're approved</h2>
          </Reveal>
          <div className="split">
            <Reveal>
              <div className="keycard">
                <span className="k-eyebrow">Hotel · The Marlow</span>
                <div className="k-value">Approved</div>
                <span className="k-note">Full dashboard unlocked — 24 rooms live, 6 pending photos</span>
              </div>
              <div className="mt-24 flex gap-12" style={{ flexWrap: 'wrap' }}>
                <span className="badge-stamp pending"><span className="dot"></span> Pending Approval</span>
                <span className="badge-stamp approved"><span className="dot"></span> Approved</span>
                <span className="badge-stamp rejected"><span className="dot"></span> Rejected</span>
                <span className="badge-stamp suspended"><span className="dot"></span> Suspended</span>
              </div>
            </Reveal>
            <Reveal>
              <p className="lede">Once a hotel clears review, owners get a complete operating dashboard — not just a listing page.</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '22px' }}>
                <li>· Profile, logo, cover &amp; unlimited gallery uploads</li>
                <li>· Room categories, photos, amenities &amp; pricing</li>
                <li>· Availability calendar &amp; booking management</li>
                <li>· Reviews, replies, revenue and booking analytics</li>
                <li>· Free cleaning service requests for eligible bookings</li>
              </ul>
              <Link to="/owner" className="btn btn-primary mt-24">Preview owner dashboard</Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-dark">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">04 — Admin Console</span>
            <h2>Full oversight, one hotel at a time</h2>
          </Reveal>
          <Reveal className="feature-grid">
            <div className="feature-card"><div className="ico">◧</div><h4>Pending, Approved, Rejected, Suspended</h4><p>Four queues keep every hotel's status one click away.</p></div>
            <div className="feature-card"><div className="ico">✓</div><h4>Approve, reject or request info</h4><p>Review the full application and act with a reason attached.</p></div>
            <div className="feature-card"><div className="ico">⏻</div><h4>Suspend &amp; reactivate</h4><p>Pause a listing instantly, bring it back the same way.</p></div>
            <div className="feature-card"><div className="ico">🛈</div><h4>Verify &amp; edit hotel details</h4><p>Cross-check license and ID documents before sign-off.</p></div>
            <div className="feature-card"><div className="ico">▤</div><h4>Booking statistics</h4><p>See performance per hotel without leaving the console.</p></div>
            <div className="feature-card"><div className="ico">✦</div><h4>Cleaning &amp; notifications</h4><p>Assign cleaning teams and message owners directly.</p></div>
          </Reveal>
          <Link to="/admin" className="btn btn-brass mt-32">Preview admin console</Link>
        </div>
      </section>

      <section className="quote-strip">
        <div className="container">
          <Reveal as="blockquote">
            "We submitted on a Tuesday and were live by Thursday. The status page told us exactly where we stood the entire time."
          </Reveal>
          <cite>— Amara Osei, Owner, Coral Bay Villas</cite>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Ready to put your hotel through review?</h2>
            <div className="actions">
              <Link to="/register" className="btn btn-brass">Register your hotel</Link>
              <Link to="/login" className="btn btn-ghost on-dark">I already have an account</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
