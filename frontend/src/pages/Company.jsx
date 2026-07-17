import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Company.css';

export default function Company() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        // slight delay to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    alert('Support request submitted successfully! (Frontend Simulation)');
  };

  return (
    <div className="company-page animate-fade-in">
      
      {/* ── Hero ── */}
      <div className="company-hero">
        <h1 className="company-hero-title">Empowering the Future of Work</h1>
        <p className="company-hero-subtitle">
          We are 8ntePani, a premier freelance marketplace connecting top-tier talent with ambitious clients worldwide.
        </p>
      </div>

      {/* ── About Us ── */}
      <section id="about" className="company-section">
        <div className="company-container about-grid">
          <div className="about-text">
            <span className="section-tag">About Us</span>
            <h2 className="section-heading">Bridging the Gap Between Talent and Opportunity</h2>
            <p>
              Founded with the vision of breaking down geographical barriers, 8ntePani is more than just a marketplace. We are a global community built on trust, transparency, and excellence.
            </p>
            <p>
              Whether you are a startup looking for that crucial first engineer, or a seasoned designer searching for your next big project, our platform is engineered to make those connections seamless and secure.
            </p>
          </div>
          <div className="about-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Team collaboration" 
              className="about-image"
            />
          </div>
        </div>
      </section>

      {/* ── Careers ── */}
      <section id="careers" className="company-section alt-bg">
        <div className="company-container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Careers</span>
            <h2 className="section-heading">Join Our Mission</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              We're a fast-growing, remote-first team passionate about redefining how people work. Sound like you? Check out our open roles.
            </p>
          </div>
          
          <div className="careers-grid">
            <div className="career-card">
              <h3 className="career-card-title">Senior Frontend Engineer</h3>
              <p className="career-card-dept">Engineering • Remote</p>
              <div className="career-card-footer">
                <span className="badge-meta">Full-time</span>
                <button className="btn btn-primary" style={{ padding: '6px 12px' }}>Apply</button>
              </div>
            </div>
            <div className="career-card">
              <h3 className="career-card-title">Product Designer</h3>
              <p className="career-card-dept">Design • Remote</p>
              <div className="career-card-footer">
                <span className="badge-meta">Full-time</span>
                <button className="btn btn-primary" style={{ padding: '6px 12px' }}>Apply</button>
              </div>
            </div>
            <div className="career-card">
              <h3 className="career-card-title">Community Manager</h3>
              <p className="career-card-dept">Marketing • Remote</p>
              <div className="career-card-footer">
                <span className="badge-meta">Part-time</span>
                <button className="btn btn-primary" style={{ padding: '6px 12px' }}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Support ── */}
      <section id="support" className="company-section">
        <div className="company-container contact-grid">
          <div>
            <span className="section-tag">Contact Support</span>
            <h2 className="section-heading">We're Here to Help</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              Have a question about your account, a recent job, or just want to leave some feedback? Drop us a line!
            </p>
            
            <div className="contact-info-cards">
              <div className="contact-info-card">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <p style={{ fontWeight: '700', marginBottom: '4px' }}>Email Us</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>support@8ntepani.com</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <p style={{ fontWeight: '700', marginBottom: '4px' }}>Call Us</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <form className="contact-form" onSubmit={handleSupportSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input type="text" id="name" className="form-input" placeholder="Jane Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" className="form-input" placeholder="jane@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <select id="subject" className="form-select" required>
                  <option value="">Select a topic</option>
                  <option value="billing">Billing Issue</option>
                  <option value="account">Account Access</option>
                  <option value="report">Report a User</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea id="message" className="form-textarea" rows="4" placeholder="How can we help?" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1rem' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      
    </div>
  );
}
