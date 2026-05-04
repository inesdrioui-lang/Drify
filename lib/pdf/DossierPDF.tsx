import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { DossierTemplateData, DossierDocument } from './dossier-template'

// Helvetica est intégrée à tout lecteur PDF — aucun téléchargement réseau nécessaire.
// Idéal pour Vercel et les environnements sans accès aux fonts externes.
const FONT = 'Helvetica'

// ── Couleurs Drify ────────────────────────────────────────────────────────
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
  error:      '#9B3A2A',
}

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: FONT,
    fontSize: 10,
    color: C.textDark,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },

  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: C.beigeLight,
    borderBottomWidth: 1,
    borderBottomColor: C.beigeDark,
  },
  headerLeft: { flexDirection: 'column' },
  headerLogo: { fontSize: 15, fontWeight: 700, color: C.brownDark },
  headerSub: { fontSize: 9, color: C.brownLight, marginTop: 1 },
  headerRight: { fontSize: 9, color: C.textMuted, textAlign: 'right' },

  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.beigeDark,
    backgroundColor: C.white,
  },
  footerText: { fontSize: 7, color: C.textMuted, flex: 1 },
  footerPage: { fontSize: 7, color: C.brownLight, fontWeight: 700 },

  // ── Couverture ──────────────────────────────────────────────────────────
  coverTopBand: {
    backgroundColor: C.brownDark,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 28,
  },
  coverLogo: { fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: 1 },
  coverTagline: { fontSize: 9, color: C.beige, marginTop: 3 },

  coverBody: { paddingHorizontal: 32, paddingTop: 22, paddingBottom: 60 },

  coverIntro: { fontSize: 9, color: C.brownLight, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 },
  coverName: { fontSize: 28, fontWeight: 700, color: C.brownDark, letterSpacing: -0.5, lineHeight: 1.15 },
  coverEmail: { fontSize: 10, color: C.textMuted, marginTop: 5, marginBottom: 22 },

  // Tableau 3 colonnes récap
  recapRow: { flexDirection: 'row', marginBottom: 24 },
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
  recapLabel: { fontSize: 7, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 },
  recapValue: { fontSize: 14, fontWeight: 700, color: C.brownDark, lineHeight: 1.2 },
  recapSub: { fontSize: 8, color: C.textMuted, marginTop: 2 },

  // Table des matières
  tocTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: C.brown,
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.beigeDark,
  },
  tocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.beigeLight,
  },
  tocLeft: { flexDirection: 'row', alignItems: 'center' },
  tocBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.beige,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tocBadgeText: { fontSize: 7, fontWeight: 700, color: C.brown },
  tocLabel: { fontSize: 9, color: C.textMuted },
  tocStatus: { flexDirection: 'row', alignItems: 'center' },
  tocDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  tocStatusText: { fontSize: 8, fontWeight: 700 },
  tocDate: { fontSize: 9, color: C.textMuted, textAlign: 'right', marginTop: 14 },

  coverLegal: {
    fontSize: 7,
    color: C.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.beigeDark,
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
  },

  // ── Page de section ─────────────────────────────────────────────────────
  sectionBand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: C.beige,
    borderBottomWidth: 2,
    borderBottomColor: C.beigeDark,
  },
  sectionAccent: {
    width: 3,
    height: 20,
    backgroundColor: C.brownMid,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: C.brownDark },
  sectionName: { fontSize: 9, color: C.brownLight, marginTop: 2 },

  // Image document
  docBody: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 70 },
  docImage: {
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.beigeDark,
    objectFit: 'contain',
  },
  docPlaceholder: {
    width: '100%',
    height: 360,
    backgroundColor: C.beigeLight,
    borderWidth: 2,
    borderColor: C.beigeDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPlaceholderText: { fontSize: 12, fontWeight: 700, color: C.brownMid, marginTop: 12 },
  docPlaceholderSub: { fontSize: 9, color: C.textMuted, marginTop: 4 },

  // ── Mot du locataire ────────────────────────────────────────────────────
  motBody: { paddingHorizontal: 32, paddingTop: 24, paddingBottom: 70 },
  motCard: {
    backgroundColor: C.beigeLight,
    borderWidth: 1,
    borderColor: C.beigeDark,
    borderRadius: 10,
    padding: 24,
  },
  motQuote: {
    fontSize: 36,
    color: C.beigeDark,
    lineHeight: 0.8,
    marginBottom: 8,
  },
  motText: {
    fontSize: 12,
    color: C.brownDark,
    lineHeight: 1.7,
  },
  motDivider: {
    height: 1,
    backgroundColor: C.beigeDark,
    marginTop: 16,
    marginBottom: 12,
  },
  motAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  motAvatarText: { fontSize: 12, fontWeight: 700, color: C.beigeLight },
  motSignature: { flexDirection: 'row', alignItems: 'center' },
  motSigName: { fontSize: 12, fontWeight: 700, color: C.brownDark },
  motSigRole: { fontSize: 9, color: C.textMuted, marginTop: 2 },
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
      <View style={s.headerLeft}>
        <Text style={s.headerLogo}>Drify</Text>
        <Text style={s.headerSub}>
          {prenom} {nom}
        </Text>
      </View>
      <Text style={s.headerRight}>{section}</Text>
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
      <Text style={s.footerText}>
        Dossier généré par Drify · drify.fr · Réf. {reference} · Le service fourni par
        Drify ne constitue pas une garantie sur les dossiers.
      </Text>
      <Text style={s.footerPage}>
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
  const imgSrc = doc.data_url ?? (doc.mime_type?.startsWith('image/') ? doc.url : undefined)

  return (
    <Page size="A4" style={s.page}>
      <PageHeader prenom={prenom} nom={nom} section={doc.label} />

      <View style={s.sectionBand}>
        <View style={s.sectionAccent} />
        <View>
          <Text style={s.sectionTitle}>{doc.label}</Text>
          <Text style={s.sectionName}>
            {prenom} {nom}
          </Text>
        </View>
      </View>

      <View style={s.docBody}>
        {imgSrc ? (
          <Image src={imgSrc} style={s.docImage} />
        ) : (
          <View style={s.docPlaceholder}>
            <Text style={s.docPlaceholderText}>Document non fourni</Text>
            <Text style={s.docPlaceholderSub}>{doc.label}</Text>
          </View>
        )}
      </View>

      <PageFooter reference={data.dossier.reference} current={pageNum} total={totalPages} />
    </Page>
  )
}

// ── Document principal ────────────────────────────────────────────────────

interface DossierPDFProps {
  data: DossierTemplateData
}

export function DossierPDF({ data }: DossierPDFProps) {
  const { candidat, dossier, documents } = data
  const { prenom, nom } = candidat

  const formatRevenu = (r: number) =>
    r ? `${r.toLocaleString('fr-FR')} €` : '—'

  const loyerMax = candidat.revenus_mensuels_nets
    ? `${Math.round(candidat.revenus_mensuels_nets / 3).toLocaleString('fr-FR')} €`
    : '—'

  const docsFournis = documents.filter((d) => d.statut === 'verifie')
  const totalPages = 1 + documents.length // couverture + 1 page par document

  const initials =
    (prenom.charAt(0) + nom.charAt(0)).toUpperCase()

  return (
    <Document
      title={`Dossier de location — ${prenom} ${nom}`}
      author="Drify"
      subject="Dossier locataire"
    >
      {/* ═══════════════════════ PAGE 1 — COUVERTURE ═══════════════════════ */}
      <Page size="A4" style={s.page}>
        {/* Bande sombre logo */}
        <View style={s.coverTopBand}>
          <Text style={s.coverLogo}>Drify</Text>
          <Text style={s.coverTagline}>La plateforme de location de confiance</Text>
        </View>

        <View style={s.coverBody}>
          <Text style={s.coverIntro}>LE DOSSIER DE LOCATION DE</Text>
          <Text style={s.coverName}>
            {prenom} {nom.toUpperCase()}
          </Text>
          <Text style={s.coverEmail}>{candidat.email}</Text>

          {/* Récap 3 colonnes */}
          <View style={s.recapRow}>
            <View style={s.recapCard}>
              <Text style={s.recapLabel}>TYPE DE DOSSIER</Text>
              <Text style={s.recapValue}>Dossier seul</Text>
              <Text style={s.recapSub}>{candidat.situation_professionnelle || '—'}</Text>
            </View>
            <View style={s.recapCard}>
              <Text style={s.recapLabel}>REVENUS MENSUELS NETS</Text>
              <Text style={s.recapValue}>{formatRevenu(candidat.revenus_mensuels_nets)}</Text>
              <Text style={s.recapSub}>Loyer max : {loyerMax}/mois</Text>
            </View>
            <View style={[s.recapCard, s.recapCardLast]}>
              <Text style={s.recapLabel}>GARANT(S)</Text>
              <Text style={s.recapValue}>{candidat.garant_label ?? 'Aucun'}</Text>
            </View>
          </View>

          {/* Table des matières */}
          <Text style={s.tocTitle}>
            LES PIÈCES JUSTIFICATIVES DE {prenom.toUpperCase()} {nom.toUpperCase()} · {candidat.email}
          </Text>

          {documents.map((doc, i) => {
            const fourni = doc.statut === 'verifie'
            return (
              <View key={i} style={s.tocRow}>
                <View style={s.tocLeft}>
                  <View style={s.tocBadge}>
                    <Text style={s.tocBadgeText}>{i + 2}</Text>
                  </View>
                  <Text style={s.tocLabel}>{doc.label}</Text>
                </View>
                <View style={s.tocStatus}>
                  <View
                    style={[
                      s.tocDot,
                      { backgroundColor: fourni ? C.success : C.brownLight },
                    ]}
                  />
                  <Text
                    style={[
                      s.tocStatusText,
                      { color: fourni ? C.success : C.brownLight },
                    ]}
                  >
                    {fourni ? 'Fourni' : 'Non fourni'}
                  </Text>
                </View>
              </View>
            )
          })}

          <Text style={s.tocDate}>Généré le {dossier.date_generation}</Text>
        </View>

        <Text style={s.coverLegal}>
          Le service fourni par Drify ne saurait être assimilé à une garantie sur les
          dossiers. Drify ne saurait être tenu responsable d'un litige entre locataire et
          bailleur.
        </Text>
      </Page>

      {/* ══════════════════ PAGES DOCUMENTS ══════════════════════════════ */}
      {documents.map((doc, i) => (
        <DocPage
          key={`doc-${i}`}
          data={data}
          doc={doc}
          pageNum={i + 2}
          totalPages={totalPages}
        />
      ))}
    </Document>
  )
}
