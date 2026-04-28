import { createClient } from '@supabase/supabase-js'

export interface DossierDocument {
  type: string
  label: string
  statut: 'verifie' | 'non_fourni' | 'en_attente'
  url?: string
  mime_type?: string
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
  }
  dossier: {
    reference: string
    date_generation: string
    taux_effort?: number
    score_confiance?: number
  }
  documents: DossierDocument[]
}

export function generateDossierHTML(data: DossierTemplateData): string {
  const { candidat, dossier, documents } = data
  const nomComplet = `${candidat.prenom} ${candidat.nom.toUpperCase()}`
  const revenus = candidat.revenus_mensuels_nets.toLocaleString('fr-FR') + ' €'

  const documentsVerifies = documents.filter(d => d.statut === 'verifie' && d.url)

  const watermarkGrid = Array(80).fill('<div class="wm">CONFIDENTIEL — DRIFY</div>').join('')

  const docPages = documentsVerifies.map((doc, i) => `
    <div class="page doc-page">
      <div class="watermark"><div class="wm-grid">${watermarkGrid}</div></div>
      <header class="header">
        <div class="header-left">
          <img src="https://drify.vercel.app/logo.svg" class="logo" alt="Drify" />
          <span class="brand">Drify</span>
        </div>
        <div class="header-center">${doc.label}</div>
        <div class="header-right">
          ${nomComplet}<br/>
          <span class="ref">Réf. ${dossier.reference}</span>
        </div>
      </header>
      <div class="doc-band">${doc.label.toUpperCase()} — USAGE EXCLUSIF IMMOBILIER</div>
      <div class="doc-body">
        ${doc.mime_type?.startsWith('image/') ? `
          <img src="${doc.url}" class="doc-img" alt="${doc.label}" />
        ` : `
          <div class="doc-placeholder">
            <div class="placeholder-icon">📄</div>
            <div class="placeholder-label">${doc.label}</div>
            <div class="placeholder-sub">Document PDF — voir fichier joint</div>
          </div>
        `}
      </div>
      <footer class="footer">
        <div class="footer-left">
          Drify — Dossier de location | Généré le ${dossier.date_generation}<br/>
          <span class="footer-legal">Document confidentiel · RGPD · Durée de conservation 3 ans · privacy@drify.fr</span>
        </div>
        <div class="footer-page">${i + 2}</div>
      </footer>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bd:#3B2314;--bm:#6B3F26;--bl:#A0673A;
  --bd2:#D4B896;--b:#EDE0CF;--bl2:#F7F2EA;
  --w:#FFFFFF;--k:#0F0F0F;--km:#4A4A4A;
  --ok:#4A7C59;--err:#9B3A2A;
}
body{font-family:'DM Sans',sans-serif;font-size:10pt;background:#fff;width:210mm}
.page{width:210mm;min-height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff}

/* WATERMARK */
.watermark{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
.wm-grid{
  position:absolute;top:-60%;left:-60%;width:220%;height:220%;
  display:grid;grid-template-columns:repeat(4,1fr);gap:48px 8px;
  transform:rotate(-45deg);align-content:start;
}
.wm{
  font-family:'DM Sans',sans-serif;font-size:9pt;font-weight:700;
  letter-spacing:2px;color:rgba(59,35,20,0.055);white-space:nowrap;padding:28px 0;
}

/* HEADER */
.header{
  background:var(--bd);padding:5mm 10mm;
  display:flex;align-items:center;justify-content:space-between;
  position:relative;z-index:10;
}
.header-left{display:flex;align-items:center;gap:8px}
.logo{height:20px;width:auto;filter:brightness(0) invert(1)}
.brand{font-family:'DM Serif Display',serif;font-size:15pt;color:#fff}
.header-center{
  font-size:10pt;font-weight:600;color:var(--b);
  flex:1;text-align:center;padding:0 8mm;
}
.header-right{font-size:7pt;color:var(--bd2);text-align:right;line-height:1.5}
.ref{font-size:6.5pt}

/* BANDEAU DOC */
.doc-band{
  background:var(--b);border-bottom:1px solid var(--bd2);
  padding:2mm 10mm;font-size:7.5pt;font-weight:700;
  color:var(--bm);letter-spacing:1px;
  display:flex;justify-content:space-between;
  position:relative;z-index:10;
}

/* CORPS DOC */
.doc-body{
  display:flex;align-items:center;justify-content:center;
  padding:6mm 10mm;min-height:228mm;
  position:relative;z-index:5;
}
.doc-img{max-width:100%;max-height:220mm;object-fit:contain;box-shadow:0 2px 16px rgba(59,35,20,0.13);border-radius:2px}
.doc-placeholder{
  width:100%;height:200mm;background:var(--bl2);
  border:1.5px dashed var(--bd2);border-radius:4px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  color:var(--km);
}
.placeholder-icon{font-size:28pt;opacity:.4}
.placeholder-label{font-size:11pt;font-weight:600;color:var(--k)}
.placeholder-sub{font-size:8pt;color:var(--bd2)}

/* FOOTER */
.footer{
  background:var(--bl2);border-top:.5px solid var(--bd2);
  padding:3mm 10mm;display:flex;justify-content:space-between;align-items:center;
  position:absolute;bottom:0;left:0;right:0;z-index:10;
}
.footer-left{font-size:6.5pt;color:var(--km);line-height:1.5}
.footer-legal{font-size:6pt;color:var(--bd2)}
.footer-page{font-family:'DM Serif Display',serif;font-size:10pt;color:var(--bl)}

/* ══ COUVERTURE ══ */
.cover-hero{
  background:var(--bd);padding:9mm 12mm 10mm;position:relative;overflow:hidden;
}
.cover-hero::after{
  content:'';position:absolute;right:-25mm;top:-15mm;
  width:70mm;height:70mm;border-radius:50%;background:rgba(255,255,255,0.04);
}
.cover-brand{display:flex;align-items:center;gap:10px;margin-bottom:5mm}
.cover-logo{height:26px;filter:brightness(0) invert(1)}
.cover-brand-name{font-family:'DM Serif Display',serif;font-size:20pt;color:#fff}
.cover-brand-date{margin-left:auto;font-size:7pt;color:var(--bd2)}
.cover-subtitle{font-size:8pt;color:var(--b);letter-spacing:2px;text-transform:uppercase;font-weight:500}
.cover-divider{height:1px;background:rgba(255,255,255,0.15);margin:4mm 0}
.cover-name{font-family:'DM Serif Display',serif;font-size:22pt;color:#fff;margin-top:2mm}
.cover-job{font-size:10pt;color:var(--bd2);margin-top:1.5mm}

.cover-body{padding:6mm 12mm}
.cover-score{
  display:inline-flex;align-items:center;gap:6px;
  background:var(--bd);color:#fff;font-size:8pt;font-weight:600;
  padding:2mm 4mm;border-radius:2px;margin-bottom:4mm;
}
.score-num{font-family:'DM Serif Display',serif;font-size:12pt}

.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm;margin-bottom:4mm}
.info-label{font-size:6.5pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bl);margin-bottom:1mm}
.info-val{font-family:'DM Serif Display',serif;font-size:13pt;color:var(--k)}
.info-val-sm{font-size:9pt;font-weight:500;color:var(--k)}

.sep{height:.5px;background:var(--bd2);margin:3mm 0}

.docs-title{font-size:7pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bm);margin-bottom:3mm}
.docs-card{background:var(--bl2);border:1px solid var(--bd2);border-radius:3px;overflow:hidden;margin-bottom:4mm}
.doc-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:2mm 4mm;border-bottom:.5px solid var(--b);font-size:8pt;
}
.doc-row:last-child{border-bottom:none}
.doc-name{color:var(--k);font-weight:500}
.s-ok{color:var(--ok);font-size:7pt;font-weight:700}
.s-no{color:var(--err);font-size:7pt;font-weight:700}
.s-wait{color:var(--bl);font-size:7pt;font-weight:700}

.legal-box{background:var(--b);border:1px solid var(--bd2);border-radius:3px;padding:3.5mm;margin-top:3mm}
.legal-title{font-size:7pt;font-weight:700;color:var(--bm);margin-bottom:1.5mm}
.legal-text{font-size:6.5pt;color:var(--km);line-height:1.6}

/* ══ PAGE LÉGALE ══ */
.legal-page{background:var(--bl2)}
.legal-body{padding:6mm 12mm;position:relative;z-index:5}
.legal-section{margin-bottom:4mm}
.legal-sec-title{
  background:var(--b);border-left:3px solid var(--bm);
  padding:1.5mm 3mm;font-size:7pt;font-weight:700;
  color:var(--bd);letter-spacing:.8px;text-transform:uppercase;margin-bottom:1.5mm;
}
.legal-sec-text{font-size:7.5pt;color:var(--km);line-height:1.65;padding:0 3mm}
.legal-auth{border:1.5px solid var(--bd2);border-radius:3px;padding:4mm;margin-top:5mm;text-align:center}
.legal-auth-title{font-family:'DM Serif Display',serif;font-size:12pt;color:var(--bd);margin-bottom:2mm}
.legal-auth-ref{font-size:7pt;color:var(--km);font-family:monospace;letter-spacing:1px}
</style>
</head>
<body>

<!-- ══ PAGE 1 : COUVERTURE ══ -->
<div class="page">
  <div class="cover-hero">
    <div class="cover-brand">
      <img src="https://drify.vercel.app/logo.svg" class="cover-logo" alt="Drify"/>
      <span class="cover-brand-name">Drify</span>
      <span class="cover-brand-date">Généré le ${dossier.date_generation}</span>
    </div>
    <div class="cover-subtitle">Dossier de location numérique</div>
    <div class="cover-divider"></div>
    <div class="cover-name">${nomComplet}</div>
    <div class="cover-job">${candidat.situation_professionnelle}</div>
  </div>

  <div class="cover-body">
    ${dossier.score_confiance ? `
    <div class="cover-score">
      Score de confiance Drify &nbsp;·&nbsp;
      <span class="score-num">${dossier.score_confiance}/100</span>
    </div>` : ''}

    <div class="info-grid">
      <div>
        <div class="info-label">Revenus mensuels nets</div>
        <div class="info-val">${revenus}</div>
      </div>
      ${dossier.taux_effort ? `
      <div>
        <div class="info-label">Taux d'effort estimé</div>
        <div class="info-val">${dossier.taux_effort} %</div>
      </div>` : ''}
      <div>
        <div class="info-label">Adresse actuelle</div>
        <div class="info-val-sm">${candidat.adresse_actuelle}</div>
      </div>
      <div>
        <div class="info-label">Téléphone</div>
        <div class="info-val-sm">${candidat.telephone}</div>
      </div>
      ${candidat.nom_employeur ? `
      <div>
        <div class="info-label">Employeur</div>
        <div class="info-val-sm">${candidat.nom_employeur}</div>
      </div>` : ''}
    </div>

    <div class="sep"></div>

    <div class="docs-title">📋 Documents inclus dans ce dossier</div>
    <div class="docs-card">
      ${documents.map(doc => `
      <div class="doc-row">
        <span class="doc-name">
          ${doc.statut === 'verifie' ? '✓' : doc.statut === 'non_fourni' ? '—' : '◷'}
          &nbsp;${doc.label}
        </span>
        <span class="${doc.statut === 'verifie' ? 's-ok' : doc.statut === 'non_fourni' ? 's-no' : 's-wait'}">
          ${doc.statut === 'verifie' ? 'Vérifié' : doc.statut === 'non_fourni' ? 'Non fourni' : 'En attente'}
        </span>
      </div>`).join('')}
    </div>

    <div class="legal-box">
      <div class="legal-title">🔒 Confidentialité & Protection des données</div>
      <div class="legal-text">
        Ce dossier a été généré par Drify (drify.vercel.app), exclusivement pour la recherche d'un logement.
        Protégé par le RGPD (UE 2016/679). Toute diffusion à d'autres fins est interdite.
        Conservation : 3 ans max. DPO : privacy@drify.fr — CNIL : www.cnil.fr
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-left">Réf. ${dossier.reference}<br/>drify.vercel.app</div>
    <div class="footer-page">1</div>
  </footer>
</div>

<!-- ══ PAGES DOCUMENTS ══ -->
${docPages}

<!-- ══ PAGE LÉGALE ══ -->
<div class="page legal-page">
  <div class="watermark"><div class="wm-grid">${watermarkGrid}</div></div>
  <header class="header">
    <div class="header-left">
      <img src="https://drify.vercel.app/logo.svg" class="logo" alt="Drify"/>
      <span class="brand">Drify</span>
    </div>
    <div class="header-center">Mentions légales & Protection des données</div>
    <div class="header-right"><span class="ref">Réf. ${dossier.reference}</span></div>
  </header>

  <div class="legal-body">
    <div class="legal-section">
      <div class="legal-sec-title">1. Responsable du traitement</div>
      <div class="legal-sec-text">Drify (drify.vercel.app) · DPO : <strong>privacy@drify.fr</strong></div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">2. Finalité du traitement</div>
      <div class="legal-sec-text">Données traitées exclusivement pour la constitution du dossier de location et la mise en relation locataire/propriétaire. Aucune utilisation commerciale ni cession à des tiers non autorisés.</div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">3. Base légale (RGPD)</div>
      <div class="legal-sec-text">Art. 6.1.b — Exécution d'un contrat · Art. 6.1.a — Consentement explicite du candidat</div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">4. Durée de conservation</div>
      <div class="legal-sec-text">Maximum <strong>3 ans</strong> après fin de la relation contractuelle. Suppression sur demande sous 30 jours : privacy@drify.fr</div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">5. Droits des personnes</div>
      <div class="legal-sec-text">Accès · Rectification · Effacement · Portabilité · Opposition<br/>Réclamation : <strong>CNIL — www.cnil.fr</strong></div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">6. Sécurité</div>
      <div class="legal-sec-text">Transmission HTTPS/TLS 1.3 · Stockage chiffré AES-256 (Supabase EU) · Accès restreint aux personnes habilitées</div>
    </div>
    <div class="legal-section">
      <div class="legal-sec-title">7. Confidentialité</div>
      <div class="legal-sec-text">Document strictement confidentiel, destiné exclusivement aux propriétaires et agents immobiliers dans le cadre d'une candidature à la location.</div>
    </div>

    <div class="legal-auth">
      <div class="legal-auth-title">Authenticité du document</div>
      <div class="legal-sec-text" style="margin-bottom:2mm">
        Généré le <strong>${dossier.date_generation}</strong> par Drify.
        Pour vérifier ce document : <strong>verify@drify.fr</strong>
      </div>
      <div class="legal-auth-ref">${dossier.reference}</div>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-left">Drify · drify.vercel.app · privacy@drify.fr · CNIL<br/>
    <span class="footer-legal">Réf. ${dossier.reference} — ${dossier.date_generation}</span></div>
    <div class="footer-page">${documentsVerifies.length + 2}</div>
  </footer>
</div>

</body>
</html>`
}
