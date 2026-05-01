// Page de démo du composant DossierPreview
// Données fictives hard-codées pour visualiser le rendu complet

import DossierPreview from '@/components/dossier/DossierPreview'
import type { DossierLocataire } from '@/types/dossier'

const demoData: DossierLocataire = {
  prenom: 'Marie',
  nom: 'Dupont',
  email: 'marie.dupont@email.com',
  dateNaissance: '15/03/1995',
  lieuNaissance: 'Lyon',
  nationalite: 'Française',
  typeDossier: 'seul',
  motDuLocataire:
    'Je suis sérieuse et soigneuse, et je cherche un logement calme pour télétravailler. ' +
    'Juriste en CDI depuis 3 ans, je suis en recherche active dans le secteur depuis un mois. ' +
    "N'hésitez pas à me contacter, je suis disponible pour visiter rapidement.",
  revenusMensuelsNets: 2800,
  typeContrat: 'CDI',
  employeur: 'Cabinet Martin & Associés',
  typeGarant: 'aucun',
  // Aucun document réel — affichage des placeholders
}

export default function DossierPreviewPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F0EBE3',
        padding: '40px 20px 80px',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <DossierPreview dossier={demoData} />
      </div>
    </main>
  )
}
