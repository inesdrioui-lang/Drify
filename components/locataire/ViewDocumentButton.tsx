'use client'

import { useState } from 'react'
import { getSignedUrl } from '@/app/locataire/actions'

interface ViewDocumentButtonProps {
  fichierPath: string
}

export default function ViewDocumentButton({ fichierPath }: ViewDocumentButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleView() {
    setLoading(true)
    const url = await getSignedUrl(fichierPath)
    setLoading(false)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleView}
      disabled={loading}
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--brown-mid)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        padding: '4px 10px',
        background: 'transparent',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: loading ? 0.6 : 1,
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => { if (!loading) { (e.target as HTMLButtonElement).style.background = 'var(--bg-soft)'; (e.target as HTMLButtonElement).style.color = 'var(--brown)' } }}
      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = 'var(--brown-mid)' }}
    >
      {loading ? '…' : 'Voir'}
    </button>
  )
}
