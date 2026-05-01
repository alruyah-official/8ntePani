export default function PageWrapper({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#FAFAFA',
      fontFamily: 'DM Sans, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 64,       /* ← pushes content below the fixed 64px navbar */
      position: 'relative',
    }}>

      {/* Subtle dot-grid background texture */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Page content sits above the dot grid */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}