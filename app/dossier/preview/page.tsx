// Page de démo — prévisualisation du dossier locataire Drify
// Données fictives pour tester le rendu PDF sans authentification

import { DossierPreviewClient } from '@/components/dossier/DossierPreviewClient'
import type { DossierTemplateData } from '@/lib/pdf/dossier-template'

const demoData: DossierTemplateData = {
  candidat: {
    prenom: 'Marie',
    nom: 'Dupont',
    email: 'marie.dupont@email.com',
    telephone: '06 12 34 56 78',
    adresse_actuelle: '12 rue des Fleurs, 75011 Paris',
    situation_professionnelle: 'Salarié CDI',
    revenus_mensuels_nets: 2800,
    nom_employeur: 'Cabinet Martin & Associés',
    garant_label: 'Aucun',
  },
  dossier: {
    reference: 'DRF-2026-DEMO',
    date_generation: '4 mai 2026',
    score_confiance: 87,
  },
  documents: [
    {
      type: 'piece_identite',
      label: "Pièce d'identité",
      statut: 'non_fourni',
    },
    {
      type: 'contrat_travail',
      label: 'Contrat de travail',
      statut: 'non_fourni',
    },
    {
      type: 'bulletin_salaire',
      label: 'Bulletin de salaire (mars 2026)',
      statut: 'non_fourni',
    },
    {
      type: 'bulletin_salaire',
      label: 'Bulletin de salaire (février 2026)',
      statut: 'non_fourni',
    },
    {
      type: 'bulletin_salaire',
      label: 'Bulletin de salaire (janvier 2026)',
      statut: 'non_fourni',
    },
    {
      type: 'avis_imposition',
      label: "Avis d'imposition 2025",
      statut: 'non_fourni',
    },
    {
      type: 'justificatif_domicile',
      label: 'Justificatif de domicile',
      statut: 'non_fourni',
    },
  ],
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <DossierPreviewClient data={demoData} />
      </div>
    </main>
  )
}
