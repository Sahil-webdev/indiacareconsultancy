'use client';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #060C14 0%, #0E1623 50%, #0A1620 100%)',
          color: '#F0FAF8',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <main
          style={{
            width: 'min(92vw, 520px)',
            padding: '32px',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Panel load nahi ho paaya</h1>
          <p style={{ margin: '12px 0 0', color: '#94A3B8', lineHeight: 1.6 }}>
            Page render ke time ek unexpected error aayi. Retry karke app ko dobara load kijiye.
          </p>
          {error.digest ? (
            <p style={{ margin: '12px 0 0', color: '#64748B', fontSize: '0.875rem' }}>
              Error ID: {error.digest}
            </p>
          ) : null}
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: '20px',
              border: 0,
              borderRadius: '14px',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #127A6A, #075E52)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
