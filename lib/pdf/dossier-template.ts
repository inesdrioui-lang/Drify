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

function buildWatermarkItems(count: number): string {
  return Array(count)
    .fill(0)
    .map(() => `<div class="wm-item">CONFIDENTIEL · DRIFY · USAGE LOCATIF EXCLUSIF · </div>`)
    .join('');
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function buildDocPages(data: DossierTemplateData): string {
  const verifiedDocs = data.documents.filter((d) => d.statut === 'verifie' && d.url);
  return verifiedDocs
    .map(
      (doc, index) => `
  <div class="page doc-page">
    <div class="watermark" aria-hidden="true">
      <div class="wm-track">${buildWatermarkItems(80)}</div>
    </div>

    <header class="page-header">
      <div class="header-brand">
        <div class="header-logo-mark"></div>
        <span class="header-brand-name">Drify</span>
      </div>
      <div class="header-center">
        <span class="header-doc-type">${doc.label}</span>
      </div>
      <div class="header-right">
        <div class="header-candidate">${data.candidat.prenom} ${data.candidat.nom.toUpperCase()}</div>
        <div class="header-ref">Réf. ${data.dossier.reference}</div>
      </div>
    </header>

    <div class="doc-strip">
      <span class="strip-label">${doc.label.toUpperCase()}</span>
      <span class="strip-mention">Document exclusif — location immobilière — Drify</span>
    </div>

    <div class="doc-content">
      ${
        doc.mime_type?.startsWith('image/')
          ? `<img class="doc-image" src="${doc.url}" alt="${doc.label}" />`
          : `<div class="doc-embed-placeholder">
               <div class="placeholder-icon">
                 <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                   <rect x="1" y="1" width="30" height="38" rx="3" stroke="#D4B896" stroke-width="1.5"/>
                   <path d="M8 14h16M8 20h16M8 26h10" stroke="#D4B896" stroke-width="1.5" stroke-linecap="round"/>
                   <path d="M20 1v8h11" stroke="#D4B896" stroke-width="1.5" stroke-linejoin="round"/>
                 </svg>
               </div>
               <div class="placeholder-label">${doc.label}</div>
               <div class="placeholder-sub">Document PDF — voir fichier joint</div>
             </div>`
      }
    </div>

    <footer class="page-footer">
      <div class="footer-legal">
        Drify · Dossier de location numérique · Généré le ${data.dossier.date_generation}<br>
        Document confidentiel soumis au RGPD · Conservation max. 3 ans · privacy@drify.fr
      </div>
      <div class="footer-page-num">${index + 2}</div>
    </footer>
  </div>`
    )
    .join('');
}

export function generateDossierHTML(data: DossierTemplateData): string {
  const verifiedDocs = data.documents.filter((d) => d.statut === 'verifie' && d.url);
  const verifiedCount = verifiedDocs.length;
  const lastPageNum = verifiedCount + 2;
  const initials = getInitials(data.candidat.prenom, data.candidat.nom);

  const loyer_max = data.candidat.revenus_mensuels_nets / 3;
  const tauxEffort = data.dossier.taux_effort ?? null;
  const score = data.dossier.score_confiance ?? null;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de location — ${data.candidat.prenom} ${data.candidat.nom}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    :root {
      --bd:  #3B2314;
      --b:   #6B3F26;
      --bl:  #A0673A;
      --beg: #EDE0CF;
      --begl:#F7F2EA;
      --begd:#D4B896;
      --w:   #FFFFFF;
      --ink: #1A0F08;
      --ink2:#5A4A3A;
      --ok:  #3A6647;
      --err: #8B2E20;
      --warn:#8B6020;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      color: var(--ink);
      background: white;
      width: 210mm;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      background: white;
    }

    @media print {
      .page { page-break-after: always; }
    }

    /* ── WATERMARK ─────────────────────────────── */
    .watermark {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }
    .wm-track {
      position: absolute;
      top: -60%;
      left: -20%;
      width: 160%;
      height: 220%;
      transform: rotate(-35deg);
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
    .wm-item {
      font-family: 'DM Sans', sans-serif;
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 3px;
      color: rgba(59, 35, 20, 0.042);
      white-space: nowrap;
    }

    /* ── SHARED PAGE HEADER ────────────────────── */
    .page-header {
      background: var(--bd);
      padding: 5.5mm 12mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .header-logo-mark {
      width: 20px;
      height: 20px;
      border: 1.5px solid rgba(237,224,207,0.6);
      border-radius: 4px;
      position: relative;
    }
    .header-logo-mark::after {
      content: '';
      position: absolute;
      inset: 3px;
      background: rgba(237,224,207,0.5);
      border-radius: 2px;
    }
    .header-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      color: var(--w);
      letter-spacing: 0.5px;
    }
    .header-center {
      flex: 1;
      text-align: center;
    }
    .header-doc-type {
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--begd);
    }
    .header-right {
      text-align: right;
    }
    .header-candidate {
      font-size: 8.5px;
      font-weight: 600;
      color: var(--beg);
      letter-spacing: 0.3px;
    }
    .header-ref {
      font-size: 7px;
      color: var(--begd);
      margin-top: 1px;
      font-family: monospace;
      letter-spacing: 0.5px;
    }

    /* ── DOC STRIP ─────────────────────────────── */
    .doc-strip {
      background: var(--begl);
      border-bottom: 1px solid var(--begd);
      padding: 2.5mm 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .strip-label {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--b);
    }
    .strip-mention {
      font-size: 7px;
      color: var(--ink2);
      font-style: italic;
    }

    /* ── DOC CONTENT ───────────────────────────── */
    .doc-content {
      position: relative;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8mm 12mm;
      min-height: 230mm;
    }
    .doc-image {
      max-width: 100%;
      max-height: 220mm;
      object-fit: contain;
      border-radius: 2px;
      border: 0.5px solid var(--begd);
    }
    .doc-embed-placeholder {
      width: 100%;
      height: 200mm;
      background: var(--begl);
      border: 1px dashed var(--begd);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .placeholder-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink2);
    }
    .placeholder-sub {
      font-size: 8px;
      color: var(--begd);
    }

    /* ── SHARED PAGE FOOTER ────────────────────── */
    .page-footer {
      background: var(--begl);
      border-top: 0.5px solid var(--begd);
      padding: 3mm 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }
    .footer-legal {
      font-size: 6.5px;
      color: var(--ink2);
      line-height: 1.6;
    }
    .footer-page-num {
      font-family: 'Playfair Display', serif;
      font-size: 12px;
      color: var(--bl);
    }

    /* ══════════════════════════════════════════
       PAGE DE COUVERTURE
    ══════════════════════════════════════════ */
    .cover-hero {
      background: var(--bd);
      padding: 0;
      position: relative;
      overflow: hidden;
      min-height: 98mm;
    }

    /* Cercles décoratifs */
    .cover-hero::before {
      content: '';
      position: absolute;
      right: -18mm;
      top: -18mm;
      width: 70mm;
      height: 70mm;
      border-radius: 50%;
      border: 1px solid rgba(237,224,207,0.08);
    }
    .cover-hero::after {
      content: '';
      position: absolute;
      right: -8mm;
      top: -8mm;
      width: 48mm;
      height: 48mm;
      border-radius: 50%;
      border: 1px solid rgba(237,224,207,0.06);
    }

    .hero-top-bar {
      padding: 6mm 14mm 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hero-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-logo-mark {
      width: 26px;
      height: 26px;
      border: 1.5px solid rgba(237,224,207,0.4);
      border-radius: 5px;
      position: relative;
    }
    .hero-logo-mark::after {
      content: '';
      position: absolute;
      inset: 4px;
      background: rgba(237,224,207,0.35);
      border-radius: 2px;
    }
    .hero-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: var(--w);
      letter-spacing: 1px;
    }
    .hero-date {
      font-size: 7.5px;
      color: var(--begd);
      letter-spacing: 0.5px;
    }

    .hero-label {
      padding: 5mm 14mm 0;
      font-size: 7.5px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--begd);
    }

    .hero-divider {
      height: 0.5px;
      background: rgba(212,184,150,0.2);
      margin: 4mm 14mm;
    }

    .hero-candidate-block {
      padding: 0 14mm 6mm;
      display: flex;
      align-items: flex-end;
      gap: 5mm;
    }
    .hero-avatar {
      width: 14mm;
      height: 14mm;
      border-radius: 50%;
      background: var(--b);
      border: 1.5px solid rgba(237,224,207,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      color: var(--beg);
      flex-shrink: 0;
      margin-bottom: 1mm;
    }
    .hero-candidate-info {}
    .hero-candidate-name {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: var(--w);
      letter-spacing: 0.3px;
      line-height: 1.1;
    }
    .hero-candidate-job {
      font-size: 9.5px;
      color: var(--begd);
      margin-top: 1.5mm;
      font-weight: 400;
    }

    /* ── COVER BODY ────────────────────────────── */
    .cover-body {
      padding: 6mm 14mm 18mm;
    }

    /* Score badge */
    .score-row {
      display: flex;
      align-items: center;
      gap: 3mm;
      margin-bottom: 5mm;
    }
    .score-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--bd);
      border: 1px solid var(--b);
      border-radius: 2px;
      padding: 1.5mm 3.5mm;
    }
    .score-pill-label {
      font-size: 7px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--beg);
      text-transform: uppercase;
    }
    .score-pill-sep {
      width: 0.5px;
      height: 10px;
      background: var(--b);
    }
    .score-pill-value {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      color: var(--w);
    }
    .score-pill-max {
      font-size: 7.5px;
      color: var(--begd);
    }

    /* Info grid */
    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid var(--begd);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5mm;
    }
    .grid-cell {
      padding: 3.5mm 5mm;
      border-right: 0.5px solid var(--begd);
      border-bottom: 0.5px solid var(--begd);
      background: var(--begl);
    }
    .grid-cell:nth-child(2n) { border-right: none; }
    .grid-cell:nth-last-child(-n+2) { border-bottom: none; }
    .grid-cell-wide {
      grid-column: span 2;
      border-right: none;
    }
    .cell-label {
      font-size: 6.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--bl);
      margin-bottom: 1.5mm;
    }
    .cell-value {
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      color: var(--bd);
      line-height: 1.2;
    }
    .cell-value-sm {
      font-size: 9px;
      font-weight: 500;
      color: var(--ink);
      line-height: 1.4;
    }

    /* Taux d'effort bar */
    .effort-bar-wrap {
      margin-top: 2mm;
    }
    .effort-bar-track {
      height: 3px;
      background: var(--begd);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 1mm;
    }
    .effort-bar-fill {
      height: 100%;
      background: var(--b);
      border-radius: 2px;
    }
    .effort-bar-legend {
      display: flex;
      justify-content: space-between;
      margin-top: 1mm;
      font-size: 6px;
      color: var(--ink2);
    }

    /* Revenus highlight */
    .revenus-big {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: var(--bd);
    }
    .revenus-sub {
      font-size: 7px;
      color: var(--ink2);
      margin-top: 0.5mm;
    }

    /* Séparateur de section */
    .section-sep {
      height: 0.5px;
      background: var(--begd);
      margin: 4mm 0;
    }

    /* Titre de section */
    .section-title {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--b);
      margin-bottom: 3mm;
      display: flex;
      align-items: center;
      gap: 2mm;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 0.5px;
      background: var(--begd);
    }

    /* Documents list */
    .docs-table {
      width: 100%;
      border: 1px solid var(--begd);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5mm;
    }
    .docs-table-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2.8mm 4.5mm;
      border-bottom: 0.5px solid var(--beg);
      background: var(--begl);
    }
    .docs-table-row:last-child { border-bottom: none; }
    .docs-table-row:nth-child(even) { background: var(--w); }
    .doc-row-left {
      display: flex;
      align-items: center;
      gap: 2.5mm;
    }
    .doc-status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-ok   { background: var(--ok); }
    .dot-err  { background: var(--err); }
    .dot-warn { background: var(--warn); }
    .doc-row-name {
      font-size: 8.5px;
      font-weight: 500;
      color: var(--ink);
    }
    .doc-row-badge {
      font-size: 7px;
      font-weight: 700;
      padding: 1mm 2.5mm;
      border-radius: 1.5px;
      letter-spacing: 0.5px;
    }
    .badge-ok   { background: rgba(58,102,71,0.1);  color: var(--ok);   border: 0.5px solid rgba(58,102,71,0.25); }
    .badge-err  { background: rgba(139,46,32,0.08); color: var(--err);  border: 0.5px solid rgba(139,46,32,0.2); }
    .badge-warn { background: rgba(139,96,32,0.08); color: var(--warn); border: 0.5px solid rgba(139,96,32,0.2); }

    /* Mentions RGPD */
    .rgpd-box {
      background: var(--begl);
      border: 1px solid var(--begd);
      border-left: 2.5px solid var(--b);
      border-radius: 2px;
      padding: 3.5mm 4.5mm;
    }
    .rgpd-title {
      font-size: 7px;
      font-weight: 700;
      color: var(--b);
      margin-bottom: 1.5mm;
      letter-spacing: 0.5px;
    }
    .rgpd-text {
      font-size: 7px;
      color: var(--ink2);
      line-height: 1.65;
    }

    /* ══════════════════════════════════════════
       PAGE MENTIONS LÉGALES
    ══════════════════════════════════════════ */
    .legal-page { background: var(--begl); }

    .legal-body {
      padding: 7mm 14mm 20mm;
      position: relative;
      z-index: 5;
    }

    .legal-intro {
      font-size: 8.5px;
      color: var(--ink2);
      line-height: 1.7;
      margin-bottom: 5mm;
      padding-bottom: 4mm;
      border-bottom: 0.5px solid var(--begd);
    }

    .legal-articles {
      display: flex;
      flex-direction: column;
      gap: 4mm;
    }

    .legal-article {
      padding: 3.5mm 4.5mm;
      background: var(--w);
      border-radius: 2px;
      border: 0.5px solid var(--begd);
    }
    .legal-article-num {
      font-size: 6.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--bl);
      margin-bottom: 1mm;
    }
    .legal-article-title {
      font-family: 'Playfair Display', serif;
      font-size: 10px;
      color: var(--bd);
      margin-bottom: 2mm;
    }
    .legal-article-text {
      font-size: 7.5px;
      color: var(--ink2);
      line-height: 1.7;
    }
    .legal-article-text strong {
      color: var(--ink);
      font-weight: 600;
    }

    .legal-auth {
      margin-top: 6mm;
      background: var(--bd);
      border-radius: 3px;
      padding: 5mm 6mm;
      text-align: center;
    }
    .legal-auth-title {
      font-family: 'Playfair Display', serif;
      font-size: 11px;
      color: var(--beg);
      margin-bottom: 2mm;
    }
    .legal-auth-text {
      font-size: 7.5px;
      color: var(--begd);
      line-height: 1.6;
      margin-bottom: 3mm;
    }
    .legal-auth-ref {
      font-family: monospace;
      font-size: 8px;
      color: var(--beg);
      letter-spacing: 1.5px;
      background: rgba(255,255,255,0.06);
      display: inline-block;
      padding: 1.5mm 3mm;
      border-radius: 2px;
      border: 0.5px solid rgba(237,224,207,0.2);
    }
  </style>
</head>
<body>

  <!-- ══════════════════════════════════════
       PAGE 1 — COUVERTURE
  ══════════════════════════════════════ -->
  <div class="page">

    <div class="cover-hero">
      <div class="hero-top-bar">
        <div class="hero-brand">
          <div class="hero-logo-mark"></div>
          <span class="hero-brand-name">Drify</span>
        </div>
        <div class="hero-date">Généré le ${data.dossier.date_generation}</div>
      </div>

      <div class="hero-label">Dossier de location numérique</div>
      <div class="hero-divider"></div>

      <div class="hero-candidate-block">
        <div class="hero-avatar">${initials}</div>
        <div class="hero-candidate-info">
          <div class="hero-candidate-name">${data.candidat.prenom} ${data.candidat.nom.toUpperCase()}</div>
          <div class="hero-candidate-job">${data.candidat.situation_professionnelle}</div>
        </div>
      </div>
    </div>

    <div class="cover-body">

      ${
        score
          ? `<div class="score-row">
          <div class="score-pill">
            <span class="score-pill-label">Score Drify</span>
            <div class="score-pill-sep"></div>
            <span class="score-pill-value">${score}</span>
            <span class="score-pill-max">/100</span>
          </div>
        </div>`
          : ''
      }

      <div class="cover-grid">
        <div class="grid-cell">
          <div class="cell-label">Revenus mensuels nets</div>
          <div class="revenus-big">${data.candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} €</div>
          <div class="revenus-sub">Loyer recommandé ≤ ${loyer_max.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
        </div>

        ${
          tauxEffort
            ? `<div class="grid-cell">
          <div class="cell-label">Taux d'effort</div>
          <div class="cell-value">${tauxEffort} %</div>
          <div class="effort-bar-wrap">
            <div class="effort-bar-track">
              <div class="effort-bar-fill" style="width:${Math.min(tauxEffort * 3, 100)}%"></div>
            </div>
            <div class="effort-bar-legend"><span>0 %</span><span>33 % max</span></div>
          </div>
        </div>`
            : `<div class="grid-cell">
          <div class="cell-label">Téléphone</div>
          <div class="cell-value-sm">${data.candidat.telephone}</div>
        </div>`
        }

        <div class="grid-cell">
          <div class="cell-label">Adresse actuelle</div>
          <div class="cell-value-sm">${data.candidat.adresse_actuelle}</div>
        </div>

        <div class="grid-cell">
          <div class="cell-label">Email</div>
          <div class="cell-value-sm">${data.candidat.email}</div>
        </div>

        ${
          data.candidat.nom_employeur
            ? `<div class="grid-cell grid-cell-wide">
          <div class="cell-label">Employeur</div>
          <div class="cell-value-sm">${data.candidat.nom_employeur}${data.candidat.date_entree_emploi ? ` · Depuis le ${data.candidat.date_entree_emploi}` : ''}</div>
        </div>`
            : ''
        }
      </div>

      <div class="section-sep"></div>
      <div class="section-title">Documents inclus</div>

      <div class="docs-table">
        ${data.documents
          .map(
            (doc) => `
        <div class="docs-table-row">
          <div class="doc-row-left">
            <div class="doc-status-dot ${doc.statut === 'verifie' ? 'dot-ok' : doc.statut === 'non_fourni' ? 'dot-err' : 'dot-warn'}"></div>
            <span class="doc-row-name">${doc.label}</span>
          </div>
          <span class="doc-row-badge ${doc.statut === 'verifie' ? 'badge-ok' : doc.statut === 'non_fourni' ? 'badge-err' : 'badge-warn'}">
            ${doc.statut === 'verifie' ? 'Vérifié' : doc.statut === 'non_fourni' ? 'Non fourni' : 'En attente'}
          </span>
        </div>`
          )
          .join('')}
      </div>

      <div class="rgpd-box">
        <div class="rgpd-title">Confidentialité &amp; Protection des données</div>
        <div class="rgpd-text">
          Ce dossier a été généré par Drify (drify.vercel.app) et est destiné exclusivement à la recherche d'un logement.
          Protégé par le RGPD (Règl. UE 2016/679). Toute autre utilisation est interdite.
          Durée de conservation : 3 ans max. DPO : privacy@drify.fr · CNIL : cnil.fr
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-legal">
        Réf. ${data.dossier.reference} · drify.vercel.app
      </div>
      <div class="footer-page-num">1</div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       PAGES DOCUMENTS
  ══════════════════════════════════════ -->
  ${buildDocPages(data)}

  <!-- ══════════════════════════════════════
       DERNIÈRE PAGE — MENTIONS LÉGALES
  ══════════════════════════════════════ -->
  <div class="page legal-page">
    <div class="watermark" aria-hidden="true">
      <div class="wm-track">${buildWatermarkItems(80)}</div>
    </div>

    <header class="page-header">
      <div class="header-brand">
        <div class="header-logo-mark"></div>
        <span class="header-brand-name">Drify</span>
      </div>
      <div class="header-center">
        <span class="header-doc-type">Mentions légales &amp; Protection des données</span>
      </div>
      <div class="header-right">
        <div class="header-ref">${data.dossier.reference}</div>
      </div>
    </header>

    <div class="legal-body">
      <p class="legal-intro">
        Le présent document constitue les mentions légales et la politique de protection des données personnelles applicables
        au dossier de location numérique généré par la plateforme Drify le <strong>${data.dossier.date_generation}</strong>.
        Il est produit conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679)
        et à la loi Informatique et Libertés.
      </p>

      <div class="legal-articles">
        <div class="legal-article">
          <div class="legal-article-num">Article 1</div>
          <div class="legal-article-title">Responsable du traitement</div>
          <div class="legal-article-text">
            Drify (drify.vercel.app) est responsable du traitement des données personnelles contenues dans ce dossier.
            Délégué à la protection des données (DPO) : <strong>privacy@drify.fr</strong>
          </div>
        </div>

        <div class="legal-article">
          <div class="legal-article-num">Article 2</div>
          <div class="legal-article-title">Finalité &amp; base légale du traitement</div>
          <div class="legal-article-text">
            Les données sont traitées exclusivement à des fins de constitution de dossier de location et de mise en relation
            avec des propriétaires bailleurs. Base légale : Art. 6.1.b (exécution d'un contrat) et Art. 6.1.a (consentement explicite) du RGPD.
            Aucune cession à des tiers non autorisés.
          </div>
        </div>

        <div class="legal-article">
          <div class="legal-article-num">Article 3</div>
          <div class="legal-article-title">Durée de conservation</div>
          <div class="legal-article-text">
            Maximum <strong>3 ans</strong> après le dernier contact ou la fin de la relation contractuelle.
            Suppression sur demande : <strong>privacy@drify.fr</strong> — Réponse garantie sous 30 jours calendaires.
          </div>
        </div>

        <div class="legal-article">
          <div class="legal-article-num">Article 4</div>
          <div class="legal-article-title">Droits des personnes concernées</div>
          <div class="legal-article-text">
            Conformément au RGPD, vous disposez d'un droit d'<strong>accès</strong>, de <strong>rectification</strong>,
            d'<strong>effacement</strong>, de <strong>portabilité</strong> et d'<strong>opposition</strong>.
            Contact : <strong>privacy@drify.fr</strong> · Réclamation non traitée : <strong>CNIL — cnil.fr</strong>
          </div>
        </div>

        <div class="legal-article">
          <div class="legal-article-num">Article 5</div>
          <div class="legal-article-title">Sécurité &amp; hébergement</div>
          <div class="legal-article-text">
            Données transmises via HTTPS/TLS 1.3. Documents stockés chiffrés (AES-256) sur infrastructure Supabase (UE).
            Accès restreint aux seules personnes habilitées. Ce dossier est strictement confidentiel — usage locatif exclusif.
          </div>
        </div>
      </div>

      <div class="legal-auth">
        <div class="legal-auth-title">Authenticité du document</div>
        <div class="legal-auth-text">
          Ce dossier a été généré automatiquement le <strong style="color:var(--beg)">${data.dossier.date_generation}</strong> par la plateforme Drify.<br>
          Pour vérifier l'authenticité, contactez <strong style="color:var(--beg)">verify@drify.fr</strong> avec la référence ci-dessous.
        </div>
        <div class="legal-auth-ref">${data.dossier.reference}</div>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-legal">
        Drify · drify.vercel.app · privacy@drify.fr · CNIL<br>
        Réf. ${data.dossier.reference} · ${data.dossier.date_generation}
      </div>
      <div class="footer-page-num">${lastPageNum}</div>
    </div>
  </div>

</body>
</html>`;
}
