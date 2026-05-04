'use client'
import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { DossierPDF } from '@/lib/pdf/DossierPDF'
import type { DossierTemplateData } from '@/lib/pdf/dossier-template'

interface Props {
  data: DossierTemplateData
  className?: string
}

export function DownloadDossierButton({ data, className }: Props) {
  const { prenom, nom } = data.candidat
  const fileName = `dossier-drify-${prenom.toLowerCase()}-${nom.toLowerCase()}.pdf`

  return (
    <PDFDownloadLink document={<DossierPDF data={data} />} fileName={fileName}>
      {({ loading, error }) => (
        <button
          disabled={loading}
          className={className}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            color: '#FFFFFF',
            backgroundColor: loading ? '#A0673A' : '#3B2314',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background 0.15s ease',
          }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Génération en cours...
            </>
          ) : error ? (
            <>Erreur — réessayer</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger mon dossier PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  )
}
