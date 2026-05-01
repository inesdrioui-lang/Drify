// Types TypeScript pour le dossier de location Drify

export interface DossierLocataire {
  // Identité
  prenom: string
  nom: string
  email: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string

  // Situation
  typeDossier: 'seul' | 'couple' | 'colocation'
  motDuLocataire?: string

  // Revenus
  revenusMensuelsNets: number
  typeContrat: 'CDI' | 'CDD' | 'stage' | 'etudiant' | 'independant' | 'autre'
  employeur?: string

  // Garant
  typeGarant: 'aucun' | 'personne_physique' | 'organisme'
  nomOrganismeGarant?: string // ex: "Visale / Action Logement"

  // Pièces justificatives (URLs Supabase Storage ou null)
  pieceIdentiteUrl?: string
  justificatifHebergementUrls?: string[]
  justificatifActiviteUrl?: string
  justificatifRessourcesUrls?: string[]
  avisImpositionUrl?: string
  attestationGarantUrl?: string
}

// Étiquettes lisibles pour l'interface
export const TYPE_DOSSIER_LABELS: Record<DossierLocataire['typeDossier'], string> = {
  seul: 'Seul(e)',
  couple: 'En couple',
  colocation: 'Colocation',
}

export const TYPE_CONTRAT_LABELS: Record<DossierLocataire['typeContrat'], string> = {
  CDI: 'Salarié(e) CDI',
  CDD: 'Salarié(e) CDD',
  stage: 'Stagiaire',
  etudiant: 'Étudiant(e)',
  independant: 'Indépendant(e)',
  autre: 'Autre',
}

export const TYPE_GARANT_LABELS: Record<DossierLocataire['typeGarant'], string> = {
  aucun: 'Aucun garant',
  personne_physique: 'Personne physique',
  organisme: 'Organisme',
}

// Calcule la structure des pages du dossier (numéros et étiquettes)
export function buildPageMap(dossier: DossierLocataire): {
  pages: { label: string; page: number }[]
  total: number
} {
  let pageNum = 1 // La couverture est toujours la page 1
  const pages: { label: string; page: number }[] = []

  if (dossier.motDuLocataire) {
    pageNum++
    pages.push({ label: 'Le mot du locataire', page: pageNum })
  }

  pageNum++
  pages.push({ label: `La pièce d'identité de ${dossier.prenom}`, page: pageNum })

  pageNum++
  pages.push({ label: `Le justificatif d'activité de ${dossier.prenom}`, page: pageNum })

  pageNum++
  pages.push({ label: `Les justificatifs de revenus de ${dossier.prenom}`, page: pageNum })

  pageNum++
  pages.push({ label: `L'avis d'imposition de ${dossier.prenom}`, page: pageNum })

  pageNum++
  pages.push({ label: `Le justificatif d'hébergement actuel`, page: pageNum })

  if (dossier.typeGarant !== 'aucun') {
    pageNum++
    pages.push({ label: `L'attestation du garant`, page: pageNum })
  }

  return { pages, total: pageNum }
}
