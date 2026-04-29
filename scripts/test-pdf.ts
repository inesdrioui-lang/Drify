import { generateDossierHTML, DossierTemplateData } from '../lib/pdf/dossier-template'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { writeFileSync } from 'fs'

const testData: DossierTemplateData = {
  candidat: {
    prenom: 'Sophie',
    nom: 'Martin',
    email: 'sophie.martin@email.fr',
    telephone: '06 12 34 56 78',
    adresse_actuelle: '12 rue des Lilas, 75011 Paris',
    situation_professionnelle: 'CDI — Ingénieure logicielle',
    revenus_mensuels_nets: 3800,
    nom_employeur: 'TechCorp SAS',
  },
  dossier: {
    reference: 'DRF-2026-TEST-A1B2',
    date_generation: '28 avril 2026',
    taux_effort: 28,
    score_confiance: 87,
  },
  documents: [
    { type: 'piece_identite',        label: "Pièce d'identité",           statut: 'verifie',    mime_type: 'image/jpeg' },
    { type: 'justificatif_domicile', label: 'Justificatif de domicile',   statut: 'verifie',    mime_type: 'image/png' },
    { type: 'bulletin_salaire',      label: 'Bulletin de salaire — Fév',  statut: 'verifie',    mime_type: 'image/jpeg' },
    { type: 'bulletin_salaire',      label: 'Bulletin de salaire — Mars', statut: 'verifie',    mime_type: 'image/jpeg' },
    { type: 'avis_imposition',       label: "Avis d'imposition 2025",     statut: 'verifie',    mime_type: 'image/png' },
    { type: 'quittance_loyer',       label: 'Quittances de loyer',        statut: 'non_fourni' },
  ],
}

async function main() {
  console.log('⏳ Génération du HTML...')
  const html = generateDossierHTML(testData)
  console.log(`✅ HTML généré — ${html.length} caractères`)

  // En local macOS : utilise le Chromium embarqué dans le package puppeteer
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const executablePath: string = require('puppeteer').executablePath()
  console.log('⏳ Lancement Puppeteer avec Chromium :', executablePath)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    console.log('✅ Puppeteer lancé')

    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: ['networkidle0', 'load'], timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')
    console.log('✅ HTML chargé dans Puppeteer (fonts prêtes)')

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    const buf = Buffer.from(pdf)
    console.log(`✅ PDF généré — ${buf.length} octets (${(buf.length / 1024).toFixed(1)} Ko)`)

    const outPath = '/tmp/test-dossier-drify.pdf'
    writeFileSync(outPath, buf)
    console.log(`✅ Fichier sauvegardé : ${outPath}`)
    console.log('🎉 Succès — ouvre le fichier pour vérifier le rendu')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('❌ Erreur :', err.message)
  console.error(err.stack)
  process.exit(1)
})
