'use client'

interface SummaryProps {
  score: number
  missingItems: string[]
  isComplete: boolean
  onShare?: () => void
}

export default function DossierSummary({ score, missingItems, isComplete, onShare }: SummaryProps) {
  const scoreColor =
    score >= 80 ? '#4A7C59' :
    score >= 50 ? '#9B7226' :
    '#9B3A2A'

  return (
    <div className="summary-card">
      <div className="summary-score-row">
        <div className="summary-score-num" style={{ color: scoreColor }}>{score}</div>
        <div className="summary-score-label">
          <div className="summary-score-title">Force du dossier</div>
          <div className="summary-score-sub">sur 100 points</div>
        </div>
      </div>

      <div className="summary-bar-track">
        <div
          className="summary-bar-fill"
          style={{ width: `${score}%`, background: scoreColor }}
        />
      </div>

      {missingItems.length > 0 ? (
        <div className="summary-missing">
          <div className="summary-missing-title">Documents manquants</div>
          <ul className="summary-missing-list">
            {missingItems.map((item, i) => (
              <li key={i} className="summary-missing-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="summary-complete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Dossier complet — prêt à être partagé !
        </div>
      )}

      <button
        type="button"
        className={`btn-share${!isComplete ? ' btn-share--disabled' : ''}`}
        onClick={isComplete ? onShare : undefined}
        disabled={!isComplete}
        title={!isComplete ? 'Complétez votre dossier avant de le partager' : undefined}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        {isComplete ? 'Partager mon dossier' : 'Dossier incomplet'}
      </button>
    </div>
  )
}
