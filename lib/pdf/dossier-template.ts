// Template HTML pour la génération PDF du dossier locataire Drify
// Rendu par Puppeteer (headless Chrome) → format A4
// Inspiré de DossierFacile, aux couleurs Drify

export interface DossierTemplateData {
  candidat: {
    prenom: string
    nom: string
    email: string
    telephone: string
    adresse_actuelle: string
    situation_professionnelle: string
    revenus_mensuels_nets: number
    nom_employeur?: string
    date_entree_emploi?: string
  }
  dossier: {
    reference: string
    date_generation: string
    taux_effort?: number
    score_confiance?: number
  }
  documents: DossierDocument[]
}

export interface DossierDocument {
  type: DocumentType
  label: string
  statut: 'verifie' | 'non_fourni' | 'en_attente'
  url?: string
  data_url?: string  // PNG converti depuis un PDF par Puppeteer screenshot
  mime_type?: string
  page_index?: number
}

export type DocumentType =
  | 'piece_identite'
  | 'justificatif_domicile'
  | 'contrat_travail'
  | 'bulletin_salaire'
  | 'avis_imposition'
  | 'quittance_loyer'
  | 'statut_entreprise'
  | 'bilan_comptable'
  | 'autre'

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  piece_identite: "Pièce d'identité",
  justificatif_domicile: 'Justificatif de domicile',
  contrat_travail: 'Contrat de travail',
  bulletin_salaire: 'Bulletin de salaire',
  avis_imposition: "Avis d'imposition",
  quittance_loyer: 'Quittance de loyer',
  statut_entreprise: "Statut d'entreprise",
  bilan_comptable: 'Bilan comptable',
  autre: 'Document complémentaire',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

function statutLabel(s: DossierDocument['statut']) {
  if (s === 'verifie') return 'Fourni'
  if (s === 'non_fourni') return 'Non fourni'
  return 'En attente'
}

function statutDotColor(s: DossierDocument['statut']) {
  if (s === 'verifie') return '#4A7C59'
  if (s === 'non_fourni') return '#9B3A2A'
  return '#9B7226'
}

// Logo Drify minimaliste — rendu garanti dans Puppeteer headless
function logo(darkBg = false) {
  const textColor = darkBg ? '#F7F2EA' : '#3D2E22'
  const boxBg     = darkBg ? 'rgba(247,242,234,0.15)' : '#3D2E22'
  const boxColor  = darkBg ? '#F7F2EA' : '#F7F2EA'
  return `
    <div style="display:flex;align-items:center;gap:7px">
      <div style="width:26px;height:26px;background:${boxBg};border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:${boxColor};line-height:1">D</span>
      </div>
      <span style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;color:${textColor};letter-spacing:-0.03em">drify</span>
    </div>`
}

// En-tête commun à chaque page
function pageHeader(data: DossierTemplateData, sectionLabel = '') {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 32px;background:#F7F2EA;border-bottom:1px solid #D4B896;flex-shrink:0">
      ${logo(false)}
      <div style="text-align:right">
        <div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;color:#3D2E22">${data.candidat.prenom} ${data.candidat.nom}</div>
        ${sectionLabel ? `<div style="font-family:'DM Sans',sans-serif;font-size:9px;color:#96766A;margin-top:2px">${sectionLabel}</div>` : ''}
      </div>
    </div>`
}

// Pied de page commun
function pageFooter(ref: string, current: number, total: number) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 32px;border-top:1px solid #EAE3DA;background:#FDFCFA;margin-top:auto;flex-shrink:0">
      <span style="font-family:'DM Sans',sans-serif;font-size:9px;color:#96766A">Dossier généré par Drify · drify.fr · Réf. ${ref}</span>
      <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;color:#96766A">${current} / ${total}</span>
    </div>`
}

// ── Page de couverture ───────────────────────────────────────────────────────

function buildCoverPage(data: DossierTemplateData, totalPages: number): string {
  const { candidat, dossier, documents } = data
  const ini = initials(candidat.prenom, candidat.nom)
  const loyerMax = candidat.revenus_mensuels_nets
    ? Math.round(candidat.revenus_mensuels_nets / 3).toLocaleString('fr-FR')
    : '—'

  const infoItems = [
    { label: 'Revenus mensuels nets', value: candidat.revenus_mensuels_nets ? `${candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} €` : '—', sub: `Loyer max recommandé : ${loyerMax} €` },
    { label: 'Situation professionnelle', value: candidat.situation_professionnelle || '—', sub: candidat.nom_employeur ?? '' },
    { label: 'Email', value: candidat.email || '—', sub: '' },
    { label: 'Téléphone', value: candidat.telephone || '—', sub: '' },
    { label: 'Adresse actuelle', value: candidat.adresse_actuelle || '—', sub: '' },
    ...(dossier.taux_effort ? [{ label: "Taux d'effort estimé", value: `${dossier.taux_effort} %`, sub: 'sur le loyer cible' }] : []),
  ]

  const docsRows = documents.map((doc, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:${i % 2 === 0 ? '#FFFFFF' : '#F7F2EA'};border-bottom:1px solid #EAE3DA">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:7px;height:7px;border-radius:50%;background:${statutDotColor(doc.statut)};flex-shrink:0"></div>
        <span style="font-family:'DM Sans',sans-serif;font-size:11px;color:#1A0F08">${doc.label}</span>
      </div>
      <span style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;color:${statutDotColor(doc.statut)}">${statutLabel(doc.statut)}</span>
    </div>`).join('')

  return `
  <div class="page" style="display:flex;flex-direction:column">

    <!-- Bandeau supérieur foncé -->
    <div style="background:#3D2E22;padding:18px 32px 20px;flex-shrink:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        ${logo(true)}
        <span style="font-family:'DM Sans',sans-serif;font-size:9px;color:#D4B896;letter-spacing:0.04em">Généré le ${dossier.date_generation}</span>
      </div>

      <!-- Identité principale -->
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(160,103,58,0.35);border:1.5px solid rgba(212,184,150,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-family:Georgia,serif;font-size:17px;color:#F7F2EA;font-weight:700">${ini}</span>
        </div>
        <div>
          <div style="font-family:Georgia,serif;font-size:22px;color:#FFFFFF;letter-spacing:-0.01em;line-height:1.1">${candidat.prenom} ${candidat.nom.toUpperCase()}</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:#D4B896;margin-top:3px">${candidat.situation_professionnelle || 'Dossier de location'}${candidat.nom_employeur ? ` · ${candidat.nom_employeur}` : ''}</div>
        </div>
        ${dossier.score_confiance ? `
        <div style="margin-left:auto;text-align:center;background:rgba(255,255,255,0.07);border:1px solid rgba(212,184,150,0.25);border-radius:8px;padding:8px 14px">
          <div style="font-family:Georgia,serif;font-size:20px;color:#FFFFFF;font-weight:700">${dossier.score_confiance}</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:8px;color:#D4B896;letter-spacing:0.03em">SCORE /100</div>
        </div>` : ''}
      </div>
    </div>

    <!-- Corps -->
    <div style="padding:20px 32px 16px;flex:1">

      <!-- Grille infos -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#D4B896;border:1px solid #D4B896;border-radius:10px;overflow:hidden;margin-bottom:20px">
        ${infoItems.map((item, i) => `
        <div style="background:${i % 2 === 0 ? '#FFFFFF' : '#F7F2EA'};padding:12px 14px">
          <div style="font-family:'DM Sans',sans-serif;font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#96766A;margin-bottom:4px">${item.label}</div>
          <div style="font-family:Georgia,serif;font-size:${i === 0 ? '16px' : '12px'};color:#3D2E22;font-weight:${i === 0 ? '700' : '400'};line-height:1.3">${item.value}</div>
          ${item.sub ? `<div style="font-family:'DM Sans',sans-serif;font-size:9px;color:#96766A;margin-top:2px">${item.sub}</div>` : ''}
        </div>`).join('')}
      </div>

      <!-- Liste des documents -->
      <div style="margin-bottom:16px">
        <div style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#5C4433;margin-bottom:8px">Pièces du dossier</div>
        ${documents.length > 0 ? `
        <div style="border:1px solid #D4B896;border-radius:8px;overflow:hidden">
          <div style="display:flex;justify-content:space-between;padding:7px 14px;background:#3D2E22">
            <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#D4B896">Document</span>
            <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#D4B896">Statut</span>
          </div>
          ${docsRows}
        </div>` : `
        <div style="border:1px dashed #D4B896;border-radius:8px;padding:16px;text-align:center">
          <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#96766A">Aucun document déposé</div>
        </div>`}
      </div>

    </div>

    ${pageFooter(dossier.reference, 1, totalPages)}
  </div>`
}

// ── Page justificatif ────────────────────────────────────────────────────────

function buildDocPage(
  data: DossierTemplateData,
  doc: DossierDocument,
  pageNum: number,
  totalPages: number
): string {
  const imgSrc = doc.data_url ?? (doc.mime_type?.startsWith('image/') ? doc.url : undefined)

  return `
  <div class="page" style="display:flex;flex-direction:column">
    ${pageHeader(data, doc.label)}

    <!-- Titre de section -->
    <div style="padding:20px 32px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <div style="width:3px;height:18px;background:#5C4433;border-radius:2px;flex-shrink:0"></div>
        <span style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#5C4433">${doc.label}</span>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:18px;color:#3D2E22;margin:0 0 16px 13px;font-weight:400;letter-spacing:-0.01em">
        ${doc.label} de ${data.candidat.prenom} ${data.candidat.nom}
      </h2>
    </div>

    <!-- Zone document -->
    <div style="flex:1;padding:0 32px;display:flex;align-items:center;justify-content:center">
      ${imgSrc ? `
      <div style="max-width:100%;max-height:640px;border:1px solid #D4B896;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(59,35,20,0.08)">
        <img src="${imgSrc}" alt="${doc.label}" style="display:block;max-width:100%;max-height:640px;object-fit:contain;background:#FDFCFA" />
      </div>` : `
      <div style="width:100%;height:400px;background:#F7F2EA;border:2px dashed #D4B896;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
        <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
          <rect x="2" y="2" width="32" height="40" rx="4" fill="#EDE0CF" stroke="#D4B896" stroke-width="1.5"/>
          <path d="M10 14h16M10 20h16M10 26h10" stroke="#96766A" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M28 2v10h14" stroke="#D4B896" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="34" cy="40" r="8" fill="#3D2E22"/>
          <path d="M31 40h6M34 37v6" stroke="#F7F2EA" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <div style="text-align:center">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#5C4433">${doc.statut === 'en_attente' ? 'Document en cours de vérification' : 'Document non fourni'}</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:#96766A;margin-top:4px">${doc.label}</div>
        </div>
      </div>`}
    </div>

    ${pageFooter(data.dossier.reference, pageNum, totalPages)}
  </div>`
}

// ── Assemblage final ─────────────────────────────────────────────────────────

export function generateDossierHTML(data: DossierTemplateData): string {
  // Toutes les pages de documents (avec ou sans URL)
  const docPages = data.documents

  const totalPages = 1 + docPages.length  // couverture + une page par document

  const coverHTML = buildCoverPage(data, totalPages)

  const docsHTML = docPages
    .map((doc, i) => buildDocPage(data, doc, i + 2, totalPages))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dossier de location — ${data.candidat.prenom} ${data.candidat.nom}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px;
      color: #1A0F08;
      background: #FDFCFA;
      width: 210mm;
    }

    /* Une page A4 = 210mm × 297mm */
    .page {
      width: 210mm;
      min-height: 297mm;
      background: #FFFFFF;
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }

    @media print {
      .page { page-break-after: always; }
      .page:last-child { page-break-after: avoid; }
    }
  </style>
</head>
<body>

${coverHTML}

${docsHTML}

</body>
</html>`
}
