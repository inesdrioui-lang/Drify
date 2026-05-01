'use client'

// Affichage d'un justificatif : image réelle si URL disponible, sinon placeholder stylé

interface DossierDocumentViewProps {
  url?: string
  label: string
  loading?: boolean
}

export default function DossierDocumentView({
  url,
  label,
  loading = false,
}: DossierDocumentViewProps) {
  if (loading) {
    return (
      <div
        className="dossier-shimmer"
        style={{
          width: '100%',
          height: '360px',
          background: '#EDE0CF',
          borderRadius: '12px',
          border: '1px solid #D4B896',
        }}
      />
    )
  }

  if (url) {
    return (
      <div
        style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #D4B896',
          boxShadow: '0 2px 12px rgba(59,35,20,0.07)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          style={{
            width: '100%',
            display: 'block',
            maxHeight: '480px',
            objectFit: 'contain',
            background: '#FDFCFA',
          }}
        />
      </div>
    )
  }

  // Placeholder lorsqu'aucun document n'est fourni
  return (
    <div
      style={{
        width: '100%',
        height: '300px',
        background: '#F7F2EA',
        borderRadius: '12px',
        border: '2px dashed #D4B896',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
      }}
    >
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <rect x="8" y="4" width="28" height="36" rx="4" fill="#EDE0CF" stroke="#D4B896" strokeWidth="1.5" />
        <path d="M15 14h14M15 20h14M15 26h9" stroke="#A0673A" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="38" cy="38" r="10" fill="#6B3F26" />
        <path d="M34 38h8M38 34v8" stroke="#F7F2EA" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#6B3F26',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Document non ajouté
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#A0673A',
            marginTop: '4px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
