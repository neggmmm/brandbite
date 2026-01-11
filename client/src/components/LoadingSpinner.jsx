export default function LoadingSpinner({ size = "40px", overlay = false }) {
  const getPrimary = () => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--color-primary')?.trim();
      if (v) return v;
    } catch (e) {
      // ignore
    }
    try {
      const branding = localStorage.getItem('branding');
      if (branding) {
        const b = JSON.parse(branding);
        if (b?.primaryColor) return b.primaryColor;
      }
    } catch (e) {}
    return '#2563eb';
  };

  const color = getPrimary();

  const spinner = (
    <div
      className="animate-spin rounded-full"
      style={{
        width: size,
        height: size,
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: color,
        borderTopColor: 'transparent',
        borderRadius: '9999px',
      }}
    />
  );

  if (!overlay) return spinner;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        zIndex: 9999,
      }}
    >
      {spinner}
    </div>
  );
}
