// Wrapper de section avec titre et accent coloré à gauche

interface DossierSectionProps {
  title: string
  children: React.ReactNode
}

export default function DossierSection({ title, children }: DossierSectionProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {/* Accent vertical marron */}
        <div
          style={{
            width: '3px',
            height: '18px',
            background: '#6B3F26',
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#3B2314',
            fontFamily: 'Georgia, serif',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
