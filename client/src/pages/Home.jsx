import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Palette, Code, Megaphone, Video,
  PenTool, Music, Briefcase, Cpu, ArrowRight
} from 'lucide-react';
import GigCard from '../components/shared/GigCard';
import { mockGigs } from '../utils/mockData';
import { useGigs } from '../hooks/useGigs';

const categories = [
  { name: 'Design',      icon: Palette,  value: 'design'      },
  { name: 'Development', icon: Code,     value: 'development' },
  { name: 'Marketing',   icon: Megaphone,value: 'marketing'   },
  { name: 'Video',       icon: Video,    value: 'video'       },
  { name: 'Writing',     icon: PenTool,  value: 'writing'     },
  { name: 'Music',       icon: Music,    value: 'music'       },
  { name: 'Business',    icon: Briefcase,value: 'business'    },
  { name: 'AI',          icon: Cpu,      value: 'ai'          },
];

const steps = [
  { title: 'Post a job',  desc: 'Tell us what you need done in seconds.'                    },
  { title: 'Browse gigs', desc: 'Find the perfect freelancer for your project.'              },
  { title: 'Get it done', desc: 'Collaborate securely and pay only when satisfied.'          },
];

// ── Featured Gigs ─────────────────────────────────────────
function FeaturedGigs() {
  const { data, isLoading } = useGigs({ featured: true, limit: 4 });
  const gigs = data?.data || mockGigs.filter(g => g.isFeatured).slice(0, 4);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 60px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:26, color:'#fafafa' }}>
          Featured gigs
        </h2>
        <Link to="/explore" style={{ color:'#C8F135', fontSize:14, textDecoration:'none', fontFamily:'DM Sans,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background:'#111', borderRadius:16, height:280, border:'1px solid #1e1e1e', animation:'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
          {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>
    </section>
  );
}

// ── Home page ─────────────────────────────────────────────
export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/explore?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="flex flex-col w-full pb-20">

      {/* 1. HERO */}
      <section className="relative w-full overflow-hidden pt-16 pb-24 px-6">

        {/* Decorative bg cards — fixed width so they don't affect layout */}
        <div style={{
          position:'absolute', top:40, right:-80,
          transform:'rotate(-8deg)', opacity:0.08,
          pointerEvents:'none', filter:'blur(2px)',
          width:280, zIndex:0,
        }}>
          <GigCard gig={mockGigs[0]} />
        </div>
        <div style={{
          position:'absolute', top:160, left:-80,
          transform:'rotate(12deg)', opacity:0.08,
          pointerEvents:'none', filter:'blur(3px)',
          width:280, zIndex:0,
        }} className="hidden md:block">
          <GigCard gig={mockGigs[1]} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-text-primary leading-tight mb-8">
            Find the perfect freelancer for your next{' '}
            <span className="text-accent italic">idea.</span>
          </h1>

          {/* Search */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center mb-6">
            <div className="absolute left-6 text-muted pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Try 'build a website' or 'logo design'"
              className="w-full bg-surface border-2 border-border rounded-full py-5 pl-16 pr-32 text-lg outline-none focus:border-accent transition-colors shadow-2xl"
            />
            <button type="submit" className="absolute right-3 bg-accent text-[#0A0A0A] font-bold rounded-full px-6 py-3 hover:opacity-85 transition-opacity">
              Search
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap justify-center gap-3 items-center text-sm font-medium">
            <span className="text-muted mr-2">Popular:</span>
            {['Website Design', 'WordPress', 'Logo Design', 'AI Services'].map(tag => (
              <span key={tag}
                onClick={() => navigate(`/explore?search=${encodeURIComponent(tag)}`)}
                className="border border-border rounded-full px-4 py-1.5 hover:border-accent hover:text-accent cursor-pointer transition-colors bg-surface/50 backdrop-blur-sm"
              >{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <h2 className="text-3xl font-display font-bold mb-10">Browse by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.name}
              onClick={() => navigate(`/explore?category=${cat.value}`)}
              className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 group hover:border-accent hover:shadow-[0_0_20px_rgba(200,241,53,0.1)] transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <cat.icon className="w-8 h-8 text-text-primary group-hover:text-accent transition-colors" />
              </div>
              <span className="font-bold text-lg">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED GIGS */}
      <FeaturedGigs />

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full bg-surface border border-border rounded-3xl my-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">How it works</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Getting work done has never been easier. Connect with top talent in three simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-border z-0" />
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-accent text-[#0A0A0A] font-display font-bold text-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(200,241,53,0.3)]">
                {idx + 1}
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}