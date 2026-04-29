// Script de test local — génère un PDF avec données fictives
import { generateDossierHTML } from '../lib/pdf/dossier-template.ts'
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'fs'

const testData = {
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
    { type: 'piece_identite',        label: "Pièce d'identité",          statut: 'verifie',    url: undefined,   mime_type: 'image/jpeg' },
    { type: 'justificatif_domicile', label: 'Justificatif de domicile',  statut: 'verifie',    url: undefined,   mime_type: 'image/png' },
    { type: 'bulletin_salaire',      label: 'Bulletin de salaire — Fév', statut: 'verifie',    url: undefined,   mime_type: 'image/jpeg' },
    { type: 'bulletin_salaire',      label: 'Bulletin de salaire — Mars',statut: 'verifie',    url: undefined,   mime_type: 'image/jpeg' },
    { type: 'avis_imposition',       label: "Avis d'imposition 2025",    statut: 'verifie',    url: undefined,   mime_type: 'image/png' },
    { type: 'quittance_loyer',       label: 'Quittances de loyer',       statut: 'non_fourni', url: undefined,   mime_type: undefined },
  ],
}

console.log('⏳ Génération du HTML...')
const html = generateDossierHTML(testData)
console.log(`✅ HTML généré — ${html.length} caractères`)

console.log('⏳ Lancement Puppeteer...')

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

let browser
try {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  console.log('✅ Puppeteer lancé')

  const page = await browser.newPage()
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: ['networkidle0', 'load'], timeout: 30000 })
  await page.evaluateHandle('document.fonts.ready')
  console.log('✅ HTML chargé dans Puppeteer')

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
  console.log(`✅ PDF généré — ${pdf.length} octets`)

  const outPath = '/tmp/test-dossier-drify.pdf'
  writeFileSync(outPath, pdf)
  console.log(`✅ Fichier sauvegardé : ${outPath}`)
  console.log('🎉 Succès total — ouvre le PDF pour vérifier le rendu')
} catch (err) {
  console.error('❌ Erreur :', err.message)
  console.error(err.stack)
} finally {
  if (browser) await browser.close()
}
