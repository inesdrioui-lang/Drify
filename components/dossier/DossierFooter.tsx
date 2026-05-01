// Footer de page : mention Drify à gauche, numéro de page à droite

interface DossierFooterProps {
  currentPage: number
  totalPages: number
}

export default function DossierFooter({ currentPage, totalPages }: DossierFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px',
        borderTop: '1px solid #EDE0CF',
        marginTop: 'auto',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: '10px',
          color: '#A0673A',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        Dossier généré par Drify · drify.fr
      </span>
      <span
        style={{
          fontSize: '10px',
          color: '#A0673A',
          fontWeight: 600,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {currentPage}/{totalPages}
      </span>
    </div>
  )
}
