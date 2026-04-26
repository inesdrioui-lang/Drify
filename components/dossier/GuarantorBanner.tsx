import type { GuarantorResult } from '@/lib/guarantor'

interface GuarantorBannerProps {
  result: GuarantorResult
}

export default function GuarantorBanner({ result }: GuarantorBannerProps) {
  if (!result.required) {
    return (
      <div role="alert" aria-live="polite" className="gban gban--ok">
        <div className="gban-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Votre profil est éligible sans garant.
        </div>
      </div>
    )
  }

  return (
    <div role="alert" aria-live="polite" className="gban gban--ko">
      <div className="gban-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Un garant est requis pour ce dossier.
      </div>
      {result.reasons.length > 0 && (
        <ul className="gban-reasons">
          {result.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
