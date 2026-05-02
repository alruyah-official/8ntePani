import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, Menu, X, Bell, ChevronDown,
  LayoutDashboard, ShoppingBag, MessageSquare,
  PlusCircle, Settings, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIsSeller } from '../../hooks/useRole';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const isSeller = useIsSeller();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navbar shadow on scroll
  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  function handleLogout() {
    setDropdownOpen(false);
    logout();
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e1e1e',
      boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>

        {/* Logo */}


          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
            <img
              src="/8ntepani.logowhite.png"
              alt="8ntepani"
              style={{
                height: 120,
                width: 140,
                /* Makes black logo show as lime green on dark bg */
                // filter: 'invert(1) sepia(1) saturate(5) hue-rotate(30deg)',
              }}
            />
          </Link>






        {/* <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="15,2 27,8.5 27,21.5 15,28 3,21.5 3,8.5"
            fill="rgba(200,241,53,0.12)" stroke="#C8F135" strokeWidth="1.5"/>
          <polygon points="15,7 23,11.5 23,18.5 15,23 7,18.5 7,11.5"
            fill="rgba(200,241,53,0.25)"/>
          <polygon points="15,11.5 19,13.8 19,17.2 15,19.5 11,17.2 11,13.8"
            fill="#C8F135"/>
        </svg>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 22,
          color: '#C8F135',
          letterSpacing: '-0.5px',
        }}>
          8ntepani
          </span>
      </Link> */}

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search for any service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: 40,
              background: '#161616', border: '1px solid #2a2a2a',
              borderRadius: 999, color: '#fafafa', fontSize: 13,
              padding: '0 16px 0 40px', outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onFocus={e => e.target.style.borderColor = '#C8F135'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
          />
        </form>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

          <NavLink to="/explore" style={({ isActive }) => ({
            color: isActive ? '#C8F135' : '#aaa', textDecoration: 'none',
            fontSize: 14, padding: '6px 12px', borderRadius: 8,
            fontFamily: 'DM Sans, sans-serif',
            background: isActive ? 'rgba(200,241,53,0.08)' : 'transparent',
            transition: 'color 0.2s',
          })}>
            Explore
          </NavLink>

          {/* Create Gig — sellers only */}
          {isAuthenticated && isSeller && (
            <Link to="/gig/create" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#aaa', textDecoration: 'none', fontSize: 14,
              padding: '6px 12px', borderRadius: 8,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#C8F135'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >
              <PlusCircle size={15} /> Create Gig
            </Link>
          )}

          {/* Logged OUT state */}
          {!isAuthenticated && (<>
            <Link to="/login" style={{
              color: '#aaa', textDecoration: 'none', fontSize: 14,
              padding: '6px 14px', borderRadius: 8,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >Sign in</Link>

            <Link to="/signup" style={{
              background: '#C8F135', color: '#000',
              textDecoration: 'none', fontSize: 14, fontWeight: 700,
              padding: '8px 18px', borderRadius: 999,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Join Free</Link>
          </>)}

          {/* Logged IN state */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {/* Avatar button */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#161616', border: '1px solid #2a2a2a',
                  borderRadius: 999, padding: '5px 12px 5px 5px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#C8F135'}
                onMouseLeave={e => !dropdownOpen && (e.currentTarget.style.borderColor = '#2a2a2a')}
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111111&color=C8F135&size=32`}
                  alt={user?.name}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ color: '#fafafa', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="#888"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220, background: '#111', border: '1px solid #222',
                  borderRadius: 14, padding: '6px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  {/* User info */}
                  <div style={{ padding: '10px 12px 10px', borderBottom: '1px solid #1e1e1e', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{user?.email}</div>
                    {user?.sellerLevel && (
                      <span style={{
                        display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700,
                        background: 'rgba(200,241,53,0.12)', color: '#C8F135',
                        padding: '2px 8px', borderRadius: 999,
                      }}>
                        <Zap size={9} style={{ display: 'inline', marginRight: 3 }} />
                        {user.sellerLevel.toUpperCase()} SELLER
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                    { icon: ShoppingBag, label: 'My Orders', to: '/orders' },
                    { icon: MessageSquare, label: 'Messages', to: '/messages' },
                    { icon: Settings, label: 'Settings', to: '/settings' },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link key={to} to={to}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 9,
                        color: '#bbb', textDecoration: 'none', fontSize: 13,
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fafafa'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#bbb'; }}
                    >
                      <Icon size={15} /> {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 12px', borderRadius: 9, background: 'transparent',
                      border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
