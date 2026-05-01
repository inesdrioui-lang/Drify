// Tableau récapitulatif 3 colonnes : type de dossier | revenus | garant(s)

import type { DossierLocataire } from '@/types/dossier'
import { TYPE_CONTRAT_LABELS, TYPE_DOSSIER_LABELS, TYPE_GARANT_LABELS } from '@/types/dossier'

interface DossierSummaryTableProps {
  dossier: DossierLocataire
}

export default function DossierSummaryTable({ dossier }: DossierSummaryTableProps) {
  const garantLabel =
    dossier.typeGarant === 'organisme' && dossier.nomOrganismeGarant
      ? dossier.nomOrganismeGarant
      : TYPE_GARANT_LABELS[dossier.typeGarant]

  const cols: { label: string; value: string; sub?: string; bg: string; valueColor: string }[] = [
    {
      label: 'Type de dossier',
      value: TYPE_DOSSIER_LABELS[dossier.typeDossier],
      sub: dossier.employeur
        ? `${TYPE_CONTRAT_LABELS[dossier.typeContrat]} · ${dossier.employeur}`
        : TYPE_CONTRAT_LABELS[dossier.typeContrat],
      bg: '#EDE0CF',
      valueColor: '#3B2314',
    },
    {
      label: 'Revenus mensuels nets',
      value: `${dossier.revenusMensuelsNets.toLocaleString('fr-FR')} €`,
      sub: `soit ${Math.round(dossier.revenusMensuelsNets * 12).toLocaleString('fr-FR')} €/an`,
      bg: '#FFFFFF',
      valueColor: '#6B3F26',
    },
    {
      label: 'Garant(s)',
      value: garantLabel,
      bg: '#EDE0CF',
      valueColor: '#3B2314',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '1px',
        background: '#D4B896',
        border: '1px solid #D4B896',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {cols.map((col, i) => (
        <div
          key={i}
          style={{
            background: col.bg,
            padding: '20px 22px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: '#6B3F26',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {col.label}
          </div>
          <div
            style={{
              fontSize: i === 1 ? '22px' : '16px',
              fontWeight: 800,
              color: col.valueColor,
              fontFamily: i === 1 ? '-apple-system, BlinkMacSystemFont, sans-serif' : 'Georgia, serif',
              lineHeight: 1.2,
            }}
          >
            {col.value}
          </div>
          {col.sub && (
            <div
              style={{
                fontSize: '11px',
                color: '#8A7068',
                marginTop: '5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {col.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
