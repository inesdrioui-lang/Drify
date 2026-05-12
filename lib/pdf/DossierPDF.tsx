import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Rect,
} from '@react-pdf/renderer'
import type { DossierTemplateData, DossierDocument, GarantPDFData } from './dossier-template'

// Fonts intégrés — aucun réseau requis (Vercel-safe)
const FONT = 'Helvetica'
const FONT_BOLD = 'Helvetica-Bold'

// ── Palette Drify ─────────────────────────────────────────────────────────
const C = {
  brownDark:  '#3B2314',
  brown:      '#6B3F26',
  brownMid:   '#5C4433',
  brownLight: '#A0673A',
  beige:      '#EDE0CF',
  beigeLight: '#F7F2EA',
  beigeDark:  '#D4B896',
  white:      '#FFFFFF',
  textDark:   '#1A0F08',
  textMuted:  '#8A7068',
  success:    '#4A7C59',
}

// ── Logo mark — maison simplifiée (compatible react-pdf SVG) ──────────────
function DrifyMark({
  fill,
  door,
  size,
}: {
  fill: string
  door: string
  size: number
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Silhouette maison */}
      <Path d="M 12 2 L 22 10 L 22 22 L 2 22 L 2 10 Z" fill={fill} />
      {/* Porte */}
      <Rect x={8.5} y={15} width={7} height={7} rx={1} fill={door} />
    </Svg>
  )
}

// Logo complet : mark + wordmark
function DrifyLogo({
  fill,
  door,
  markSize,
  fontSize,
}: {
  fill: string
  door: string
  markSize: number
  fontSize: number
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <DrifyMark fill={fill} door={door} size={markSize} />
      <Text
        style={{
          fontFamily: FONT_BOLD,
          fontSize,
          color: fill,
          marginLeft: 5,
          letterSpacing: 0.3,
        }}
      >
        Drify
      </Text>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: FONT,
    fontSize: 10,
    color: C.textDark,
  },

  // En-tête pages document
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 11,
    backgroundColor: C.beigeLight,
    borderBottomWidth: 1,
    borderBottomColor: C.beigeDark,
  },
  headerRight: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.textMuted,
    textAlign: 'right',
  },

  // Pied de page fixe
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderTopWidth: 0.5,
    borderTopColor: C.beigeDark,
    backgroundColor: C.white,
  },
  footerLeft: { fontSize: 7, fontFamily: FONT, color: C.textMuted, flex: 1 },
  footerRight: { fontSize: 8, fontFamily: FONT_BOLD, color: C.brown },

  // ── Couverture ──────────────────────────────────────────────────────────
  coverBand: {
    backgroundColor: C.brownDark,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
  },
  coverTagline: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.beigeDark,
    marginTop: 5,
    letterSpacing: 0.2,
  },

  coverBody: {
    paddingHorizontal: 32,
    paddingTop: 26,
    paddingBottom: 80,
  },

  coverPretitle: {
    fontSize: 8,
    fontFamily: FONT_BOLD,
    color: C.brownLight,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: FONT_BOLD,
    color: C.brownDark,
    letterSpacing: -0.3,
    lineHeight: 1.15,
    marginBottom: 4,
  },
  coverMeta: {
    fontSize: 9,
    fontFamily: FONT,
    color: C.textMuted,
    marginBottom: 24,
    lineHeight: 1.5,
  },

  // Cartes récap 3 colonnes
  recapRow: { flexDirection: 'row', marginBottom: 16 },
  recapCard: {
    flex: 1,
    backgroundColor: C.beigeLight,
    borderWidth: 1,
    borderColor: C.beigeDark,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  recapCardLast: { marginRight: 0 },
  recapLabel: {
    fontSize: 6.5,
    fontFamily: FONT_BOLD,
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  recapValue: {
    fontSize: 15,
    fontFamily: FONT_BOLD,
    color: C.brownDark,
    lineHeight: 1.2,
    marginBottom: 3,
  },
  recapSub: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.textMuted,
  },

  // Loyer max recommandé
  loyerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.beigeLight,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.brown,
    paddingLeft: 14,
    paddingRight: 14,
    paddingVertical: 11,
    marginBottom: 22,
  },
  loyerLeft: { flex: 1 },
  loyerLabel: {
    fontSize: 7,
    fontFamily: FONT_BOLD,
    color: C.textMuted,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  loyerAmount: {
    fontSize: 22,
    fontFamily: FONT_BOLD,
    color: C.brownDark,
    lineHeight: 1.1,
  },
  loyerSub: {
    fontSize: 7.5,
    fontFamily: FONT,
    color: C.textMuted,
    marginTop: 2,
  },
  loyerBadge: {
    backgroundColor: C.beige,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  loyerBadgeText: {
    fontSize: 8,
    fontFamily: FONT_BOLD,
    color: C.brown,
  },

  // Table des matières
  tocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tocTitle: {
    fontSize: 7.5,
    fontFamily: FONT_BOLD,
    color: C.brownMid,
    letterSpacing: 0.8,
  },
  tocRule: {
    flex: 1,
    height: 0.5,
    backgroundColor: C.beigeDark,
    marginLeft: 8,
  },
  tocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.beigeLight,
  },
  tocLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tocDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  tocLabel: { fontSize: 9, fontFamily: FONT, color: C.textDark, flex: 1 },
  tocPage: {
    fontSize: 8,
    fontFamily: FONT_BOLD,
    color: C.brownMid,
    marginLeft: 8,
  },

  // Pied de page couverture
  coverFooter: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 7,
    fontFamily: FONT,
    color: C.textMuted,
    flex: 1,
  },
  coverFooterRef: {
    fontSize: 7,
    fontFamily: FONT_BOLD,
    color: C.brownLight,
    marginLeft: 12,
  },

  // ── Bandeau de section (pages document) ─────────────────────────────────
  sectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.beige,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.beigeDark,
    marginBottom: 22,
  },
  sectionAccent: {
    width: 3,
    height: 26,
    backgroundColor: C.brownMid,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONT_BOLD,
    color: C.brownDark,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.brownLight,
  },

  // Bandeau section garant
  garantBand: {
    backgroundColor: C.brownDark,
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  garantBandTitle: {
    fontSize: 16,
    fontFamily: FONT_BOLD,
    color: C.white,
    marginBottom: 3,
  },
  garantBandSub: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.beigeDark,
  },
  garantBandTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  garantBandTagText: {
    fontSize: 8,
    fontFamily: FONT_BOLD,
    color: C.white,
  },
  garantInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 8,
  },
  garantInfoCard: {
    flex: 1,
    backgroundColor: C.beigeLight,
    borderWidth: 1,
    borderColor: C.beigeDark,
    borderRadius: 8,
    padding: 12,
  },
  garantInfoLabel: {
    fontSize: 6.5,
    fontFamily: FONT_BOLD,
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  garantInfoValue: {
    fontSize: 12,
    fontFamily: FONT_BOLD,
    color: C.brownDark,
  },
  garantInfoSub: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.textMuted,
    marginTop: 2,
  },
  garantTocHeader: {
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  garantTocTitle: {
    fontSize: 7.5,
    fontFamily: FONT_BOLD,
    color: C.brownMid,
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  // Corps document
  docBody: { paddingHorizontal: 28, paddingBottom: 72 },
  docImage: {
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.beigeDark,
    objectFit: 'contain',
  },
  docPlaceholder: {
    width: '100%',
    height: 340,
    backgroundColor: C.beigeLight,
    borderWidth: 1.5,
    borderColor: C.beigeDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPlaceholderTitle: {
    fontSize: 11,
    fontFamily: FONT_BOLD,
    color: C.brownMid,
    marginTop: 8,
    marginBottom: 4,
  },
  docPlaceholderSub: {
    fontSize: 8,
    fontFamily: FONT,
    color: C.textMuted,
  },
})

// ── Composants internes ───────────────────────────────────────────────────

function PageHeader({
  prenom,
  nom,
  section,
}: {
  prenom: string
  nom: string
  section: string
}) {
  return (
    <View style={s.header}>
      <DrifyLogo
        fill={C.brownDark}
        door={C.beigeLight}
        markSize={18}
        fontSize={13}
      />
      <Text style={s.headerRight}>
        {prenom} {nom} · {section}
      </Text>
    </View>
  )
}

function PageFooter({
  reference,
  current,
  total,
}: {
  reference: string
  current: number
  total: number
}) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>
        Drify · drify.fr · Réf. {reference} · Ce dossier ne constitue pas une garantie locative.
      </Text>
      <Text style={s.footerRight}>
        {current} / {total}
      </Text>
    </View>
  )
}

function DocPage({
  data,
  doc,
  pageNum,
  totalPages,
}: {
  data: DossierTemplateData
  doc: DossierDocument
  pageNum: number
  totalPages: number
}) {
  const { prenom, nom } = data.candidat
  const imgSrc = doc.data_url?.startsWith('data:') ? doc.data_url : undefined

  return (
    <Page size="A4" style={s.page}>
      <PageHeader prenom={prenom} nom={nom} section={doc.label} />

      <View style={s.sectionBanner}>
        <View style={s.sectionAccent} />
        <View>
          <Text style={s.sectionTitle}>{doc.label}</Text>
          <Text style={s.sectionSubtitle}>
            {prenom} {nom}
          </Text>
        </View>
      </View>

      <View style={s.docBody}>
        {imgSrc ? (
          <Image src={imgSrc} style={s.docImage} />
        ) : doc.statut === 'verifie' ? (
          <View style={s.docPlaceholder}>
            <Text style={s.docPlaceholderTitle}>Impossible d'afficher ce document</Text>
            <Text style={s.docPlaceholderSub}>Format non supporté (JPG ou PNG requis)</Text>
          </View>
        ) : (
          <View style={s.docPlaceholder}>
            <Text style={s.docPlaceholderTitle}>Document non fourni</Text>
            <Text style={s.docPlaceholderSub}>{doc.label}</Text>
          </View>
        )}
      </View>

      <PageFooter reference={data.dossier.reference} current={pageNum} total={totalPages} />
    </Page>
  )
}

// ── Page d'intro de section garant ───────────────────────────────────────

function GarantSectionPage({
  garant,
  locatairePrenom,
  locataireNom,
  pageNum,
  totalPages,
  reference,
}: {
  garant: GarantPDFData
  locatairePrenom: string
  locataireNom: string
  pageNum: number
  totalPages: number
  reference: string
}) {
  const formatMoney = (n: number) =>
    Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'

  const loyerMax = garant.revenus_mensuels_nets
    ? formatMoney(Math.round(garant.revenus_mensuels_nets / 3))
    : null

  return (
    <Page size="A4" style={s.page}>
      {/* Bande marron */}
      <View style={s.garantBand}>
        <View>
          <Text style={s.garantBandTitle}>
            {garant.prenom} {garant.nom.toUpperCase()}
          </Text>
          <Text style={s.garantBandSub}>
            Garant{garant.lien ? ` · ${garant.lien}` : ''} de {locatairePrenom} {locataireNom}
          </Text>
        </View>
        <View style={s.garantBandTag}>
          <Text style={s.garantBandTagText}>GARANT</Text>
        </View>
      </View>

      {/* Cartes récap */}
      <View style={s.garantInfoRow}>
        <View style={s.garantInfoCard}>
          <Text style={s.garantInfoLabel}>SITUATION PROFESSIONNELLE</Text>
          <Text style={s.garantInfoValue}>{garant.situation_professionnelle || '—'}</Text>
        </View>
        <View style={s.garantInfoCard}>
          <Text style={s.garantInfoLabel}>REVENUS MENSUELS NETS</Text>
          <Text style={s.garantInfoValue}>
            {garant.revenus_mensuels_nets ? formatMoney(garant.revenus_mensuels_nets) : '—'}
          </Text>
          {loyerMax && (
            <Text style={s.garantInfoSub}>Loyer max : {loyerMax} / mois</Text>
          )}
        </View>
        <View style={s.garantInfoCard}>
          <Text style={s.garantInfoLabel}>PIÈCES FOURNIES</Text>
          <Text style={s.garantInfoValue}>{garant.documents.length}</Text>
          <Text style={s.garantInfoSub}>document{garant.documents.length > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Liste des pièces */}
      <View style={s.garantTocHeader}>
        <Text style={s.garantTocTitle}>PIÈCES JUSTIFICATIVES DU GARANT</Text>
        {garant.documents.map((doc, i) => (
          <View key={i} style={s.tocRow}>
            <View style={s.tocLeft}>
              <View style={[s.tocDot, { backgroundColor: C.success }]} />
              <Text style={s.tocLabel}>{doc.label}</Text>
            </View>
            <Text style={s.tocPage}>p.{pageNum + 1 + i}</Text>
          </View>
        ))}
        {garant.documents.length === 0 && (
          <Text style={{ fontSize: 9, fontFamily: FONT, color: C.textMuted, marginTop: 6 }}>
            Aucun document déposé pour ce garant.
          </Text>
        )}
      </View>

      <PageFooter reference={reference} current={pageNum} total={totalPages} />
    </Page>
  )
}

// ── Page document garant ──────────────────────────────────────────────────

function GarantDocPage({
  garant,
  locatairePrenom,
  locataireNom,
  doc,
  pageNum,
  totalPages,
  reference,
}: {
  garant: GarantPDFData
  locatairePrenom: string
  locataireNom: string
  doc: DossierDocument
  pageNum: number
  totalPages: number
  reference: string
}) {
  const imgSrc = doc.data_url?.startsWith('data:') ? doc.data_url : undefined

  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <DrifyLogo fill={C.brownDark} door={C.beigeLight} markSize={18} fontSize={13} />
        <Text style={s.headerRight}>
          {garant.prenom} {garant.nom} · Garant de {locatairePrenom} {locataireNom}
        </Text>
      </View>

      <View style={s.sectionBanner}>
        <View style={s.sectionAccent} />
        <View>
          <Text style={s.sectionTitle}>{doc.label}</Text>
          <Text style={s.sectionSubtitle}>
            {garant.prenom} {garant.nom} — garant
          </Text>
        </View>
      </View>

      <View style={s.docBody}>
        {imgSrc ? (
          <Image src={imgSrc} style={s.docImage} />
        ) : (
          <View style={s.docPlaceholder}>
            <Text style={s.docPlaceholderTitle}>Impossible d'afficher ce document</Text>
            <Text style={s.docPlaceholderSub}>Format non supporté (JPG ou PNG requis)</Text>
          </View>
        )}
      </View>

      <PageFooter reference={reference} current={pageNum} total={totalPages} />
    </Page>
  )
}

// ── Document principal ────────────────────────────────────────────────────

export function DossierPDF({ data }: { data: DossierTemplateData }) {
  const { candidat, dossier, documents } = data
  const { prenom, nom } = candidat

  const formatMoney = (n: number): string =>
    Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'

  const loyerMax = candidat.revenus_mensuels_nets
    ? formatMoney(Math.round(candidat.revenus_mensuels_nets / 3))
    : null

  // 1 couverture + docs locataire + pour chaque garant : 1 page intro + ses docs
  const garantPages = (data.garants ?? []).reduce(
    (acc, g) => acc + 1 + g.documents.length,
    0
  )
  const totalPages = 1 + documents.length + garantPages

  // Numéro de la première page garant (après couverture + docs locataire)
  let nextGarantPageNum = 2 + documents.length

  return (
    <Document
      title={`Dossier de location — ${prenom} ${nom}`}
      author="Drify"
      subject="Dossier locataire"
    >
      {/* ════════════════ PAGE 1 — COUVERTURE ════════════════ */}
      <Page size="A4" style={s.page}>
        {/* Bande de marque */}
        <View style={s.coverBand}>
          <DrifyLogo
            fill={C.white}
            door={C.brownDark}
            markSize={28}
            fontSize={21}
          />
          <Text style={s.coverTagline}>La plateforme de location de confiance</Text>
        </View>

        <View style={s.coverBody}>
          <Text style={s.coverPretitle}>LE DOSSIER DE LOCATION DE</Text>
          <Text style={s.coverTitle}>
            {prenom} {nom.toUpperCase()}
          </Text>
          <Text style={s.coverMeta}>
            {candidat.email}
            {candidat.adresse_actuelle ? `  ·  ${candidat.adresse_actuelle}` : ''}
          </Text>

          {/* Récap 3 colonnes */}
          <View style={s.recapRow}>
            <View style={s.recapCard}>
              <Text style={s.recapLabel}>TYPE DE DOSSIER</Text>
              <Text style={s.recapValue}>Seul</Text>
              <Text style={s.recapSub}>{candidat.situation_professionnelle || '—'}</Text>
            </View>
            <View style={s.recapCard}>
              <Text style={s.recapLabel}>REVENUS MENSUELS</Text>
              <Text style={s.recapValue}>
                {candidat.revenus_mensuels_nets
                  ? formatMoney(candidat.revenus_mensuels_nets)
                  : '—'}
              </Text>
              <Text style={s.recapSub}>nets / mois</Text>
            </View>
            <View style={[s.recapCard, s.recapCardLast]}>
              <Text style={s.recapLabel}>GARANT(S)</Text>
              <Text style={s.recapValue}>{candidat.garant_label ?? 'Aucun'}</Text>
            </View>
          </View>

          {/* Loyer max recommandé */}
          {loyerMax && (
            <View style={s.loyerBox}>
              <View style={s.loyerLeft}>
                <Text style={s.loyerLabel}>LOYER MAXIMUM RECOMMANDÉ</Text>
                <Text style={s.loyerAmount}>{loyerMax} / mois</Text>
                <Text style={s.loyerSub}>Taux d'effort 33 % — revenus nets ÷ 3</Text>
              </View>
              <View style={s.loyerBadge}>
                <Text style={s.loyerBadgeText}>Règle 1/3</Text>
              </View>
            </View>
          )}

          {/* Table des matières */}
          <View style={s.tocHeader}>
            <Text style={s.tocTitle}>PIÈCES JUSTIFICATIVES</Text>
            <View style={s.tocRule} />
          </View>

          {documents.map((doc, i) => {
            const fourni = doc.statut === 'verifie'
            return (
              <View key={i} style={s.tocRow}>
                <View style={s.tocLeft}>
                  <View
                    style={[
                      s.tocDot,
                      { backgroundColor: fourni ? C.success : C.beigeDark },
                    ]}
                  />
                  <Text style={s.tocLabel}>{doc.label}</Text>
                </View>
                <Text style={s.tocPage}>p.{i + 2}</Text>
              </View>
            )
          })}
        </View>

        {/* Pied de page couverture */}
        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>
            Le service fourni par Drify ne constitue pas une garantie sur les dossiers.
          </Text>
          <Text style={s.coverFooterRef}>
            Réf. {dossier.reference} · {dossier.date_generation}
          </Text>
        </View>
      </Page>

      {/* ════════════════ PAGES DOCUMENTS LOCATAIRE ════════════════ */}
      {documents.map((doc, i) => (
        <DocPage
          key={`doc-${i}`}
          data={data}
          doc={doc}
          pageNum={i + 2}
          totalPages={totalPages}
        />
      ))}

      {/* ════════════════ SECTIONS GARANTS ════════════════ */}
      {(data.garants ?? []).map((garant, gi) => {
        const sectionPage = nextGarantPageNum
        nextGarantPageNum += 1 + garant.documents.length

        return (
          <React.Fragment key={`garant-${gi}`}>
            <GarantSectionPage
              garant={garant}
              locatairePrenom={prenom}
              locataireNom={nom}
              pageNum={sectionPage}
              totalPages={totalPages}
              reference={dossier.reference}
            />
            {garant.documents.map((doc, di) => (
              <GarantDocPage
                key={`garant-${gi}-doc-${di}`}
                garant={garant}
                locatairePrenom={prenom}
                locataireNom={nom}
                doc={doc}
                pageNum={sectionPage + 1 + di}
                totalPages={totalPages}
                reference={dossier.reference}
              />
            ))}
          </React.Fragment>
        )
      })}
    </Document>
  )
}
