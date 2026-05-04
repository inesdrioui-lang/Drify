'use client'
import React from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import { DossierPDF } from '@/lib/pdf/DossierPDF'
import { DownloadDossierButton } from './DownloadDossierButton'
import type { DossierTemplateData } from '@/lib/pdf/dossier-template'

interface DossierPreviewProps {
  data: DossierTemplateData
}

export default function DossierPreview({ data }: DossierPreviewProps) {
  const { prenom, nom } = data.candidat
  const totalPages = 1 + data.documents.length

  return (
    <div>
      {/* Barre d'actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '0 4px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#3B2314',
              fontFamily: 'Georgia, serif',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Prévisualisation du dossier
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#8A7068',
              marginTop: '4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {prenom} {nom} · {totalPages} pages
          </p>
        </div>
        <DownloadDossierButton data={data} />
      </div>

      {/* Prévisualisation PDF inline */}
      <div
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #EAE3DA',
          boxShadow: '0 4px 24px rgba(59,35,20,0.08)',
        }}
      >
        <PDFViewer width="100%" height={760}>
          <DossierPDF data={data} />
        </PDFViewer>
      </div>
    </div>
  )
}
