export default function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0A0A0A',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 36, color: '#C8F135', letterSpacing: '-1px',
        animation: 'pulse 1.6s ease-in-out infinite',
      }}>
        SkillHive
      </div>

      {/* Spinner */}
      <div style={{
        width: 32, height: 32,
        border: '3px solid #1e1e1e',
        borderTop: '3px solid #C8F135',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}