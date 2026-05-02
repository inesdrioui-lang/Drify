// Header récurrent sur chaque page : logo Drify à gauche, nom du locataire à droite

interface DossierHeaderProps {
  prenom: string
  nom: string
  sectionLabel?: string
}

export default function DossierHeader({ prenom, nom, sectionLabel }: DossierHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: '#F7F2EA',
        borderBottom: '1px solid #D4B896',
        flexShrink: 0,
      }}
    >
      {/* Logo Drify */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '26px',
            height: '26px',
            background: '#3B2314',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: '#F7F2EA',
              fontWeight: 800,
              fontSize: '13px',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            D
          </span>
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: '#6B3F26',
            letterSpacing: '-0.03em',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          drify
        </span>
      </div>

      {/* Nom + section */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#3B2314',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {prenom} {nom}
        </div>
        {sectionLabel && (
          <div
            style={{
              fontSize: '10px',
              color: '#A0673A',
              marginTop: '2px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {sectionLabel}
          </div>
        )}
      </div>
    </div>
  )
}
