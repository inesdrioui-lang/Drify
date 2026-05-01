// Wrapper pour une page A4 (794px × 1123px, ratio ISO 216)
// Chaque instance représente une page physique dans le dossier imprimé

interface DossierPageProps {
  children: React.ReactNode
}

export default function DossierPage({ children }: DossierPageProps) {
  return (
    <div
      className="dossier-page"
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#FFFFFF',
        position: 'relative',
        boxShadow: '0 4px 32px rgba(59,35,20,0.13)',
        margin: '0 auto 40px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
