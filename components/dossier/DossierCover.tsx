// Page de couverture du dossier : illustration, titre, tableau récap, table des matières

import type { DossierLocataire } from '@/types/dossier'
import DossierSummaryTable from './DossierSummaryTable'
import DossierFooter from './DossierFooter'

interface DossierCoverProps {
  dossier: DossierLocataire
  totalPages: number
  tableOfContents: { label: string; page: number }[]
}

// Illustration SVG ville/immobilier aux couleurs Drify
function CityIllustration() {
  return (
    <svg
      viewBox="0 0 730 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', display: 'block' }}
    >
      {/* Ciel — dégradé subtil */}
      <rect width="730" height="160" fill="#F7F2EA" />

      {/* Soleil / lune */}
      <circle cx="620" cy="45" r="32" fill="#EDE0CF" />
      <circle cx="634" cy="35" r="26" fill="#F7F2EA" />

      {/* Bâtiment fond — gauche */}
      <rect x="0" y="70" width="55" height="90" rx="3" fill="#D4B896" />
      <rect x="8" y="80" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="24" y="80" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="40" y="80" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="8" y="100" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="24" y="100" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="40" y="100" width="10" height="12" rx="1" fill="#A0673A" opacity="0.5" />

      {/* Tour principale gauche */}
      <rect x="50" y="30" width="80" height="130" rx="4" fill="#6B3F26" />
      <rect x="58" y="42" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="78" y="42" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="98" y="42" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="58" y="66" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="78" y="66" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.5" />
      <rect x="98" y="66" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.9" />
      <rect x="58" y="90" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.4" />
      <rect x="78" y="90" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="98" y="90" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.6" />
      <rect x="58" y="114" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="78" y="114" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.3" />
      <rect x="98" y="114" width="14" height="16" rx="2" fill="#EDE0CF" opacity="0.8" />
      <rect x="73" y="138" width="24" height="22" rx="2" fill="#3B2314" opacity="0.6" />

      {/* Bâtiment milieu-gauche */}
      <rect x="140" y="55" width="95" height="105" rx="4" fill="#A0673A" />
      <rect x="150" y="65" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.6" />
      <rect x="168" y="65" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.8" />
      <rect x="186" y="65" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.5" />
      <rect x="204" y="65" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="150" y="87" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="168" y="87" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.4" />
      <rect x="186" y="87" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.8" />
      <rect x="204" y="87" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.6" />
      <rect x="150" y="109" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.5" />
      <rect x="168" y="109" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="186" y="109" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.3" />
      <rect x="204" y="109" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.9" />
      <rect x="158" y="138" width="20" height="22" rx="2" fill="#3B2314" opacity="0.5" />

      {/* Immeuble haussmannien central (plus haut) */}
      <rect x="248" y="18" width="110" height="142" rx="4" fill="#3B2314" />
      <rect x="258" y="30" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.6" />
      <rect x="280" y="30" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.8" />
      <rect x="302" y="30" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.5" />
      <rect x="324" y="30" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="258" y="58" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="280" y="58" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.4" />
      <rect x="302" y="58" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.9" />
      <rect x="324" y="58" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.6" />
      <rect x="258" y="86" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.5" />
      <rect x="280" y="86" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.8" />
      <rect x="302" y="86" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.3" />
      <rect x="324" y="86" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="258" y="114" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.7" />
      <rect x="280" y="114" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.5" />
      <rect x="302" y="114" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.8" />
      <rect x="324" y="114" width="16" height="20" rx="2" fill="#EDE0CF" opacity="0.4" />
      <rect x="287" y="140" width="32" height="20" rx="2" fill="#6B3F26" opacity="0.8" />

      {/* Bâtiment milieu-droite */}
      <rect x="368" y="50" width="88" height="110" rx="4" fill="#D4B896" />
      <rect x="378" y="62" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.5" />
      <rect x="398" y="62" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.7" />
      <rect x="418" y="62" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.4" />
      <rect x="432" y="62" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.6" />
      <rect x="378" y="86" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.7" />
      <rect x="398" y="86" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.3" />
      <rect x="418" y="86" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.8" />
      <rect x="432" y="86" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.5" />
      <rect x="378" y="110" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.4" />
      <rect x="398" y="110" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.7" />
      <rect x="418" y="110" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.6" />
      <rect x="432" y="110" width="14" height="16" rx="1" fill="#6B3F26" opacity="0.9" />
      <rect x="390" y="138" width="22" height="22" rx="2" fill="#3B2314" opacity="0.4" />

      {/* Tour droite */}
      <rect x="466" y="38" width="75" height="122" rx="4" fill="#6B3F26" opacity="0.8" />
      <rect x="476" y="50" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.7" />
      <rect x="494" y="50" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.5" />
      <rect x="512" y="50" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.8" />
      <rect x="476" y="72" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.4" />
      <rect x="494" y="72" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.7" />
      <rect x="512" y="72" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.6" />
      <rect x="476" y="94" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.8" />
      <rect x="494" y="94" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.3" />
      <rect x="512" y="94" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.7" />
      <rect x="476" y="116" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.5" />
      <rect x="494" y="116" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.9" />
      <rect x="512" y="116" width="12" height="14" rx="1" fill="#EDE0CF" opacity="0.4" />
      <rect x="490" y="138" width="20" height="22" rx="2" fill="#3B2314" opacity="0.5" />

      {/* Bâtiment fond — droite */}
      <rect x="550" y="65" width="75" height="95" rx="3" fill="#D4B896" opacity="0.7" />
      <rect x="560" y="75" width="12" height="14" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="578" y="75" width="12" height="14" rx="1" fill="#A0673A" opacity="0.4" />
      <rect x="596" y="75" width="12" height="14" rx="1" fill="#A0673A" opacity="0.6" />
      <rect x="560" y="97" width="12" height="14" rx="1" fill="#A0673A" opacity="0.4" />
      <rect x="578" y="97" width="12" height="14" rx="1" fill="#A0673A" opacity="0.6" />
      <rect x="596" y="97" width="12" height="14" rx="1" fill="#A0673A" opacity="0.3" />
      <rect x="560" y="119" width="12" height="14" rx="1" fill="#A0673A" opacity="0.5" />
      <rect x="578" y="119" width="12" height="14" rx="1" fill="#A0673A" opacity="0.4" />
      <rect x="596" y="119" width="12" height="14" rx="1" fill="#A0673A" opacity="0.6" />

      {/* Bâtiment extrême droite */}
      <rect x="635" y="55" width="95" height="105" rx="3" fill="#A0673A" opacity="0.6" />
      <rect x="645" y="67" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.6" />
      <rect x="663" y="67" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.4" />
      <rect x="681" y="67" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="699" y="67" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.5" />
      <rect x="645" y="89" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.5" />
      <rect x="663" y="89" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="681" y="89" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.3" />
      <rect x="699" y="89" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.6" />
      <rect x="645" y="111" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.7" />
      <rect x="663" y="111" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.4" />
      <rect x="681" y="111" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.8" />
      <rect x="699" y="111" width="12" height="14" rx="1" fill="#F7F2EA" opacity="0.5" />

      {/* Sol */}
      <rect x="0" y="155" width="730" height="5" rx="0" fill="#D4B896" opacity="0.6" />
    </svg>
  )
}

export default function DossierCover({ dossier, totalPages, tableOfContents }: DossierCoverProps) {
  return (
    <>
      {/* Logo en haut */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '24px 36px 0',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            background: '#3B2314',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: '#F7F2EA',
              fontWeight: 800,
              fontSize: '15px',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            D
          </span>
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: '18px',
            color: '#3B2314',
            letterSpacing: '-0.03em',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          drify
        </span>
      </div>

      {/* Illustration ville */}
      <div style={{ marginTop: '20px', overflow: 'hidden' }}>
        <CityIllustration />
      </div>

      {/* Contenu principal */}
      <div style={{ padding: '28px 36px', flex: 1 }}>

        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#A0673A',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Dossier de location
          </p>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 700,
              color: '#3B2314',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Le dossier de location<br />
            de {dossier.prenom} {dossier.nom}
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: '#8A7068',
              marginTop: '10px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {dossier.email} · Né(e) le {dossier.dateNaissance} à {dossier.lieuNaissance} · {dossier.nationalite}
          </p>
        </div>

        {/* Tableau récapitulatif */}
        <div style={{ marginBottom: '28px' }}>
          <DossierSummaryTable dossier={dossier} />
        </div>

        {/* Table des matières */}
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6B3F26',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Pièces fournies
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              background: '#D4B896',
              border: '1px solid #D4B896',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {tableOfContents.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: i % 2 === 0 ? '#FFFFFF' : '#F7F2EA',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Numéro d'ordre */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      background: '#EDE0CF',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#6B3F26',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#3B2314',
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#A0673A',
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  p. {item.page}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DossierFooter currentPage={1} totalPages={totalPages} />
    </>
  )
}
