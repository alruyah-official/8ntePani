import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Legal.css';

export default function Legal() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="legal-page animate-fade-in">
      <div className="legal-container">
        <div className="legal-header">
          <h1 className="legal-title">Legal Information</h1>
          <p className="legal-subtitle">Last updated: July 2026</p>
        </div>

        {/* ── Privacy Policy ── */}
        <section id="privacy" className="legal-section">
          <h2 className="legal-section-title">Privacy Policy</h2>
          <div className="legal-content">
            <p>
              At 8ntePani, your privacy is of our utmost concern. This Privacy Policy outlines how we collect, use, and protect your personal data when you interact with our platform.
            </p>
            
            <h3>1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us when creating an account, updating your profile, posting a job, or communicating with other users. This may include your name, email address, billing information, and professional history.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              The data we collect is used to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our matchmaking services.</li>
              <li>Process transactions and send related information (e.g., invoices).</li>
              <li>Monitor and prevent fraudulent activities to keep the community safe.</li>
            </ul>

            <h3>3. Data Sharing and Security</h3>
            <p>
              We do not sell your personal data. Information is only shared with third-party vendors (like payment processors) strictly to facilitate the services you request. We implement industry-standard encryption to protect your data at rest and in transit.
            </p>
          </div>
        </section>

        <hr style={{ borderColor: 'var(--color-border)', margin: '4rem 0' }} />

        {/* ── Terms of Service ── */}
        <section id="terms" className="legal-section">
          <h2 className="legal-section-title">Terms of Service</h2>
          <div className="legal-content">
            <p>
              Welcome to 8ntePani! By accessing our website and using our services, you agree to comply with and be bound by the following Terms of Service.
            </p>

            <h3>1. User Accounts</h3>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. 
            </p>

            <h3>2. Marketplace Rules</h3>
            <p>
              As a platform connecting clients and freelancers, 8ntePani expects all users to act professionally. You agree not to:
            </p>
            <ul>
              <li>Post false, misleading, or deceptive job listings.</li>
              <li>Harass, threaten, or defraud other users.</li>
              <li>Attempt to circumvent the platform's payment systems.</li>
            </ul>

            <h3>3. Dispute Resolution</h3>
            <p>
              In the event of a dispute between a client and a freelancer, 8ntePani offers a mediation service. However, we do not guarantee the quality, safety, or legality of the services advertised. Users engage in contracts at their own risk.
            </p>
            
            <h3>4. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of our platform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
