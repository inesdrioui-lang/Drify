'use client'

// Composant principal — orchestre toutes les pages du dossier de location
// Utilise window.print() pour l'export PDF (CSS @media print dans globals.css)

import type { DossierLocataire } from '@/types/dossier'
import { buildPageMap } from '@/types/dossier'
import DossierPage from './DossierPage'
import DossierHeader from './DossierHeader'
import DossierCover from './DossierCover'
import DossierSection from './DossierSection'
import DossierDocumentView from './DossierDocumentView'
import DossierFooter from './DossierFooter'

interface DossierPreviewProps {
  dossier: DossierLocataire
  loading?: boolean
}

export default function DossierPreview({ dossier, loading = false }: DossierPreviewProps) {
  const { pages: tableOfContents, total: totalPages } = buildPageMap(dossier)

  // Retrouve le numéro de page pour un label donné
  const getPage = (label: string) =>
    tableOfContents.find((p) => p.label === label)?.page ?? 0

  const motPage = dossier.motDuLocataire ? getPage('Le mot du locataire') : 0
  const identitePage = getPage(`La pièce d'identité de ${dossier.prenom}`)
  const activitePage = getPage(`Le justificatif d'activité de ${dossier.prenom}`)
  const revenusPage = getPage(`Les justificatifs de revenus de ${dossier.prenom}`)
  const impositionPage = getPage(`L'avis d'imposition de ${dossier.prenom}`)
  const hebergementPage = getPage(`Le justificatif d'hébergement actuel`)
  const garantPage =
    dossier.typeGarant !== 'aucun' ? getPage(`L'attestation du garant`) : 0

  return (
    <div>
      {/* Barre d'actions — masquée à l'impression */}
      <div
        className="no-print"
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
            {dossier.prenom} {dossier.nom} · {totalPages} pages
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#3B2314',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#6B3F26')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#3B2314')}
        >
          {/* Icône imprimante */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Imprimer / Exporter PDF
        </button>
      </div>

      {/* ─── PAGE 1 : Couverture ─── */}
      <DossierPage>
        <DossierCover
          dossier={dossier}
          totalPages={totalPages}
          tableOfContents={tableOfContents}
        />
      </DossierPage>

      {/* ─── PAGE 2 (optionnelle) : Mot du locataire ─── */}
      {dossier.motDuLocataire && (
        <DossierPage>
          <DossierHeader
            prenom={dossier.prenom}
            nom={dossier.nom}
            sectionLabel="Le mot du locataire"
          />
          <div style={{ padding: '40px 36px', flex: 1 }}>
            <DossierSection title={`Le mot de ${dossier.prenom}`}>
              <div
                style={{
                  background: '#F7F2EA',
                  border: '1px solid #D4B896',
                  borderRadius: '12px',
                  padding: '28px 32px',
                }}
              >
                {/* Guillemet décoratif */}
                <div
                  style={{
                    fontSize: '64px',
                    lineHeight: 0.8,
                    color: '#D4B896',
                    fontFamily: 'Georgia, serif',
                    marginBottom: '12px',
                    userSelect: 'none',
                  }}
                >
                  &ldquo;
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    fontStyle: 'italic',
                    color: '#3B2314',
                    lineHeight: 1.7,
                    margin: 0,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {dossier.motDuLocataire}
                </p>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #D4B896',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {/* Avatar initiales */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#6B3F26',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#F7F2EA',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {dossier.prenom[0]}{dossier.nom[0]}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#3B2314',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {dossier.prenom} {dossier.nom}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8A7068',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Locataire
                    </div>
                  </div>
                </div>
              </div>
            </DossierSection>
          </div>
          <DossierFooter currentPage={motPage} totalPages={totalPages} />
        </DossierPage>
      )}

      {/* ─── Pièce d'identité ─── */}
      <DossierPage>
        <DossierHeader
          prenom={dossier.prenom}
          nom={dossier.nom}
          sectionLabel="Pièce d'identité"
        />
        <div style={{ padding: '40px 36px', flex: 1 }}>
          <DossierSection title={`La pièce d'identité de ${dossier.prenom}`}>
            <DossierDocumentView
              url={dossier.pieceIdentiteUrl}
              label="Carte nationale d'identité ou passeport"
              loading={loading}
            />
          </DossierSection>
        </div>
        <DossierFooter currentPage={identitePage} totalPages={totalPages} />
      </DossierPage>

      {/* ─── Justificatif d'activité ─── */}
      <DossierPage>
        <DossierHeader
          prenom={dossier.prenom}
          nom={dossier.nom}
          sectionLabel="Activité professionnelle"
        />
        <div style={{ padding: '40px 36px', flex: 1 }}>
          <DossierSection title={`Le justificatif d'activité de ${dossier.prenom}`}>
            <DossierDocumentView
              url={dossier.justificatifActiviteUrl}
              label="Contrat de travail, kbis ou justificatif d'activité"
              loading={loading}
            />
          </DossierSection>
        </div>
        <DossierFooter currentPage={activitePage} totalPages={totalPages} />
      </DossierPage>

      {/* ─── Justificatifs de revenus ─── */}
      <DossierPage>
        <DossierHeader
          prenom={dossier.prenom}
          nom={dossier.nom}
          sectionLabel="Revenus"
        />
        <div style={{ padding: '40px 36px', flex: 1 }}>
          <DossierSection title={`Les justificatifs de revenus de ${dossier.prenom}`}>
            {dossier.justificatifRessourcesUrls && dossier.justificatifRessourcesUrls.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dossier.justificatifRessourcesUrls.map((url, i) => (
                  <DossierDocumentView
                    key={i}
                    url={url}
                    label={`Bulletin de salaire ${i + 1}`}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              <DossierDocumentView
                label="3 derniers bulletins de salaire ou justificatifs de revenus"
                loading={loading}
              />
            )}
          </DossierSection>
        </div>
        <DossierFooter currentPage={revenusPage} totalPages={totalPages} />
      </DossierPage>

      {/* ─── Avis d'imposition ─── */}
      <DossierPage>
        <DossierHeader
          prenom={dossier.prenom}
          nom={dossier.nom}
          sectionLabel="Avis d'imposition"
        />
        <div style={{ padding: '40px 36px', flex: 1 }}>
          <DossierSection title={`L'avis d'imposition de ${dossier.prenom}`}>
            <DossierDocumentView
              url={dossier.avisImpositionUrl}
              label="Dernier avis d'imposition (ou de non-imposition)"
              loading={loading}
            />
          </DossierSection>
        </div>
        <DossierFooter currentPage={impositionPage} totalPages={totalPages} />
      </DossierPage>

      {/* ─── Justificatif d'hébergement ─── */}
      <DossierPage>
        <DossierHeader
          prenom={dossier.prenom}
          nom={dossier.nom}
          sectionLabel="Hébergement actuel"
        />
        <div style={{ padding: '40px 36px', flex: 1 }}>
          <DossierSection title="Le justificatif d'hébergement actuel">
            {dossier.justificatifHebergementUrls && dossier.justificatifHebergementUrls.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dossier.justificatifHebergementUrls.map((url, i) => (
                  <DossierDocumentView
                    key={i}
                    url={url}
                    label={`Justificatif d'hébergement ${i + 1}`}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              <DossierDocumentView
                label="Quittance de loyer, taxe foncière ou facture d'énergie"
                loading={loading}
              />
            )}
          </DossierSection>
        </div>
        <DossierFooter currentPage={hebergementPage} totalPages={totalPages} />
      </DossierPage>

      {/* ─── Attestation garant (optionnelle) ─── */}
      {dossier.typeGarant !== 'aucun' && (
        <DossierPage>
          <DossierHeader
            prenom={dossier.prenom}
            nom={dossier.nom}
            sectionLabel="Garant"
          />
          <div style={{ padding: '40px 36px', flex: 1 }}>
            <DossierSection title="L'attestation du garant">
              {dossier.nomOrganismeGarant && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#EDE0CF',
                    border: '1px solid #D4B896',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B3F26', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Organisme : {dossier.nomOrganismeGarant}
                  </span>
                </div>
              )}
              <DossierDocumentView
                url={dossier.attestationGarantUrl}
                label="Attestation du garant ou engagement de caution"
                loading={loading}
              />
            </DossierSection>
          </div>
          <DossierFooter currentPage={garantPage} totalPages={totalPages} />
        </DossierPage>
      )}
    </div>
  )
}
