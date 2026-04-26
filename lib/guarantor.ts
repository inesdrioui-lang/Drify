export type StatutPro = 'cdi' | 'cdd' | 'freelance'

export type GuarantorResult = {
  required: boolean
  reasons: string[]
  profilOk: boolean
  revenusOk: boolean
}

export type EvaluateGuarantorParams = {
  statut: StatutPro
  periodeEssai?: boolean         // CDI uniquement
  dateFin?: Date                 // CDD uniquement
  dateDebutActivite?: Date       // Freelance uniquement
  revenuMensuelNet: number
  loyerMensuel: number
  multiplicateurSeuil?: number   // défaut 3, fourni par prop/contexte
}

export function evaluateGuarantor(params: EvaluateGuarantorParams): GuarantorResult {
  const {
    statut,
    periodeEssai,
    dateFin,
    dateDebutActivite,
    revenuMensuelNet,
    loyerMensuel,
    multiplicateurSeuil = 3,
  } = params

  const seuil = loyerMensuel * multiplicateurSeuil
  const revenusOk = revenuMensuelNet >= seuil
  const revenusRaison = `revenus inférieurs au seuil recommandé de ${seuil.toLocaleString('fr-FR')} €/mois`

  let profilOk = true
  let profilRaison = ''

  switch (statut) {
    case 'cdi':
      profilOk = periodeEssai === false
      if (!profilOk) profilRaison = "période d'essai en cours"
      break

    case 'cdd': {
      if (!dateFin) {
        profilOk = false
        profilRaison = 'date de fin de CDD non renseignée'
      } else {
        const now = new Date()
        const diffMs = dateFin.getTime() - now.getTime()
        // 30.4375 jours/mois en moyenne (365.25/12)
        const moisRestants = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375))
        profilOk = moisRestants >= 6
        if (!profilOk) profilRaison = 'moins de 6 mois restants sur le CDD'
      }
      break
    }

    case 'freelance': {
      if (!dateDebutActivite) {
        profilOk = false
        profilRaison = "date de début d'activité non renseignée"
      } else {
        const now = new Date()
        const diffMs = now.getTime() - dateDebutActivite.getTime()
        const annees = diffMs / (1000 * 60 * 60 * 24 * 365.25)
        profilOk = annees >= 2
        if (!profilOk) profilRaison = "moins de 2 ans d'ancienneté d'activité"
      }
      break
    }
  }

  const reasons: string[] = []
  if (!profilOk) reasons.push(profilRaison)
  if (!revenusOk) reasons.push(revenusRaison)

  return {
    required: !profilOk || !revenusOk,
    reasons,
    profilOk,
    revenusOk,
  }
}
