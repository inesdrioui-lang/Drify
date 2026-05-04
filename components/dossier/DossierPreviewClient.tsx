'use client'
import dynamic from 'next/dynamic'
import type { DossierTemplateData } from '@/lib/pdf/dossier-template'

// PDFViewer + PDFDownloadLink sont browser-only — charger uniquement côté client
const DossierPreview = dynamic(
  () => import('./DossierPreview'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 760,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F7F2EA',
          borderRadius: 12,
          border: '1px solid #EAE3DA',
        }}
      >
        <p style={{ color: '#8A7068', fontFamily: '-apple-system, sans-serif', fontSize: 14 }}>
          Chargement du PDF…
        </p>
      </div>
    ),
  }
)

interface Props {
  data: DossierTemplateData
}

export function DossierPreviewClient({ data }: Props) {
  return <DossierPreview data={data} />
}
