import { Link } from 'react-router-dom';

export default function Pending() {
  return (
    <>
      <nav className="site-nav">
        <div className="container">
          <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
          <div className="nav-links"></div>
          <div className="nav-cta">
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>Owner Login</Link>
          </div>
        </div>
      </nav>

      <section style={{ padding: '100px 0' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="panel reveal in" style={{ textAlign: 'center', padding: '56px 44px' }}>
            <div style={{ width: '70px', height: '70px', margin: '0 auto 26px', borderRadius: '50%', background: 'var(--parchment-2)', display: 'grid', placeItems: 'center' }}>
              <span
                className="stamp pending"
                style={{ position: 'static', opacity: 1, animation: 'none', transform: 'rotate(-8deg)', color: 'var(--brass-dark)', borderWidth: '2.5px', padding: '6px 10px', fontSize: '.6rem' }}
              >
                Pending
              </span>
            </div>
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Request #REQ-2318</span>
            <h1 className="mt-16" style={{ fontSize: '1.9rem' }}>The Marlow Hotel is now Pending Approval</h1>
            <p className="lede" style={{ margin: '16px auto 0', textAlign: 'center' }}>
              Your request has been submitted. Our admin team reviews new hotels within 48 hours — you'll
              get an email the moment there's a decision. Rooms and bookings stay locked until then.
            </p>

            <div className="flow mt-32" style={{ textAlign: 'left' }}>
              <div className="flow-step">
                <span className="fnum">01</span>
                <h4>Submitted</h4>
                <p>Received today at 10:42 AM.</p>
              </div>
              <div className="flow-step">
                <span className="fnum">02</span>
                <h4 style={{ color: 'var(--brass-dark)' }}>In review</h4>
                <p>Admin is checking your documents now.</p>
              </div>
              <div className="flow-step" style={{ opacity: 0.5 }}>
                <span className="fnum">03</span>
                <h4>Decision</h4>
                <p>Approved, or returned with a reason to fix.</p>
              </div>
            </div>

            <div className="flex gap-12 mt-32" style={{ justifyContent: 'center' }}>
              <Link to="/" className="btn btn-ghost">Back to home</Link>
              <Link to="/owner" className="btn btn-primary">Preview dashboard (locked view)</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
