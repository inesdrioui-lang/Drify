export interface DossierTemplateData {
  candidat: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse_actuelle: string;
    situation_professionnelle: string;
    revenus_mensuels_nets: number;
    nom_employeur?: string;
    date_entree_emploi?: string;
  };
  dossier: {
    reference: string;
    date_generation: string;
    taux_effort?: number;
    score_confiance?: number;
  };
  documents: DossierDocument[];
}

export interface DossierDocument {
  type: DocumentType;
  label: string;
  statut: 'verifie' | 'non_fourni' | 'en_attente';
  url?: string;
  data_url?: string; // base64 PNG generated from a PDF page via Puppeteer screenshot
  mime_type?: string;
  page_index?: number;
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
  | 'autre';

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
};

// ── Logo inline SVG (version crème pour fond sombre) ─────────────────────────
const LOGO_LIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="180 375 700 250" width="88" height="28">
  <path fill="#EDE0CF" d="M502.5,440.5C539.9,447.5 559.2,470 560.5,508C560.7,536.3 548,556.3 522.5,568C514.2,571 505.9,573.1 497.5,574.5L494.5,574.5C478.3,573.5 462,573.2 445.5,573.5L445.5,441.5C464.7,441.8 483.7,441.5 502.5,440.5Z"/>
  <path fill="#D4B896" d="M534.5,500.5C536.2,520.4 528.9,535.7 512.5,546.5C506.2,548.6 499.8,550.2 493.5,551.5L470.5,551.5L470.5,462.5C480.2,462.3 489.9,462.8 499.5,464C519.6,468.1 531.3,480.3 534.5,500.5Z"/>
  <path fill="#EDE0CF" d="M388.5,465.5C360.7,440.5 332.7,415.7 304.5,391C294,382 283,381.3 271.5,389C243.3,413.7 215.3,438.5 187.5,463.5C185.1,466.4 183.3,469.8 182,473.5C181.3,508.8 181.3,544.2 182,579.5C183.8,585.3 188,589.5 194.5,592L281.5,592.5C252.7,592.6 223.7,592.5 194.5,592C187.2,591.7 181.7,585.9 180,576.5C179.3,542.5 179.3,508.5 180,474.5C180.9,471.7 182.1,469 183.5,466.5L388.5,465.5Z"/>
  <path fill="#EDE0CF" d="M652.5,479.5L674.5,479.5L674.5,572.5L652.5,572.5L652.5,479.5Z"/>
  <path fill="#EDE0CF" d="M689.5,479.5L750.5,479.5L750.5,496.5L731.5,497.5L731.5,574.5L707.5,574.5L707.5,497.5L689.5,497.5ZM706.5,463.5C707.3,451.7 713.3,444.1 724.5,440.5C733.4,437.3 742.4,437.4 749.5,439.5C746.1,438 742.4,437.4 738.5,437.5C733.4,437.3 728.8,438.3 724.5,440.5C713.3,444.1 706.5,463.5 706.5,463.5Z"/>
  <path fill="#EDE0CF" d="M576.5,478.5L601.5,477.5L601.5,479.5C601.3,484.8 601.5,490.2 602,495.5C609.5,483 620.2,477 634.5,477.5L634.5,500.5C609,503 601.2,515.5 602.5,515.5C601.2,554.8 601.5,574.5 601.5,574.5L576.5,573.5L576.5,478.5Z"/>
  <path fill="#EDE0CF" d="M759.5,479.5L785.5,478.5L785.5,480.5C797.9,517.3 808.5,541.5 810,543.5C817.4,523 824.9,502.7 832.5,482.5C834,480.5 842.5,479.2 858.5,480C851.2,498 844.2,516.2 837.5,534.5C833.6,545.4 829.9,554 826.5,563.5C822.2,578.3 816.3,592 810,605.5C808.4,607.9 806.3,609.3 803.5,609.5L783.5,608.5C788.1,599.4 792.1,590 795.5,580.5C786.6,546.5 764.5,488.5 759.5,479.5Z"/>
</svg>`;

// Cover page — very light, almost invisible
function buildWatermark(): string {
  const item = `<span class="wm-item">CONFIDENTIEL · DRIFY · USAGE LOCATIF EXCLUSIF · </span>`;
  return `<div class="watermark" aria-hidden="true"><div class="wm-inner">${Array(80).fill(item).join('')}</div></div>`;
}

// Document pages — clearly visible, correct legal wording
function buildDocWatermark(): string {
  const item = `<span class="wm-doc-item">DOCUMENT EXCLUSIVEMENT DESTINÉ À LA LOCATION IMMOBILIÈRE — DRIFY · </span>`;
  return `<div class="watermark-doc" aria-hidden="true"><div class="wm-doc-inner">${Array(60).fill(item).join('')}</div></div>`;
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function statusLabel(s: DossierDocument['statut']): string {
  return s === 'verifie' ? 'Fourni' : s === 'non_fourni' ? 'Non fourni' : 'En attente';
}
function statusClass(s: DossierDocument['statut']): string {
  return s === 'verifie' ? 'ok' : s === 'non_fourni' ? 'err' : 'warn';
}

function buildDocPages(data: DossierTemplateData): string {
  return data.documents
    .filter((d) => d.statut === 'verifie' && (d.url || d.data_url))
    .map((doc, i) => {
      // data_url = PNG converted from PDF by Puppeteer; url = original signed URL (images)
      const imgSrc = doc.data_url ?? (doc.mime_type?.startsWith('image/') ? doc.url : undefined);
      return `
  <div class="page">
    ${buildDocWatermark()}
    <header class="ph">
      <div class="ph-brand">${LOGO_LIGHT}</div>
      <div class="ph-center">${doc.label}</div>
      <div class="ph-right">
        <div class="ph-name">${data.candidat.prenom} ${data.candidat.nom.toUpperCase()}</div>
        <div class="ph-ref">Réf. ${data.dossier.reference}</div>
      </div>
    </header>
    <div class="ribbon">
      <span class="ribbon-l">${doc.label.toUpperCase()}</span>
      <span class="ribbon-r">Document exclusif location immobilière — Drify</span>
    </div>
    <div class="doc-area">
      ${imgSrc
        ? `<img class="doc-img" src="${imgSrc}" alt="${doc.label}" />`
        : `<div class="doc-ph">
             <svg width="36" height="44" viewBox="0 0 36 44" fill="none"><rect x="1" y="1" width="34" height="42" rx="3" stroke="#D4B896" stroke-width="1.5"/><path d="M9 16h18M9 22h18M9 28h11" stroke="#D4B896" stroke-width="1.5" stroke-linecap="round"/><path d="M22 1v10h13" stroke="#D4B896" stroke-width="1.5" stroke-linejoin="round"/></svg>
             <div class="doc-ph-label">${doc.label}</div>
             <div class="doc-ph-sub">Document PDF — conversion indisponible</div>
           </div>`
      }
    </div>
    <footer class="pf">
      <div class="pf-l">Drify · Dossier de location numérique · ${data.dossier.date_generation}<br>Document confidentiel · RGPD · Conservation max. 3 ans · privacy@drify.fr</div>
      <div class="pf-n">${i + 2}</div>
    </footer>
  </div>`;
    })
    .join('');
}

export function generateDossierHTML(data: DossierTemplateData): string {
  const verifiedDocs = data.documents.filter((d) => d.statut === 'verifie' && d.url);
  const lastPage = verifiedDocs.length + 2;
  const initials = getInitials(data.candidat.prenom, data.candidat.nom);
  const loyerMax = Math.round(data.candidat.revenus_mensuels_nets / 3);
  const score = data.dossier.score_confiance ?? null;
  const taux = data.dossier.taux_effort ?? null;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dossier de location — ${data.candidat.prenom} ${data.candidat.nom}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    :root{
      --bd:#3B2314;--b:#6B3F26;--bl:#A0673A;
      --beg:#EDE0CF;--begl:#F7F2EA;--begd:#D4B896;
      --w:#FFFFFF;--ink:#1A0F08;--ink2:#5A4035;
      --ok:#2E6644;--err:#7D2416;--warn:#7A5010;
    }
    body{font-family:'DM Sans',sans-serif;font-size:10px;color:var(--ink);background:white;width:210mm}

    /* PAGE */
    .page{width:210mm;min-height:297mm;position:relative;page-break-after:always;overflow:hidden;background:white}
    @media print{.page{page-break-after:always}}

    /* WATERMARK — cover page (très discret) */
    .watermark{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
    .wm-inner{position:absolute;top:-50%;left:-20%;width:160%;height:220%;transform:rotate(-32deg);display:flex;flex-wrap:wrap;align-content:flex-start;gap:22px 0}
    .wm-item{font-size:8px;font-weight:600;letter-spacing:3px;color:rgba(59,35,20,0.038);white-space:nowrap;padding-right:24px}

    /* WATERMARK — pages documents (visible, au-dessus du document, sous le header) */
    .watermark-doc{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:8}
    .wm-doc-inner{position:absolute;top:-50%;left:-20%;width:160%;height:220%;transform:rotate(-32deg);display:flex;flex-wrap:wrap;align-content:flex-start;gap:26px 0}
    .wm-doc-item{font-size:8.5px;font-weight:700;letter-spacing:3px;color:rgba(59,35,20,0.10);white-space:nowrap;padding-right:28px}

    /* PAGE HEADER */
    .ph{background:var(--bd);padding:5mm 12mm;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:10;gap:4mm}
    .ph-brand{flex-shrink:0;display:flex;align-items:center}
    .ph-center{flex:1;text-align:center;font-size:8px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--begd)}
    .ph-right{text-align:right;flex-shrink:0}
    .ph-name{font-size:8.5px;font-weight:600;color:var(--beg)}
    .ph-ref{font-size:6.5px;color:var(--begd);margin-top:1px;font-family:monospace}

    /* RIBBON */
    .ribbon{background:var(--begl);border-bottom:1px solid var(--begd);padding:2.5mm 12mm;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:10}
    .ribbon-l{font-size:6.5px;font-weight:700;letter-spacing:2px;color:var(--b)}
    .ribbon-r{font-size:7px;color:var(--ink2);font-style:italic}

    /* DOC AREA */
    .doc-area{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;padding:8mm 12mm;min-height:228mm}
    .doc-img{max-width:100%;max-height:220mm;object-fit:contain;border-radius:2px;border:0.5px solid var(--begd)}
    .doc-ph{width:100%;height:195mm;background:var(--begl);border:1px dashed var(--begd);border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
    .doc-ph-label{font-size:10px;font-weight:500;color:var(--ink2)}
    .doc-ph-sub{font-size:8px;color:var(--begd)}

    /* PAGE FOOTER */
    .pf{background:var(--begl);border-top:0.5px solid var(--begd);padding:3mm 12mm;display:flex;justify-content:space-between;align-items:center;position:absolute;bottom:0;left:0;right:0;z-index:10}
    .pf-l{font-size:6.5px;color:var(--ink2);line-height:1.6}
    .pf-n{font-family:'Playfair Display',serif;font-size:13px;color:var(--bl)}

    /* HERO */
    .hero{background:var(--bd);position:relative;overflow:hidden;padding-bottom:8mm}
    .hero::before{content:'';position:absolute;right:-24mm;top:-24mm;width:90mm;height:90mm;border-radius:50%;border:1px solid rgba(237,224,207,0.07)}
    .hero::after{content:'';position:absolute;right:-10mm;top:-10mm;width:60mm;height:60mm;border-radius:50%;border:1px solid rgba(237,224,207,0.05)}
    .hero-bar{padding:6mm 14mm 0;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
    .hero-date{font-size:7.5px;color:var(--begd);letter-spacing:0.5px}
    .hero-eyebrow{padding:5mm 14mm 0;font-size:7px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:var(--begd);position:relative;z-index:2}
    .hero-rule{margin:3.5mm 14mm;height:0.5px;background:rgba(212,184,150,0.18)}
    .hero-candidate{padding:0 14mm;display:flex;align-items:center;gap:5mm;position:relative;z-index:2}
    .hero-avatar{width:13mm;height:13mm;border-radius:50%;background:rgba(160,103,58,0.35);border:1.5px solid rgba(237,224,207,0.25);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:12px;color:var(--beg);flex-shrink:0}
    .hero-name{font-family:'Playfair Display',serif;font-size:23px;color:var(--w);letter-spacing:0.3px;line-height:1.1}
    .hero-job{font-size:9px;color:var(--begd);margin-top:1.5mm}
    .score-pill{margin:5mm 14mm 0;display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(237,224,207,0.2);border-radius:2px;padding:1.5mm 3mm;position:relative;z-index:2}
    .score-pill-label{font-size:6.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--begd)}
    .score-sep{width:0.5px;height:9px;background:rgba(212,184,150,0.3)}
    .score-val{font-family:'Playfair Display',serif;font-size:12px;color:var(--w)}
    .score-max{font-size:7px;color:var(--begd)}

    /* COVER BODY */
    .cover-body{padding:5mm 14mm 18mm}

    /* INFO GRID */
    .ig{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--begd);border-radius:3px;overflow:hidden;margin-bottom:5mm;margin-top:4mm}
    .ig-cell{padding:3.5mm 5mm;background:var(--begl);border-right:0.5px solid var(--begd);border-bottom:0.5px solid var(--begd)}
    .ig-cell:nth-child(2n){border-right:none}
    .ig-cell:nth-last-child(-n+2){border-bottom:none}
    .ig-wide{grid-column:span 2;border-right:none}
    .ig-label{font-size:6.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bl);margin-bottom:1.5mm}
    .ig-value{font-family:'Playfair Display',serif;font-size:13px;color:var(--bd)}
    .ig-value-sm{font-size:9px;font-weight:500;color:var(--ink);line-height:1.4}
    .ig-sub{font-size:7px;color:var(--ink2);margin-top:1mm}
    .effort-bar{height:3px;background:var(--begd);border-radius:2px;margin-top:2mm;overflow:hidden}
    .effort-fill{height:100%;background:var(--b);border-radius:2px}
    .effort-legend{display:flex;justify-content:space-between;margin-top:1mm;font-size:6px;color:var(--ink2)}

    /* SECTION TITLE */
    .st{font-size:7px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--b);margin-bottom:3mm;display:flex;align-items:center;gap:3mm}
    .st::after{content:'';flex:1;height:0.5px;background:var(--begd)}

    /* DOCS TABLE */
    .dt{width:100%;border:1px solid var(--begd);border-radius:3px;overflow:hidden;margin-bottom:5mm}
    .dt-head{background:var(--bd);display:flex;padding:2.5mm 5mm}
    .dt-h1{flex:1;font-size:6.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--begd)}
    .dt-h2{font-size:6.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--begd)}
    .dt-row{display:flex;align-items:center;justify-content:space-between;padding:2.8mm 5mm;border-top:0.5px solid var(--beg);background:var(--begl)}
    .dt-row:nth-child(even){background:var(--w)}
    .dt-left{display:flex;align-items:center;gap:2.5mm}
    .dt-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
    .dt-dot.ok{background:var(--ok)}.dt-dot.err{background:var(--err)}.dt-dot.warn{background:var(--warn)}
    .dt-name{font-size:8.5px;font-weight:500;color:var(--ink)}
    .dt-badge{font-size:7px;font-weight:700;padding:1mm 2.5mm;border-radius:2px;letter-spacing:0.3px}
    .dt-badge.ok{background:rgba(46,102,68,0.1);color:var(--ok);border:0.5px solid rgba(46,102,68,0.2)}
    .dt-badge.err{background:rgba(125,36,22,0.08);color:var(--err);border:0.5px solid rgba(125,36,22,0.2)}
    .dt-badge.warn{background:rgba(122,80,16,0.08);color:var(--warn);border:0.5px solid rgba(122,80,16,0.2)}

    /* RGPD */
    .rgpd{background:var(--begl);border:1px solid var(--begd);border-left:2px solid var(--b);border-radius:2px;padding:3mm 4mm}
    .rgpd-t{font-size:7px;font-weight:700;color:var(--b);margin-bottom:1.5mm}
    .rgpd-txt{font-size:7px;color:var(--ink2);line-height:1.65}

    /* LEGAL */
    .legal-body{padding:7mm 14mm 20mm;position:relative;z-index:5}
    .legal-intro{font-size:8px;color:var(--ink2);line-height:1.7;margin-bottom:5mm;padding-bottom:4mm;border-bottom:0.5px solid var(--begd)}
    .legal-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:5mm}
    .la{background:var(--begl);border:0.5px solid var(--begd);border-radius:2px;padding:3mm 4mm}
    .la.wide{grid-column:span 2}
    .la-num{font-size:6px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bl);margin-bottom:1mm}
    .la-title{font-family:'Playfair Display',serif;font-size:9px;color:var(--bd);margin-bottom:1.5mm}
    .la-text{font-size:7px;color:var(--ink2);line-height:1.65}
    .la-text strong{color:var(--ink);font-weight:600}
    .legal-auth{background:var(--bd);border-radius:3px;padding:5mm 6mm;text-align:center}
    .lauth-title{font-family:'Playfair Display',serif;font-size:11px;color:var(--beg);margin-bottom:2mm}
    .lauth-text{font-size:7.5px;color:var(--begd);line-height:1.6;margin-bottom:3mm}
    .lauth-ref{font-family:monospace;font-size:8px;color:var(--beg);letter-spacing:1.5px;background:rgba(255,255,255,0.07);display:inline-block;padding:1.5mm 3mm;border-radius:2px;border:0.5px solid rgba(237,224,207,0.2)}
  </style>
</head>
<body>

<!-- ══ PAGE 1 — COUVERTURE ════════════════════════ -->
<div class="page">
  <div class="hero">
    <div class="hero-bar">
      <div>${LOGO_LIGHT}</div>
      <div class="hero-date">Généré le ${data.dossier.date_generation}</div>
    </div>
    <div class="hero-eyebrow">Dossier de location numérique</div>
    <div class="hero-rule"></div>
    <div class="hero-candidate">
      <div class="hero-avatar">${initials}</div>
      <div>
        <div class="hero-name">${data.candidat.prenom} ${data.candidat.nom.toUpperCase()}</div>
        <div class="hero-job">${data.candidat.situation_professionnelle}</div>
      </div>
    </div>
    ${score ? `<div class="score-pill"><span class="score-pill-label">Score Drify</span><div class="score-sep"></div><span class="score-val">${score}</span><span class="score-max">/100</span></div>` : ''}
  </div>

  <div class="cover-body">
    <div class="ig">
      <div class="ig-cell">
        <div class="ig-label">Revenus mensuels nets</div>
        <div class="ig-value">${data.candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} €</div>
        <div class="ig-sub">Loyer recommandé ≤ ${loyerMax.toLocaleString('fr-FR')} €</div>
      </div>
      ${taux ? `
      <div class="ig-cell">
        <div class="ig-label">Taux d'effort estimé</div>
        <div class="ig-value">${taux} %</div>
        <div class="effort-bar"><div class="effort-fill" style="width:${Math.min(taux * 3, 100)}%"></div></div>
        <div class="effort-legend"><span>0 %</span><span>33 % max</span></div>
      </div>` : `
      <div class="ig-cell">
        <div class="ig-label">Téléphone</div>
        <div class="ig-value-sm">${data.candidat.telephone}</div>
      </div>`}
      <div class="ig-cell">
        <div class="ig-label">Adresse actuelle</div>
        <div class="ig-value-sm">${data.candidat.adresse_actuelle}</div>
      </div>
      <div class="ig-cell">
        <div class="ig-label">Email</div>
        <div class="ig-value-sm">${data.candidat.email}</div>
      </div>
      ${data.candidat.nom_employeur ? `
      <div class="ig-cell ig-wide">
        <div class="ig-label">Employeur</div>
        <div class="ig-value-sm">${data.candidat.nom_employeur}${data.candidat.date_entree_emploi ? ` · Depuis le ${data.candidat.date_entree_emploi}` : ''}</div>
      </div>` : ''}
    </div>

    <div class="st">Documents inclus dans ce dossier</div>
    <div class="dt">
      <div class="dt-head"><span class="dt-h1">Document</span><span class="dt-h2">Statut</span></div>
      ${data.documents.map((doc) => `
      <div class="dt-row">
        <div class="dt-left"><div class="dt-dot ${statusClass(doc.statut)}"></div><span class="dt-name">${doc.label}</span></div>
        <span class="dt-badge ${statusClass(doc.statut)}">${statusLabel(doc.statut)}</span>
      </div>`).join('')}
    </div>

    <div class="rgpd">
      <div class="rgpd-t">Confidentialité &amp; Protection des données</div>
      <div class="rgpd-txt">Dossier généré par Drify (drify.vercel.app) à des fins exclusives de recherche d'un logement. Protégé par le RGPD (UE 2016/679). Toute autre utilisation est interdite. Conservation max. 3 ans · DPO : privacy@drify.fr · CNIL : cnil.fr</div>
    </div>
  </div>

  <footer class="pf">
    <div class="pf-l">Réf. ${data.dossier.reference} · drify.vercel.app</div>
    <div class="pf-n">1</div>
  </footer>
</div>

<!-- ══ PAGES DOCUMENTS ════════════════════════════ -->
${buildDocPages(data)}

<!-- ══ DERNIÈRE PAGE — MENTIONS LÉGALES ════════ -->
<div class="page" style="background:var(--begl)">
  ${buildWatermark()}
  <header class="ph">
    <div class="ph-brand">${LOGO_LIGHT}</div>
    <div class="ph-center">Mentions légales &amp; Protection des données</div>
    <div class="ph-right"><div class="ph-ref">${data.dossier.reference}</div></div>
  </header>

  <div class="legal-body">
    <p class="legal-intro">Mentions légales et politique de protection des données du dossier généré le <strong>${data.dossier.date_generation}</strong> par Drify, conformément au RGPD (UE 2016/679) et à la loi Informatique et Libertés.</p>

    <div class="legal-grid">
      <div class="la">
        <div class="la-num">Article 1</div>
        <div class="la-title">Responsable du traitement</div>
        <div class="la-text">Drify (drify.vercel.app). DPO : <strong>privacy@drify.fr</strong></div>
      </div>
      <div class="la">
        <div class="la-num">Article 2</div>
        <div class="la-title">Finalité &amp; base légale</div>
        <div class="la-text">Constitution de dossier de location et mise en relation propriétaire/locataire. Base : Art. 6.1.b et 6.1.a RGPD. Aucune cession à des tiers.</div>
      </div>
      <div class="la">
        <div class="la-num">Article 3</div>
        <div class="la-title">Durée de conservation</div>
        <div class="la-text">Maximum <strong>3 ans</strong>. Suppression sous 30 jours : <strong>privacy@drify.fr</strong></div>
      </div>
      <div class="la">
        <div class="la-num">Article 4</div>
        <div class="la-title">Droits des personnes</div>
        <div class="la-text">Accès, rectification, effacement, portabilité, opposition. Contact : <strong>privacy@drify.fr</strong> · Réclamation : <strong>cnil.fr</strong></div>
      </div>
      <div class="la wide">
        <div class="la-num">Article 5</div>
        <div class="la-title">Sécurité &amp; hébergement</div>
        <div class="la-text">Transmission HTTPS/TLS 1.3. Stockage chiffré AES-256 sur infrastructure Supabase (UE). Accès restreint aux personnes habilitées. Document strictement confidentiel — usage locatif exclusif.</div>
      </div>
    </div>

    <div class="legal-auth">
      <div class="lauth-title">Authenticité du document</div>
      <div class="lauth-text">Généré le <strong style="color:var(--beg)">${data.dossier.date_generation}</strong> par Drify.<br>Vérification : <strong style="color:var(--beg)">verify@drify.fr</strong> — mentionner la référence ci-dessous.</div>
      <div class="lauth-ref">${data.dossier.reference}</div>
    </div>
  </div>

  <footer class="pf">
    <div class="pf-l">Drify · drify.vercel.app · privacy@drify.fr · CNIL<br>Réf. ${data.dossier.reference} · ${data.dossier.date_generation}</div>
    <div class="pf-n">${lastPage}</div>
  </footer>
</div>

</body>
</html>`;
}
