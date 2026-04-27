export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb, degrees, StandardFonts, PDFPage, PDFFont } from 'pdf-lib'

// A4 in points
const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 50

const BRAND      = rgb(61 / 255, 46 / 255, 34 / 255)   // #3D2E22
const CREAM      = rgb(251 / 255, 245 / 255, 235 / 255) // #FBF5EB
const GRAY       = rgb(0.55, 0.48, 0.44)
const LIGHT_LINE = rgb(0.85, 0.80, 0.75)
const WM_COLOR   = rgb(0.60, 0.50, 0.40)

const DOC_LABELS: Record<string, string> = {
  identite:              "Pièce d'identité",
  justificatif_domicile: 'Justificatif de domicile',
  certificat_scolarite:  'Certificat de scolarité',
  carte_etudiant:        'Carte étudiante',
  bourse:                'Justificatif de bourse',
  avis_imposition:       "Avis d'imposition",
  kbis:                  'Extrait Kbis / Statuts',
  bilans:                'Bilans comptables',
  pension:               'Justificatif de pension',
  contrat_travail:       'Contrat de travail',
  bulletins_salaire:     'Bulletins de salaire',
  attestation_employeur: "Attestation d'employeur",
  autres:                'Autres documents',
}

const SIT_LABELS: Record<string, string> = {
  salarie_cdi:  'Salarié CDI',
  salarie_cdd:  'Salarié CDD',
  fonctionnaire:'Fonctionnaire',
  independant:  'Indépendant / Freelance',
  etudiant:     'Étudiant(e)',
  retraite:     'Retraité(e)',
  sans_emploi:  'Sans emploi',
}

function frDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function addWatermark(page: PDFPage, font: PDFFont) {
  const { width, height } = page.getSize()
  const text = 'Document exclusif location immobilière — Drify'
  const size = 13
  page.drawText(text, {
    x: width / 2 - font.widthOfTextAtSize(text, size) / 2,
    y: height / 2,
    size,
    font,
    color: WM_COLOR,
    opacity: 0.18,
    rotate: degrees(45),
  })
}

function addPageHeader(page: PDFPage, label: string, font: PDFFont, boldFont: PDFFont) {
  const { width, height } = page.getSize()
  page.drawRectangle({ x: 0, y: height - 36, width, height: 36, color: BRAND })
  page.drawText('Drify', { x: MARGIN, y: height - 24, size: 11, font: boldFont, color: CREAM })
  const tw = boldFont.widthOfTextAtSize(label, 9)
  page.drawText(label, { x: width - MARGIN - tw, y: height - 24, size: 9, font: boldFont, color: CREAM })
}

async function addCoverPage(
  pdfDoc: PDFDocument,
  profile: Record<string, unknown> | null,
  font: PDFFont,
  boldFont: PDFFont
) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  // Header bar
  page.drawRectangle({ x: 0, y: PAGE_H - 160, width: PAGE_W, height: 160, color: BRAND })
  page.drawText('DRIFY', { x: MARGIN, y: PAGE_H - 90, size: 40, font: boldFont, color: CREAM })
  page.drawText('Dossier de location numérique', {
    x: MARGIN, y: PAGE_H - 122, size: 13, font, color: rgb(0.80, 0.76, 0.72),
  })
  page.drawText(`Généré le ${frDate(new Date())}`, {
    x: MARGIN, y: PAGE_H - 142, size: 9, font, color: rgb(0.65, 0.60, 0.56),
  })

  // Tenant name
  const firstName = String(profile?.prenom ?? '')
  const lastName  = String(profile?.nom ?? '').toUpperCase()
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Locataire'
  page.drawText(name, { x: MARGIN, y: PAGE_H - 220, size: 28, font: boldFont, color: BRAND })

  page.drawLine({
    start: { x: MARGIN,       y: PAGE_H - 242 },
    end:   { x: PAGE_W - MARGIN, y: PAGE_H - 242 },
    thickness: 1, color: LIGHT_LINE,
  })

  // Profile summary
  const items: [string, string][] = []
  if (profile?.situation_pro)   items.push(['Situation professionnelle', SIT_LABELS[String(profile.situation_pro)] ?? String(profile.situation_pro)])
  if (profile?.revenus_mensuels) items.push(['Revenus mensuels nets',   `${Number(profile.revenus_mensuels).toLocaleString('fr-FR')} €`])
  if (profile?.loyer_cible)      items.push(['Loyer cible',             `${Number(profile.loyer_cible).toLocaleString('fr-FR')} €/mois`])
  if (profile?.adresse_actuelle) items.push(['Adresse actuelle',        String(profile.adresse_actuelle)])
  if (profile?.telephone)        items.push(['Téléphone',               String(profile.telephone)])

  let y = PAGE_H - 270
  for (const [label, value] of items) {
    page.drawText(label, { x: MARGIN,       y, size: 9,  font,      color: GRAY  })
    page.drawText(value, { x: MARGIN + 190, y, size: 9,  font: boldFont, color: BRAND })
    y -= 20
  }

  // Confidentiality box
  page.drawRectangle({
    x: MARGIN, y: 50,
    width: PAGE_W - MARGIN * 2, height: 58,
    color: CREAM,
    borderColor: LIGHT_LINE, borderWidth: 1,
  })
  page.drawText('Document confidentiel — Usage exclusif location immobilière', {
    x: MARGIN + 14, y: 88, size: 9, font: boldFont, color: BRAND,
  })
  page.drawText('Ce dossier a été généré automatiquement par Drify et est destiné exclusivement', {
    x: MARGIN + 14, y: 72, size: 8, font, color: GRAY,
  })
  page.drawText('à la recherche d\'un logement. Toute autre utilisation est interdite.', {
    x: MARGIN + 14, y: 60, size: 8, font, color: GRAY,
  })
}

async function addSectionPage(
  pdfDoc: PDFDocument,
  title: string,
  font: PDFFont,
  boldFont: PDFFont,
  person?: { prenom?: string; nom?: string; lien?: string; situation_pro?: string; revenus_mensuels?: number } | null
) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  page.drawRectangle({ x: 0, y: PAGE_H - 36,  width: PAGE_W, height: 36,  color: BRAND })
  page.drawText('Drify', { x: MARGIN, y: PAGE_H - 24, size: 11, font: boldFont, color: CREAM })

  page.drawRectangle({ x: 0, y: PAGE_H - 155, width: PAGE_W, height: 119, color: CREAM })
  page.drawText(title, { x: MARGIN, y: PAGE_H - 100, size: 22, font: boldFont, color: BRAND })

  if (person) {
    const line = [person.prenom, person.nom?.toUpperCase(), person.lien ? `(${person.lien})` : '']
      .filter(Boolean).join(' ')
    page.drawText(line, { x: MARGIN, y: PAGE_H - 126, size: 11, font, color: GRAY })
    if (person.revenus_mensuels) {
      page.drawText(`Revenus : ${person.revenus_mensuels.toLocaleString('fr-FR')} €/mois`, {
        x: MARGIN, y: PAGE_H - 142, size: 9, font, color: GRAY,
      })
    }
  }

  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - 170 },
    end:   { x: PAGE_W - MARGIN, y: PAGE_H - 170 },
    thickness: 1, color: LIGHT_LINE,
  })
}

async function embedImagePage(
  pdfDoc: PDFDocument,
  buffer: Buffer,
  mimeType: 'jpeg' | 'png',
  label: string,
  font: PDFFont,
  boldFont: PDFFont
) {
  const image = mimeType === 'jpeg'
    ? await pdfDoc.embedJpg(buffer)
    : await pdfDoc.embedPng(buffer)

  const availW = PAGE_W - MARGIN * 2
  const availH = PAGE_H - 36 - MARGIN - 10
  const scaled = image.scaleToFit(availW, availH)

  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  addPageHeader(page, label, font, boldFont)

  const x = (PAGE_W - scaled.width) / 2
  const y = (PAGE_H - 36 - scaled.height) / 2
  page.drawImage(image, { x, y, width: scaled.width, height: scaled.height })
  addWatermark(page, font)
}

function addPlaceholderPage(
  pdfDoc: PDFDocument,
  label: string,
  note: string,
  font: PDFFont,
  boldFont: PDFFont
) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  addPageHeader(page, label, font, boldFont)
  page.drawText(label, { x: MARGIN, y: PAGE_H / 2 + 20, size: 14, font: boldFont, color: BRAND })
  page.drawText(note,  { x: MARGIN, y: PAGE_H / 2,       size: 10, font,           color: GRAY  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addDocumentPages(
  pdfDoc: PDFDocument,
  doc: { nom: string; categorie: string; fichier_path: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  font: PDFFont,
  boldFont: PDFFont
) {
  const label = DOC_LABELS[doc.categorie] ?? doc.nom

  const { data: blob, error } = await supabase.storage
    .from('dossier-documents')
    .download(doc.fichier_path)

  if (error || !blob) {
    addPlaceholderPage(pdfDoc, label, '(Fichier non disponible)', font, boldFont)
    return
  }

  const buffer = Buffer.from(await (blob as Blob).arrayBuffer())
  const name = doc.nom.toLowerCase()

  const isPdf  = buffer[0] === 0x25 && buffer[1] === 0x50  // %P
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8
  const isPng  = buffer[0] === 0x89 && buffer[1] === 0x50
  const isHeic = name.endsWith('.heic') || name.endsWith('.heif')

  if (isPdf) {
    try {
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const indices = srcDoc.getPageIndices()
      const copied = await pdfDoc.copyPages(srcDoc, indices)
      let first = true
      for (const p of copied) {
        pdfDoc.addPage(p)
        if (first) { addPageHeader(p, label, font, boldFont); first = false }
        addWatermark(p, font)
      }
    } catch {
      addPlaceholderPage(pdfDoc, label, '(PDF protégé ou illisible)', font, boldFont)
    }
    return
  }

  if (isJpeg) {
    try   { await embedImagePage(pdfDoc, buffer, 'jpeg', label, font, boldFont) }
    catch { addPlaceholderPage(pdfDoc, label, '(Image JPEG illisible)', font, boldFont) }
    return
  }

  if (isPng) {
    try   { await embedImagePage(pdfDoc, buffer, 'png', label, font, boldFont) }
    catch { addPlaceholderPage(pdfDoc, label, '(Image PNG illisible)', font, boldFont) }
    return
  }

  if (isHeic) {
    try {
      const sharp = (await import('sharp')).default
      const jpegBuf = await sharp(buffer).jpeg({ quality: 90 }).toBuffer()
      await embedImagePage(pdfDoc, jpegBuf, 'jpeg', label, font, boldFont)
    } catch {
      addPlaceholderPage(pdfDoc, label, '(Format HEIC — document disponible dans votre espace)', font, boldFont)
    }
    return
  }

  addPlaceholderPage(pdfDoc, label, '(Format non supporté)', font, boldFont)
}

async function addEndPage(pdfDoc: PDFDocument, font: PDFFont, boldFont: PDFFont) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND })

  page.drawText('DRIFY', {
    x: MARGIN, y: PAGE_H - 100, size: 34, font: boldFont, color: CREAM,
  })
  page.drawText('Dossier de location numérique', {
    x: MARGIN, y: PAGE_H - 132, size: 13, font, color: rgb(0.80, 0.76, 0.72),
  })

  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - 155 },
    end:   { x: PAGE_W - MARGIN, y: PAGE_H - 155 },
    thickness: 1, color: rgb(0.50, 0.42, 0.38),
  })

  page.drawText('Ce dossier a été généré par la plateforme Drify.', {
    x: MARGIN, y: PAGE_H - 185, size: 10, font, color: rgb(0.80, 0.76, 0.72),
  })
  page.drawText('drify.vercel.app', {
    x: MARGIN, y: PAGE_H - 207, size: 10, font: boldFont, color: CREAM,
  })
  page.drawText(`Généré le ${frDate(new Date())}`, {
    x: MARGIN, y: 70, size: 9, font, color: rgb(0.60, 0.54, 0.50),
  })
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const [{ data: profile }, { data: garants }, { data: allDocs }] = await Promise.all([
    supabase.from('tenant_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('garants')
      .select('id, prenom, nom, lien, situation_pro, revenus_mensuels, ordre')
      .eq('user_id', user.id).order('ordre'),
    supabase.from('documents')
      .select('id, nom, categorie, fichier_path, garant_id')
      .eq('user_id', user.id).order('created_at'),
  ])

  const pdfDoc   = await PDFDocument.create()
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // 1. Cover
  await addCoverPage(pdfDoc, profile, font, boldFont)

  // 2. Locataire section
  const locataireDocs = (allDocs ?? []).filter((d) => !d.garant_id)
  await addSectionPage(pdfDoc, 'Partie 1 — Locataire', font, boldFont)
  for (const doc of locataireDocs) {
    await addDocumentPages(pdfDoc, doc, supabase, font, boldFont)
  }

  // 3. Garant sections
  if (garants && garants.length > 0) {
    for (let i = 0; i < garants.length; i++) {
      const garant = garants[i]
      const title  = `Partie ${i + 2} — Garant : ${garant.prenom} ${garant.nom}`
      await addSectionPage(pdfDoc, title, font, boldFont, garant)
      const garantDocs = (allDocs ?? []).filter((d) => d.garant_id === garant.id)
      for (const doc of garantDocs) {
        await addDocumentPages(pdfDoc, doc, supabase, font, boldFont)
      }
    }
  }

  // 4. End page
  await addEndPage(pdfDoc, font, boldFont)

  const pdfBytes = await pdfDoc.save()

  // Upload PDF
  const storagePath = `${user.id}/${Date.now()}-dossier.pdf`
  const { error: uploadError } = await supabase.storage
    .from('dossiers-generes')
    .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: 'Stockage : ' + uploadError.message }, { status: 500 })
  }

  const { data: signed } = await supabase.storage
    .from('dossiers-generes')
    .createSignedUrl(storagePath, 3600)

  const url = signed?.signedUrl ?? null

  // Save URL to profile (best-effort, column may not exist yet)
  if (url) {
    await supabase.from('tenant_profiles')
      .update({ pdf_url: url })
      .eq('user_id', user.id)
  }

  return NextResponse.json({ url })
}
