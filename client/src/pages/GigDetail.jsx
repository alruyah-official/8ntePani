import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Check, Clock, RefreshCcw, ShieldCheck, Mail } from 'lucide-react';
import { useGigById } from '../hooks';
import { Button } from '../components/ui';
import { QueryWrapper } from '../components/shared';

// Mock data to gracefully render UI structure even if API fails
const MOCK_GIG = {
  title: 'I will design a highly converting modern web application',
  seller: {
    name: 'Alex Developer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    rating: 4.9,
    reviews: 128,
    isTopRated: true,
    bio: 'Senior full-stack engineer with 8 years of experience building beautiful, scalable web apps for startups.'
  },
  images: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&q=80&w=800'
  ],
  description: 'I will build a completely custom, responsive, and highly optimized React web application tailored exactly to your brand needs. My approach combines cutting-edge performance with pixel-perfect design aesthetics.',
  features: [
    'Responsive Design across all devices',
    'Performance & SEO optimization',
    'Source code included',
    'Custom animations and interactions'
  ],
  packages: [
    { name: 'Basic', price: 150, delivery: '3 Days', revisions: 1, desc: 'Single page landing site with basic animations.', includes: [true, false, false, false] },
    { name: 'Standard', price: 350, delivery: '5 Days', revisions: 3, desc: 'Multi-page React app (up to 4 pages).', includes: [true, true, true, false] },
    { name: 'Premium', price: 750, delivery: '10 Days', revisions: 'Unlimited', desc: 'Full custom web app with complex routing, states, and advanced animations.', includes: [true, true, true, true] }
  ]
};

export default function GigDetail() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGigById(id);
  
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(1); // Default to standard tab

  // If the backend isn't up, we fallback to our beautiful mock data to show the layout
  const gig = data && !isError ? data : MOCK_GIG;
  const activePackage = gig.packages?.[activeTab];

  return (
    <div className="w-full pb-24">
      <QueryWrapper 
        isLoading={isLoading} 
        isError={isError} 
        error={isError ? new Error("Failed to load gig details.") : null}
      >
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN - 65% width on large screens */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Header & Seller Row */}
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight text-text-primary mb-6">
                {gig?.title}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <img src={gig?.seller?.avatar} alt={gig?.seller?.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{gig?.seller?.name}</span>
                    {gig?.seller?.isTopRated && (
                      <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full border border-accent/20 font-bold tracking-wide uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Top Rated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted font-medium mt-0.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-text-primary">{gig?.seller?.rating}</span>
                    <span>({gig?.seller?.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="w-full h-[300px] sm:h-[450px] bg-surface rounded-2xl overflow-hidden border border-border">
                <img 
                  src={gig?.images?.[selectedImageIdx]} 
                  alt="Gig Cover" 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4 h-24">
                {gig?.images?.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-full h-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImageIdx === idx ? 'border-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">About this gig</h2>
              <p className="text-muted leading-relaxed text-lg whitespace-pre-wrap">
                {gig?.description}
              </p>
            </div>

            {/* What you get checklist */}
            <div className="bg-surface border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">What's included</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gig?.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 bg-accent/20 rounded-full p-1">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-text-primary">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* About the Seller */}
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">About the seller</h2>
              <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-start">
                <img src={gig?.seller?.avatar} alt={gig?.seller?.name} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{gig?.seller?.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted font-medium mb-4">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-text-primary">{gig?.seller?.rating}</span>
                    <span>({gig?.seller?.reviews} reviews)</span>
                  </div>
                  <p className="text-muted leading-relaxed mb-6">
                    {gig?.seller?.bio}
                  </p>
                  <Button variant="ghost" className="gap-2">
                    <Mail className="w-4 h-4" /> Contact Me
                  </Button>
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN - 35% width, Sticky Order Panel */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              
              {/* Tabs */}
              <div className="flex border-b border-border">
                {gig?.packages?.map((pkg, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === idx ? 'bg-primary border-accent text-accent' : 'bg-surface border-transparent text-muted hover:text-text-primary hover:bg-primary/50'}`}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>

              {/* Panel Content */}
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl">{activePackage?.name}</h3>
                  <span className="font-display text-3xl font-bold text-accent">${activePackage?.price}</span>
                </div>
                
                <p className="text-muted text-sm leading-relaxed">
                  {activePackage?.desc}
                </p>

                <div className="flex items-center gap-6 text-sm font-bold text-text-primary">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted" /> {activePackage?.delivery} Delivery
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 text-muted" /> {activePackage?.revisions} Revisions
                  </div>
                </div>

                {/* Package Features list */}
                <div className="space-y-3 mt-2">
                  {gig?.features?.map((feat, idx) => {
                    const isIncluded = activePackage?.includes?.[idx];
                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <Check className={`w-4 h-4 ${isIncluded ? 'text-accent' : 'text-border'}`} />
                        <span className={isIncluded ? 'text-text-primary' : 'text-muted line-through'}>{feat}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <Button variant="primary" size="lg" className="w-full">
                    Continue (${activePackage?.price})
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full">
                    Contact Seller
                  </Button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </QueryWrapper>
    </div>
  );
}
