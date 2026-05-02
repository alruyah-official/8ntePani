import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          <div className="flex flex-col gap-4">
            <h2 className="font-display font-bold text-2xl text-accent">8ntepani</h2>
            <p className="text-muted text-sm max-w-xs">
              The premier marketplace connecting top-tier freelance talent with forward-thinking businesses.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary">Categories</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><Link to="/explore?category=Design" className="hover:text-accent transition-colors">Design</Link></li>
              <li><Link to="/explore?category=Development" className="hover:text-accent transition-colors">Development</Link></li>
              <li><Link to="/explore?category=Marketing" className="hover:text-accent transition-colors">Marketing</Link></li>
              <li><Link to="/explore?category=Video" className="hover:text-accent transition-colors">Video & Animation</Link></li>
              <li><Link to="/explore?category=Writing" className="hover:text-accent transition-colors">Writing & Translation</Link></li>
              <li><Link to="/explore?category=AI" className="hover:text-accent transition-colors">AI Services</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li><Link to="/" className="hover:text-accent transition-colors">Help & Support</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors">Trust & Safety</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors">Selling on 8ntepani</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors">Buying on 8ntepani</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary">Connect</h3>
            <div className="flex items-center gap-4 text-muted">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} 8ntepani International Ltd.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-text-primary transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;