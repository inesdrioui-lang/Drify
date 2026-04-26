export interface SolvabilityResult {
  seuilRequis: number
  scoreLocataire: number
  scoreGarants: number
  revenuTotalGarants: number
  locataireSolvableSeul: boolean
  garantsSolvables: boolean
  status: 'ok' | 'garant_requis' | 'garant_insuffisant' | 'insuffisant'
  needsGarant: boolean
  messageUtilisateur: string
}

export function calculateSolvabilityScore(
  revenuLocataire: number,
  loyer: number,
  multiplicateur: number = 3,
  revenusGarants: number[] = []
): SolvabilityResult {
  const seuilRequis = loyer * multiplicateur
  const revenuTotalGarants = revenusGarants.reduce((acc, r) => acc + r, 0)

  const locataireSolvableSeul = revenuLocataire >= seuilRequis

  // Scores indépendants — JAMAIS additionnés
  const scoreLocataire = seuilRequis > 0
    ? Math.round(Math.min((revenuLocataire / seuilRequis) * 100, 100))
    : 0
  const scoreGarants = seuilRequis > 0 && revenuTotalGarants > 0
    ? Math.round(Math.min((revenuTotalGarants / seuilRequis) * 100, 100))
    : 0

  const garantsSolvables = revenuTotalGarants >= seuilRequis
  const hasGarants = revenusGarants.length > 0

  let status: SolvabilityResult['status']
  let needsGarant: boolean
  let messageUtilisateur: string

  if (loyer <= 0) {
    status = 'ok'
    needsGarant = false
    messageUtilisateur = 'Renseignez le loyer cible pour calculer votre solvabilité.'
  } else if (locataireSolvableSeul) {
    status = 'ok'
    needsGarant = false
    messageUtilisateur = `Vos revenus couvrent le loyer cible (${loyer.toLocaleString('fr-FR')} €/mois). Aucun garant nécessaire.`
  } else if (!hasGarants) {
    status = 'garant_requis'
    needsGarant = true
    messageUtilisateur = `Vos revenus (${revenuLocataire.toLocaleString('fr-FR')} €) sont inférieurs au seuil requis (${seuilRequis.toLocaleString('fr-FR')} €). Ajoutez un garant.`
  } else if (garantsSolvables) {
    status = 'ok'
    needsGarant = true
    messageUtilisateur = `Votre garant couvre le seuil requis (${seuilRequis.toLocaleString('fr-FR')} €). Dossier recevable.`
  } else {
    status = 'garant_insuffisant'
    needsGarant = true
    messageUtilisateur = `Même avec votre garant, le seuil de ${seuilRequis.toLocaleString('fr-FR')} €/mois n'est pas atteint. Envisagez un second garant.`
  }

  return {
    seuilRequis,
    scoreLocataire,
    scoreGarants,
    revenuTotalGarants,
    locataireSolvableSeul,
    garantsSolvables,
    status,
    needsGarant,
    messageUtilisateur,
  }
}
