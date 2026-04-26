'use client'

import { calculateSolvabilityScore } from '@/lib/solvability'

interface SolvabilityScoreProps {
  revenuLocataire: number
  loyerCible: number
  revenusGarants: number[]
  isEtudiant: boolean
}

export default function SolvabilityScore({
  revenuLocataire,
  loyerCible,
  revenusGarants,
  isEtudiant,
}: SolvabilityScoreProps) {
  const result = calculateSolvabilityScore(revenuLocataire, loyerCible, 3, revenusGarants)

  const statusColor =
    result.status === 'ok' ? '#4A7C59' :
    result.status === 'garant_requis' ? '#9B7226' :
    '#9B3A2A'

  const statusBg =
    result.status === 'ok' ? '#EAF3EE' :
    result.status === 'garant_requis' ? '#FDF4E3' :
    '#FAECEC'

  if (loyerCible <= 0) {
    return (
      <div className="solv-empty">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Renseignez un loyer cible pour calculer votre solvabilité.</span>
      </div>
    )
  }

  return (
    <div className="solv-wrap">
      {/* Score locataire — informatif, gris */}
      <div className="solv-block">
        <div className="solv-block-header">
          <span className="solv-block-label">Score locataire</span>
          <span className="solv-block-tag solv-tag-grey">Informatif</span>
        </div>
        <div className="solv-score-row">
          <span className="solv-score-num" style={{ color: '#8A7068' }}>{result.scoreLocataire}</span>
          <span className="solv-score-denom">/100</span>
        </div>
        <div className="solv-bar-track">
          <div
            className="solv-bar-fill"
            style={{ width: `${result.scoreLocataire}%`, background: '#C4B0A8' }}
          />
        </div>
        <div className="solv-bar-caption">
          {revenuLocataire.toLocaleString('fr-FR')} € / seuil {result.seuilRequis.toLocaleString('fr-FR')} €
        </div>
      </div>

      {/* Score garants — validé, coloré */}
      {revenusGarants.length > 0 && (
        <div className="solv-block">
          <div className="solv-block-header">
            <span className="solv-block-label">Score garant{revenusGarants.length > 1 ? 's' : ''}</span>
            <span className="solv-block-tag" style={{ color: statusColor, background: statusBg }}>
              {result.garantsSolvables ? 'Suffisant' : 'Insuffisant'}
            </span>
          </div>
          <div className="solv-score-row">
            <span className="solv-score-num" style={{ color: statusColor }}>{result.scoreGarants}</span>
            <span className="solv-score-denom">/100</span>
          </div>
          <div className="solv-bar-track">
            <div
              className="solv-bar-fill"
              style={{ width: `${result.scoreGarants}%`, background: statusColor }}
            />
          </div>
          <div className="solv-bar-caption">
            {result.revenuTotalGarants.toLocaleString('fr-FR')} € / seuil {result.seuilRequis.toLocaleString('fr-FR')} €
          </div>
        </div>
      )}

      {/* Message */}
      <div className="solv-message" style={{ color: statusColor, background: statusBg }}>
        {isEtudiant && result.status === 'ok' && revenusGarants.length === 0
          ? 'En tant qu\'étudiant, un garant est obligatoire pour valider votre dossier.'
          : result.messageUtilisateur}
      </div>
    </div>
  )
}
