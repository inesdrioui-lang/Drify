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
    .map(() => `<div class="watermark-item">CONFIDENTIEL — DRIFY</div>`)
    .join('');
}

function buildDocPages(data: DossierTemplateData): string {
  const verifiedDocs = data.documents.filter((d) => d.statut === 'verifie' && d.url);
  return verifiedDocs
    .map(
      (doc, index) => `
  <div class="page">
    <div class="watermark" aria-hidden="true">
      <div class="watermark-grid">${buildWatermarkItems(60)}</div>
    </div>
    <div class="doc-header">
      <div class="doc-header-logo">
        <img src="https://drify.vercel.app/logo.svg" alt="Drify" />
        <span class="logo-text">Drify</span>
      </div>
      <div class="doc-header-title">${doc.label}</div>
      <div class="doc-header-meta">
        ${data.candidat.prenom} ${data.candidat.nom}<br>
        Réf. ${data.dossier.reference}
      </div>
    </div>
    <div class="doc-subheader">
      <span class="doc-subheader-type">${doc.label}</span>
      <span class="doc-subheader-right">Dossier de location — Usage exclusif immobilier</span>
    </div>
    <div class="doc-content">
      ${
        doc.mime_type?.startsWith('image/')
          ? `<img class="doc-image" src="${doc.url}" alt="${doc.label}" />`
          : `<div class="doc-placeholder">
               <div class="doc-placeholder-icon">📄</div>
               <div>${doc.label}</div>
               <div style="font-size:8px;color:var(--beige-dark)">Document PDF — voir fichier joint</div>
             </div>`
      }
    </div>
    <div class="doc-footer">
      <div class="doc-footer-left">
        Drify — Dossier de location numérique | Généré le ${data.dossier.date_generation}<br>
        Document confidentiel soumis au RGPD. Durée de conservation : 3 ans. privacy@drify.fr
      </div>
      <div class="doc-footer-page">${index + 2}</div>
    </div>
  </div>`
    )
    .join('');
}

export function generateDossierHTML(data: DossierTemplateData): string {
  const verifiedCount = data.documents.filter((d) => d.statut === 'verifie' && d.url).length;
  const lastPageNum = verifiedCount + 2;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier de location — ${data.candidat.prenom} ${data.candidat.nom}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --brown-dark:   #3B2314;
      --brown:        #6B3F26;
      --brown-light:  #A0673A;
      --beige-dark:   #D4B896;
      --beige:        #EDE0CF;
      --beige-light:  #F7F2EA;
      --white:        #FFFFFF;
      --black:        #0F0F0F;
      --black-muted:  #4A4A4A;
      --success:      #4A7C59;
      --error:        #9B3A2A;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      color: var(--black);
      background: white;
      width: 210mm;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }

    @media print {
      .page { page-break-after: always; }
    }

    /* Filigrane */
    .watermark {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }
    .watermark-grid {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      transform: rotate(-45deg);
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 40px 20px;
      align-content: start;
    }
    .watermark-item {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: rgba(59, 35, 20, 0.055);
      white-space: nowrap;
      padding: 30px 0;
    }

    /* Header pages doc */
    .doc-header {
      background: var(--brown-dark);
      padding: 7mm 12mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .doc-header-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .doc-header-logo img {
      height: 22px;
      width: auto;
      filter: brightness(0) invert(1);
    }
    .logo-text {
      font-family: 'DM Serif Display', serif;
      font-size: 16px;
      color: var(--white);
      letter-spacing: 0.5px;
    }
    .doc-header-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: var(--beige);
      letter-spacing: 0.3px;
      text-align: center;
      flex: 1;
    }
    .doc-header-meta {
      text-align: right;
      font-size: 7.5px;
      color: var(--beige-dark);
      line-height: 1.6;
    }

    /* Bandeau sous header */
    .doc-subheader {
      background: var(--beige);
      padding: 3mm 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--beige-dark);
      position: relative;
      z-index: 10;
    }
    .doc-subheader-type {
      font-family: 'DM Sans', sans-serif;
      font-size: 8px;
      font-weight: 700;
      color: var(--brown);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .doc-subheader-right {
      font-size: 7.5px;
      color: var(--black-muted);
      font-style: italic;
    }

    /* Zone contenu document */
    .doc-content {
      position: relative;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8mm 12mm;
      min-height: 220mm;
    }
    .doc-image {
      max-width: 100%;
      max-height: 215mm;
      object-fit: contain;
      border-radius: 2px;
      box-shadow: 0 2px 12px rgba(59,35,20,0.12);
    }
    .doc-placeholder {
      width: 100%;
      height: 200mm;
      background: var(--beige-light);
      border: 1.5px dashed var(--beige-dark);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--black-muted);
      font-size: 10px;
    }
    .doc-placeholder-icon { font-size: 32px; opacity: 0.5; }

    /* Footer */
    .doc-footer {
      background: var(--beige-light);
      border-top: 0.5px solid var(--beige-dark);
      padding: 3.5mm 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }
    .doc-footer-left {
      font-size: 7px;
      color: var(--black-muted);
      line-height: 1.5;
    }
    .doc-footer-page {
      font-size: 8px;
      font-weight: 600;
      color: var(--brown-light);
      font-family: 'DM Serif Display', serif;
    }

    /* Couverture */
    .cover-page { background: var(--white); }
    .cover-hero {
      background: var(--brown-dark);
      padding: 10mm 14mm 12mm;
      position: relative;
      overflow: hidden;
    }
    .cover-hero::after {
      content: '';
      position: absolute;
      right: -30mm;
      top: -20mm;
      width: 80mm;
      height: 80mm;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    .cover-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6mm;
    }
    .cover-brand-logo { height: 28px; filter: brightness(0) invert(1); }
    .cover-brand-name {
      font-family: 'DM Serif Display', serif;
      font-size: 22px;
      color: var(--white);
    }
    .cover-brand-date {
      margin-left: auto;
      font-size: 8px;
      color: var(--beige-dark);
    }
    .cover-subtitle {
      font-size: 10px;
      color: var(--beige);
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 500;
      margin-bottom: 4mm;
    }
    .cover-divider {
      height: 1px;
      background: rgba(255,255,255,0.15);
      margin: 4mm 0;
    }
    .cover-candidat-name {
      font-family: 'DM Serif Display', serif;
      font-size: 26px;
      color: var(--white);
      margin-top: 3mm;
      letter-spacing: 0.3px;
    }
    .cover-candidat-job {
      font-size: 11px;
      color: var(--beige-dark);
      margin-top: 2mm;
      font-weight: 400;
    }
    .cover-body { padding: 7mm 14mm; }
    .cover-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5mm 8mm;
      margin-bottom: 6mm;
    }
    .cover-info-label {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--brown-light);
      margin-bottom: 1.5mm;
    }
    .cover-info-value {
      font-family: 'DM Serif Display', serif;
      font-size: 14px;
      color: var(--black);
    }
    .cover-info-value-small {
      font-size: 10px;
      color: var(--black);
      font-weight: 500;
    }
    .cover-score-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--brown-dark);
      color: var(--white);
      font-size: 8.5px;
      font-weight: 600;
      padding: 2mm 4mm;
      border-radius: 2px;
      margin-bottom: 5mm;
    }
    .cover-score-number {
      font-family: 'DM Serif Display', serif;
      font-size: 13px;
    }
    .cover-section-sep {
      height: 0.5px;
      background: var(--beige-dark);
      margin: 4mm 0;
    }
    .cover-docs-title {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--brown);
      margin-bottom: 4mm;
    }
    .cover-docs-card {
      background: var(--beige-light);
      border: 1px solid var(--beige-dark);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5mm;
    }
    .cover-doc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2.5mm 4mm;
      border-bottom: 0.5px solid var(--beige);
      font-size: 8.5px;
    }
    .cover-doc-row:last-child { border-bottom: none; }
    .cover-doc-label { color: var(--black); font-weight: 500; }
    .cover-doc-status { font-size: 7.5px; font-weight: 700; }
    .status-verifie   { color: var(--success); }
    .status-manquant  { color: var(--error); }
    .status-attente   { color: var(--brown-light); }
    .cover-legal-box {
      background: var(--beige);
      border: 1px solid var(--beige-dark);
      border-radius: 3px;
      padding: 4mm;
      margin-top: 4mm;
    }
    .cover-legal-title {
      font-size: 7.5px;
      font-weight: 700;
      color: var(--brown);
      margin-bottom: 2mm;
    }
    .cover-legal-text {
      font-size: 7px;
      color: var(--black-muted);
      line-height: 1.6;
    }

    /* Page mentions légales */
    .legal-page { background: var(--beige-light); }
    .legal-section { margin-bottom: 5mm; }
    .legal-section-title {
      background: var(--beige);
      border-left: 3px solid var(--brown);
      padding: 2mm 4mm;
      font-size: 7.5px;
      font-weight: 700;
      color: var(--brown-dark);
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }
    .legal-section-text {
      font-size: 8px;
      color: var(--black-muted);
      line-height: 1.65;
      padding: 0 4mm;
    }
    .legal-auth-box {
      border: 1.5px solid var(--beige-dark);
      border-radius: 3px;
      padding: 4mm;
      margin-top: 6mm;
      text-align: center;
    }
    .legal-auth-ref {
      font-family: 'DM Serif Display', serif;
      font-size: 13px;
      color: var(--brown-dark);
      margin-bottom: 2mm;
    }
    .legal-auth-hash {
      font-size: 7px;
      color: var(--black-muted);
      font-family: monospace;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>

  <!-- PAGE 1 — COUVERTURE -->
  <div class="page cover-page">
    <div class="cover-hero">
      <div class="cover-brand">
        <img class="cover-brand-logo" src="https://drify.vercel.app/logo.svg" alt="Drify" />
        <span class="cover-brand-name">Drify</span>
        <span class="cover-brand-date">Généré le ${data.dossier.date_generation}</span>
      </div>
      <div class="cover-subtitle">Dossier de location numérique</div>
      <div class="cover-divider"></div>
      <div class="cover-candidat-name">${data.candidat.prenom} ${data.candidat.nom.toUpperCase()}</div>
      <div class="cover-candidat-job">${data.candidat.situation_professionnelle}</div>
    </div>

    <div class="cover-body">
      ${
        data.dossier.score_confiance
          ? `<div class="cover-score-badge">
          Score de confiance Drify &nbsp;·&nbsp;
          <span class="cover-score-number">${data.dossier.score_confiance}/100</span>
        </div>`
          : ''
      }

      <div class="cover-info-grid">
        <div class="cover-info-item">
          <div class="cover-info-label">Revenus mensuels nets</div>
          <div class="cover-info-value">${data.candidat.revenus_mensuels_nets.toLocaleString('fr-FR')} €</div>
        </div>
        ${
          data.dossier.taux_effort
            ? `<div class="cover-info-item">
          <div class="cover-info-label">Taux d'effort estimé</div>
          <div class="cover-info-value">${data.dossier.taux_effort} %</div>
        </div>`
            : ''
        }
        <div class="cover-info-item">
          <div class="cover-info-label">Adresse actuelle</div>
          <div class="cover-info-value-small">${data.candidat.adresse_actuelle}</div>
        </div>
        <div class="cover-info-item">
          <div class="cover-info-label">Téléphone</div>
          <div class="cover-info-value-small">${data.candidat.telephone}</div>
        </div>
        ${
          data.candidat.nom_employeur
            ? `<div class="cover-info-item">
          <div class="cover-info-label">Employeur</div>
          <div class="cover-info-value-small">${data.candidat.nom_employeur}</div>
        </div>`
            : ''
        }
      </div>

      <div class="cover-section-sep"></div>

      <div class="cover-docs-title">📋 Documents inclus dans ce dossier</div>
      <div class="cover-docs-card">
        ${data.documents
          .map(
            (doc) => `
        <div class="cover-doc-row">
          <span class="cover-doc-label">
            ${doc.statut === 'verifie' ? '✓' : doc.statut === 'non_fourni' ? '—' : '◷'}
            &nbsp;${doc.label}
          </span>
          <span class="cover-doc-status ${
            doc.statut === 'verifie'
              ? 'status-verifie'
              : doc.statut === 'non_fourni'
                ? 'status-manquant'
                : 'status-attente'
          }">
            ${
              doc.statut === 'verifie'
                ? 'Vérifié'
                : doc.statut === 'non_fourni'
                  ? 'Non fourni'
                  : 'En attente'
            }
          </span>
        </div>`
          )
          .join('')}
      </div>

      <div class="cover-legal-box">
        <div class="cover-legal-title">🔒 Confidentialité &amp; Protection des données</div>
        <div class="cover-legal-text">
          Ce dossier a été généré automatiquement par Drify (drify.vercel.app) et est destiné exclusivement à la recherche d'un logement.
          Il est protégé par le RGPD (Règlement UE 2016/679). Toute reproduction ou diffusion à d'autres fins est interdite.
          Durée de conservation : 3 ans max. Droits &amp; contact DPO : privacy@drify.fr — CNIL : www.cnil.fr
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <div class="doc-footer-left">
        Réf. ${data.dossier.reference}<br>
        drify.vercel.app
      </div>
      <div class="doc-footer-page">1</div>
    </div>
  </div>

  <!-- PAGES DOCUMENTS -->
  ${buildDocPages(data)}

  <!-- DERNIÈRE PAGE — MENTIONS LÉGALES -->
  <div class="page legal-page">
    <div class="watermark" aria-hidden="true">
      <div class="watermark-grid">${buildWatermarkItems(60)}</div>
    </div>

    <div class="doc-header">
      <div class="doc-header-logo">
        <img src="https://drify.vercel.app/logo.svg" alt="Drify" />
        <span class="logo-text">Drify</span>
      </div>
      <div class="doc-header-title">Mentions légales &amp; Protection des données</div>
      <div class="doc-header-meta">Réf. ${data.dossier.reference}</div>
    </div>

    <div style="padding: 7mm 14mm; position: relative; z-index: 5;">
      <div class="legal-section">
        <div class="legal-section-title">1. Responsable du traitement</div>
        <div class="legal-section-text">
          Drify (drify.vercel.app) est responsable du traitement des données personnelles.
          Délégué à la protection des données (DPO) : <strong>privacy@drify.fr</strong>
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">2. Finalité du traitement</div>
        <div class="legal-section-text">
          Les données collectées sont traitées exclusivement à des fins de constitution de dossier de location immobilière
          et de mise en relation avec des propriétaires bailleurs. Aucune cession à des tiers non autorisés (Art. 6.1.b RGPD).
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">3. Base légale (RGPD)</div>
        <div class="legal-section-text">
          Art. 6.1.b — Exécution d'un contrat (mise en relation locataire/propriétaire)<br>
          Art. 6.1.a — Consentement explicite du candidat à la location
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">4. Durée de conservation</div>
        <div class="legal-section-text">
          Maximum <strong>3 ans</strong> après le dernier contact ou fin de la relation contractuelle.
          Suppression sur demande : privacy@drify.fr — Réponse sous 30 jours calendaires.
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">5. Droits des personnes concernées</div>
        <div class="legal-section-text">
          Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'<strong>accès</strong>,
          de <strong>rectification</strong>, d'<strong>effacement</strong>, de <strong>portabilité</strong> et
          d'<strong>opposition</strong>.<br>
          Pour exercer ces droits : <strong>privacy@drify.fr</strong><br>
          En cas de réclamation non traitée : <strong>CNIL — www.cnil.fr</strong>
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">6. Sécurité des données</div>
        <div class="legal-section-text">
          Données transmises via canaux chiffrés HTTPS/TLS 1.3.
          Documents stockés de manière chiffrée (AES-256) sur infrastructure Supabase (EU).
          Accès restreint aux seules personnes habilitées.
        </div>
      </div>
      <div class="legal-section">
        <div class="legal-section-title">7. Confidentialité du dossier</div>
        <div class="legal-section-text">
          Ce dossier est strictement confidentiel. Il est destiné exclusivement aux propriétaires ou agents immobiliers
          dans le cadre d'une candidature à la location. Toute reproduction, diffusion ou utilisation à d'autres fins
          est interdite et susceptible de constituer une violation du RGPD.
        </div>
      </div>

      <div class="legal-auth-box">
        <div class="legal-auth-ref">Authenticité du document</div>
        <div class="legal-section-text" style="margin-bottom:3mm;">
          Ce dossier a été généré automatiquement le <strong>${data.dossier.date_generation}</strong> par la plateforme Drify.<br>
          Pour vérifier l'authenticité de ce document, contactez <strong>verify@drify.fr</strong> en mentionnant la référence ci-dessous.
        </div>
        <div class="legal-auth-hash">${data.dossier.reference}</div>
      </div>
    </div>

    <div class="doc-footer">
      <div class="doc-footer-left">
        Drify — drify.vercel.app | privacy@drify.fr | CNIL<br>
        Réf. ${data.dossier.reference} — ${data.dossier.date_generation}
      </div>
      <div class="doc-footer-page">${lastPageNum}</div>
    </div>
  </div>

</body>
</html>`;
}
