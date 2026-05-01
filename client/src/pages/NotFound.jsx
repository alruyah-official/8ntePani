import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() { 
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-display font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-accent text-[#0A0A0A] font-bold px-6 py-3 rounded-full hover:bg-[#bce628] transition-colors">
        Go Back Home
      </Link>
    </div>
  ); 
}
