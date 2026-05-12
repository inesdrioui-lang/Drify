// Template HTML pour la génération PDF du dossier locataire Drify
// Rendu par Puppeteer (headless Chrome) → format A4
// Inspiré de DossierFacile, aux couleurs Drify

export interface GarantPDFData {
  prenom: string
  nom: string
  lien?: string
  situation_professionnelle: string
  revenus_mensuels_nets: number
  documents: DossierDocument[]
}

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
    garant_label?: string
  }
  dossier: {
    reference: string
    date_generation: string
    taux_effort?: number
    score_confiance?: number
  }
  documents: DossierDocument[]
  garants?: GarantPDFData[]
}

export interface DossierDocument {
  type: DocumentType
  label: string
  statut: 'verifie' | 'non_fourni'
  url?: string
  data_url?: string  // PNG converti depuis un PDF par Puppeteer screenshot
  mime_type?: string
  page_index?: number
}

export type DocumentType =
  | 'identite'
  | 'piece_identite'
  | 'justificatif_domicile'
  | 'fiches_salaire'
  | 'contrat_travail'
  | 'bulletin_salaire'
  | 'avis_imposition'
  | 'certificat_scolarite'
  | 'carte_etudiant'
  | 'bourse'
  | 'kbis'
  | 'bilans'
  | 'pension'
  | 'allocations'
  | 'quittance_loyer'
  | 'statut_entreprise'
  | 'bilan_comptable'
  | 'autre'

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  identite: "Pièce d'identité",
  piece_identite: "Pièce d'identité",
  justificatif_domicile: 'Justificatif de domicile',
  fiches_salaire: 'Bulletins de salaire',
  contrat_travail: 'Contrat de travail',
  bulletin_salaire: 'Bulletin de salaire',
  avis_imposition: "Avis d'imposition",
  certificat_scolarite: 'Certificat de scolarité',
  carte_etudiant: 'Carte étudiante',
  bourse: 'Justificatif de bourse',
  kbis: 'Extrait Kbis / Statuts',
  bilans: 'Bilans comptables',
  pension: 'Justificatif de pension',
  allocations: "Justificatif d'allocations",
  quittance_loyer: 'Quittance de loyer',
  statut_entreprise: "Statut d'entreprise",
  bilan_comptable: 'Bilan comptable',
  autre: 'Document complémentaire',
}

// Types de documents attendus selon la situation professionnelle
export function getExpectedDocTypes(situationPro: string | null | undefined): string[] {
  const base = ['identite', 'piece_identite', 'justificatif_domicile', 'avis_imposition']
  switch (situationPro) {
    case 'etudiant':
      return [...base, 'certificat_scolarite', 'carte_etudiant', 'bourse']
    case 'salarie_cdi':
    case 'salarie_cdd':
    case 'fonctionnaire':
      return [...base, 'fiches_salaire', 'bulletin_salaire', 'contrat_travail']
    case 'independant':
      return [...base, 'kbis', 'statut_entreprise', 'bilans', 'bilan_comptable']
    case 'retraite':
      return [...base, 'pension']
    case 'sans_emploi':
      return [...base, 'allocations']
    default:
      return base
  }
}

// Titre humain pour chaque type de pièce — jamais de nom de fichier brut
export function getHumanDocTitle(
  type: DocumentType,
  prenom: string,
  index?: number
): string {
  const n = index !== undefined ? ` n°${index}` : ''
  switch (type) {
    case 'identite':
    case 'piece_identite':
      return `La pièce d'identité de ${prenom}`
    case 'justificatif_domicile':
      return `Le justificatif de domicile de ${prenom}`
    case 'fiches_salaire':
    case 'bulletin_salaire':
      return `Le bulletin de salaire${n} de ${prenom}`
    case 'avis_imposition':
      return `L'avis d'imposition${n} de ${prenom}`
    case 'contrat_travail':
      return `Le contrat de travail de ${prenom}`
    case 'quittance_loyer':
      return `La quittance de loyer${n} de ${prenom}`
    case 'kbis':
    case 'statut_entreprise':
      return `L'extrait Kbis de ${prenom}`
    case 'bilan_comptable':
    case 'bilans':
      return `Le bilan comptable${n} de ${prenom}`
    case 'pension':
      return `Le justificatif de pension de ${prenom}`
    case 'allocations':
      return `Le justificatif d'allocations de ${prenom}`
    case 'certificat_scolarite':
      return `Le certificat de scolarité de ${prenom}`
    case 'carte_etudiant':
      return `La carte étudiante de ${prenom}`
    case 'bourse':
      return `L'attestation de bourse de ${prenom}`
    default:
      return `Le justificatif de ressources de ${prenom}`
  }
}

// Ordre canonique des documents dans le PDF (inspiré DossierFacile)
export const DOCUMENT_SORT_ORDER: Record<string, number> = {
  identite: 0,
  piece_identite: 0,
  justificatif_domicile: 1,
  fiches_salaire: 2,
  bulletin_salaire: 2,
  certificat_scolarite: 2,
  bourse: 3,
  carte_etudiant: 3,
  kbis: 2,
  bilans: 3,
  pension: 2,
  allocations: 2,
  contrat_travail: 4,
  avis_imposition: 5,
  quittance_loyer: 6,
  statut_entreprise: 7,
  bilan_comptable: 8,
  autre: 9,
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

function statutLabel(s: DossierDocument['statut']) {
  return s === 'verifie' ? 'Fourni' : 'Non fourni'
}

function statutDotColor(s: DossierDocument['statut']) {
  return s === 'verifie' ? '#4A7C59' : '#A0673A'
}

// Logo Drify minimaliste — rendu garanti dans Puppeteer headless
function logo(darkBg = false) {
  const textColor = darkBg ? '#F7F2EA' : '#6B3F26'
  const boxBg     = darkBg ? 'rgba(247,242,234,0.15)' : '#3B2314'
  return `
    <div style="display:flex;align-items:center;gap:7px">
      <div style="width:26px;height:26px;background:${boxBg};border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-family:'DM Sans',sans-serif;font-size:14px;font-weight:800;color:#FFFFFF;line-height:1">D</span>
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

// ── SVG illustration ville ───────────────────────────────────────────────────

function cityIllustrationSVG(): string {
  return `<svg viewBox="0 0 730 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <rect width="730" height="130" fill="#F7F2EA"/>
  <circle cx="620" cy="38" r="28" fill="#EDE0CF"/>
  <circle cx="632" cy="29" r="22" fill="#F7F2EA"/>
  <rect x="0" y="60" width="50" height="70" rx="3" fill="#D4B896"/>
  <rect x="7" y="70" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="22" y="70" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="37" y="70" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="7" y="88" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="22" y="88" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="37" y="88" width="9" height="11" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="48" y="25" width="76" height="105" rx="4" fill="#6B3F26"/>
  <rect x="56" y="36" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="75" y="36" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="94" y="36" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="56" y="57" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.5"/>
  <rect x="75" y="57" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.8"/>
  <rect x="94" y="57" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.6"/>
  <rect x="56" y="78" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="75" y="78" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.4"/>
  <rect x="94" y="78" width="13" height="15" rx="2" fill="#EDE0CF" opacity="0.9"/>
  <rect x="68" y="108" width="22" height="22" rx="2" fill="#3B2314" opacity="0.6"/>
  <rect x="133" y="45" width="90" height="85" rx="4" fill="#A0673A"/>
  <rect x="143" y="55" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.6"/>
  <rect x="160" y="55" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.8"/>
  <rect x="177" y="55" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.5"/>
  <rect x="194" y="55" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.7"/>
  <rect x="143" y="75" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.7"/>
  <rect x="160" y="75" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.4"/>
  <rect x="177" y="75" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.8"/>
  <rect x="194" y="75" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.6"/>
  <rect x="151" y="108" width="18" height="22" rx="2" fill="#3B2314" opacity="0.5"/>
  <rect x="237" y="12" width="106" height="118" rx="4" fill="#3B2314"/>
  <rect x="248" y="24" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.6"/>
  <rect x="269" y="24" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.8"/>
  <rect x="290" y="24" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.5"/>
  <rect x="311" y="24" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="248" y="49" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="269" y="49" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.4"/>
  <rect x="290" y="49" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.9"/>
  <rect x="311" y="49" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.6"/>
  <rect x="248" y="74" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.5"/>
  <rect x="269" y="74" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.8"/>
  <rect x="290" y="74" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.3"/>
  <rect x="311" y="74" width="15" height="18" rx="2" fill="#EDE0CF" opacity="0.7"/>
  <rect x="276" y="108" width="30" height="22" rx="2" fill="#6B3F26" opacity="0.8"/>
  <rect x="357" y="40" width="84" height="90" rx="4" fill="#D4B896"/>
  <rect x="367" y="52" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.5"/>
  <rect x="386" y="52" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.7"/>
  <rect x="405" y="52" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.4"/>
  <rect x="420" y="52" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.6"/>
  <rect x="367" y="73" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.7"/>
  <rect x="386" y="73" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.3"/>
  <rect x="405" y="73" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.8"/>
  <rect x="420" y="73" width="13" height="14" rx="1" fill="#6B3F26" opacity="0.5"/>
  <rect x="378" y="108" width="20" height="22" rx="2" fill="#3B2314" opacity="0.4"/>
  <rect x="452" y="30" width="72" height="100" rx="4" fill="#6B3F26" opacity="0.8"/>
  <rect x="462" y="42" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.7"/>
  <rect x="479" y="42" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.5"/>
  <rect x="496" y="42" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.8"/>
  <rect x="462" y="62" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.4"/>
  <rect x="479" y="62" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.7"/>
  <rect x="496" y="62" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.6"/>
  <rect x="462" y="82" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.8"/>
  <rect x="479" y="82" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.3"/>
  <rect x="496" y="82" width="11" height="13" rx="1" fill="#EDE0CF" opacity="0.7"/>
  <rect x="475" y="108" width="18" height="22" rx="2" fill="#3B2314" opacity="0.5"/>
  <rect x="536" y="55" width="70" height="75" rx="3" fill="#D4B896" opacity="0.7"/>
  <rect x="546" y="65" width="11" height="13" rx="1" fill="#A0673A" opacity="0.5"/>
  <rect x="563" y="65" width="11" height="13" rx="1" fill="#A0673A" opacity="0.4"/>
  <rect x="580" y="65" width="11" height="13" rx="1" fill="#A0673A" opacity="0.6"/>
  <rect x="546" y="85" width="11" height="13" rx="1" fill="#A0673A" opacity="0.4"/>
  <rect x="563" y="85" width="11" height="13" rx="1" fill="#A0673A" opacity="0.6"/>
  <rect x="580" y="85" width="11" height="13" rx="1" fill="#A0673A" opacity="0.3"/>
  <rect x="622" y="45" width="90" height="85" rx="3" fill="#A0673A" opacity="0.6"/>
  <rect x="632" y="57" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.6"/>
  <rect x="649" y="57" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.4"/>
  <rect x="666" y="57" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.7"/>
  <rect x="683" y="57" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.5"/>
  <rect x="632" y="77" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.5"/>
  <rect x="649" y="77" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.7"/>
  <rect x="666" y="77" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.3"/>
  <rect x="683" y="77" width="11" height="13" rx="1" fill="#F7F2EA" opacity="0.6"/>
  <rect x="0" y="125" width="730" height="5" rx="0" fill="#D4B896" opacity="0.5"/>
</svg>`
}

// ── Page de couverture ───────────────────────────────────────────────────────

function buildCoverPage(data: DossierTemplateData, totalPages: number): string {
  const { candidat, dossier, documents } = data
  const loyerMax = candidat.revenus_mensuels_nets
    ? Math.round(candidat.revenus_mensuels_nets / 3).toLocaleString('fr-FR')
    : '—'

  const revenusStr = candidat.revenus_mensuels_nets
    ? `${candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} €`
    : '—'

  const docsRows = documents.map((doc, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:${i % 2 === 0 ? '#FFFFFF' : '#F7F2EA'}${i < documents.length - 1 ? ';border-bottom:1px solid #EDE0CF' : ''}">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:18px;height:18px;background:#EDE0CF;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-family:'DM Sans',sans-serif;font-size:8px;font-weight:700;color:#6B3F26">${i + 2}</span>
        </div>
        <span style="font-family:'DM Sans',sans-serif;font-size:11px;color:#1A0F08">${doc.label}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:6px;height:6px;border-radius:50%;background:${statutDotColor(doc.statut)};flex-shrink:0"></div>
        <span style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;color:${statutDotColor(doc.statut)}">${statutLabel(doc.statut)}</span>
      </div>
    </div>`).join('')

  return `
  <div class="page" style="display:flex;flex-direction:column;background:#FFFFFF">

    <!-- Header : logo gauche, date droite -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid #EDE0CF;flex-shrink:0">
      ${logo(false)}
      <span style="font-family:'DM Sans',sans-serif;font-size:9px;color:#8A7068">Généré le ${dossier.date_generation}</span>
    </div>

    <!-- Titre centré -->
    <div style="text-align:center;padding:22px 32px 0;flex-shrink:0">
      <p style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;color:#A0673A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px">Le dossier de location de</p>
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#3B2314;letter-spacing:-0.02em;margin:0;line-height:1.15">${candidat.prenom} ${candidat.nom.toUpperCase()}</h1>
      <p style="font-family:'DM Sans',sans-serif;font-size:10px;color:#8A7068;margin:6px 0 0">${candidat.email}</p>
    </div>

    <!-- Illustration ville -->
    <div style="margin:16px 32px;border-radius:10px;overflow:hidden;flex-shrink:0">
      ${cityIllustrationSVG()}
    </div>

    <!-- Tableau 3 colonnes -->
    <div style="margin:0 32px 16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#D4B896;border:1px solid #D4B896;border-radius:12px;overflow:hidden;flex-shrink:0">
      <div style="background:#EDE0CF;padding:14px 16px">
        <div style="font-family:'DM Sans',sans-serif;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6B3F26;margin-bottom:5px">Type de dossier</div>
        <div style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:#3B2314;line-height:1.2">Dossier seul</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:9px;color:#8A7068;margin-top:3px">${candidat.situation_professionnelle || '—'}</div>
      </div>
      <div style="background:#FFFFFF;padding:14px 16px">
        <div style="font-family:'DM Sans',sans-serif;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6B3F26;margin-bottom:5px">Revenus mensuels nets</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:18px;font-weight:800;color:#6B3F26;line-height:1.2">${revenusStr}</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:9px;color:#8A7068;margin-top:3px">Loyer max : ${loyerMax} €/mois</div>
      </div>
      <div style="background:#EDE0CF;padding:14px 16px">
        <div style="font-family:'DM Sans',sans-serif;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6B3F26;margin-bottom:5px">Garant(s)</div>
        <div style="font-family:Georgia,serif;font-size:14px;font-weight:700;color:#3B2314;line-height:1.2">${candidat.garant_label ?? 'Aucun'}</div>
      </div>
    </div>

    <!-- Table des matières -->
    <div style="margin:0 32px;flex:1">
      <div style="font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6B3F26;margin-bottom:8px">
        Les pièces justificatives de ${candidat.prenom} ${candidat.nom} · ${candidat.email}
      </div>
      ${documents.length > 0 ? `
      <div style="border:1px solid #D4B896;border-radius:10px;overflow:hidden">
        ${docsRows}
      </div>
      <div style="text-align:right;margin-top:10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#6B3F26">
        ${candidat.revenus_mensuels_nets ? `${candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} € net` : ''}
      </div>` : `
      <div style="border:1px dashed #D4B896;border-radius:10px;padding:16px;text-align:center">
        <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#8A7068">Aucun document déposé</div>
      </div>`}
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
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#5C4433">Document non fourni</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:#96766A;margin-top:4px">${doc.label}</div>
        </div>
      </div>`}
    </div>

    ${pageFooter(data.dossier.reference, pageNum, totalPages)}
  </div>`
}

// ── Assemblage final ─────────────────────────────────────────────────────────

export function generateDossierHTML(data: DossierTemplateData): string {
  // Uniquement les documents réellement déposés — jamais de page "Document non fourni"
  const docPages = data.documents.filter(d => d.statut === 'verifie')

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
