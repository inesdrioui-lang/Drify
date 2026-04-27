'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { saveTenantProfile } from '@/app/locataire/dossier/actions'
import type { TenantProfileData, GarantData } from '@/app/locataire/dossier/actions'
import type { DocEntry } from '@/components/dossier/DocumentUpload'
import DocumentUpload from '@/components/dossier/DocumentUpload'
import GarantBlock from '@/components/dossier/GarantBlock'
import SolvabilityScore from '@/components/dossier/SolvabilityScore'
import DossierSummary from '@/components/dossier/DossierSummary'
import GuarantorBanner from '@/components/dossier/GuarantorBanner'
import { evaluateGuarantor } from '@/lib/guarantor'

type GarantWithId = GarantData & { id: string }

interface DossierClientProps {
  userId: string
  initialProfile: TenantProfileData | null
  initialGarants: GarantWithId[]
  initialDocuments: DocEntry[]
  multiplicateurSeuil?: number
}

const SECTIONS = [
  { id: 'identite', label: 'Identité' },
  { id: 'situation', label: 'Situation & revenus' },
  { id: 'documents', label: 'Documents' },
  { id: 'garants', label: 'Garant(s)' },
]

const SITUATION_OPTIONS = [
  { value: 'salarie_cdi', label: 'Salarié CDI' },
  { value: 'salarie_cdd', label: 'Salarié CDD' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'independant', label: 'Indépendant / Freelance' },
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'retraite', label: 'Retraité(e)' },
  { value: 'sans_emploi', label: 'Sans emploi' },
]

const TYPE_ACTIVITE_OPTIONS = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'developpeur', label: 'Développeur' },
  { value: 'designer', label: 'Designer' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'commercant', label: 'Commerçant' },
  { value: 'profession_liberale', label: 'Profession libérale' },
  { value: 'autre', label: 'Autre' },
]

const SITUATIONS_WITH_SUBFIELDS = ['salarie_cdi', 'salarie_cdd', 'independant']

function parseMMAAAA(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{4})$/)
  if (!m) return null
  const month = parseInt(m[1])
  const year = parseInt(m[2])
  if (month < 1 || month > 12) return null
  return new Date(year, month - 1, 1)
}

function getDocTypes(situationPro: string): { type: string; label: string; description: string; required: boolean }[] {
  const base = [
    { type: 'identite', label: "Pièce d'identité", description: 'CNI ou passeport en cours de validité', required: true },
    { type: 'justificatif_domicile', label: 'Justificatif de domicile', description: 'Taxe foncière ou 3 dernières quittances de loyer', required: true },
  ]

  if (situationPro === 'etudiant') {
    return [
      ...base,
      { type: 'certificat_scolarite', label: 'Certificat de scolarité', description: 'Certificat de l\'établissement en cours', required: true },
      { type: 'carte_etudiant', label: 'Carte étudiante', description: 'Carte étudiante valide', required: false },
      { type: 'bourse', label: 'Justificatif de bourse', description: 'Notification CROUS ou bourse privée', required: false },
      { type: 'avis_imposition', label: "Avis d'imposition", description: 'Avis d\'imposition des parents ou propre avis', required: true },
    ]
  }

  if (situationPro === 'independant') {
    return [
      ...base,
      { type: 'kbis', label: 'Extrait Kbis / Statuts', description: 'Kbis de moins de 3 mois ou statuts de l\'entreprise', required: true },
      { type: 'bilans', label: 'Bilans comptables', description: '2 derniers bilans comptables', required: true },
      { type: 'avis_imposition', label: "Avis d'imposition", description: '2 derniers avis d\'imposition', required: true },
    ]
  }

  if (situationPro === 'retraite') {
    return [
      ...base,
      { type: 'pension', label: 'Justificatif de pension', description: 'Relevé de pension ou notification de retraite', required: true },
      { type: 'avis_imposition', label: "Avis d'imposition", description: 'Dernier avis d\'imposition', required: true },
    ]
  }

  if (situationPro === 'sans_emploi') {
    return [
      ...base,
      { type: 'allocations', label: 'Justificatif d\'allocations', description: 'Notifications CAF, France Travail ou AAH', required: false },
      { type: 'avis_imposition', label: "Avis d'imposition", description: 'Dernier avis d\'imposition', required: true },
    ]
  }

  // Default (salarié, fonctionnaire)
  return [
    ...base,
    { type: 'fiches_salaire', label: 'Bulletins de salaire', description: '3 derniers bulletins de salaire', required: true },
    { type: 'contrat_travail', label: 'Contrat de travail', description: 'Contrat de travail ou attestation employeur', required: true },
    { type: 'avis_imposition', label: "Avis d'imposition", description: '2 derniers avis d\'imposition', required: true },
  ]
}

function calcDossierScore(
  profile: TenantProfileData | null,
  documents: DocEntry[],
  garants: GarantWithId[],
  situationPro: string
): { score: number; missing: string[] } {
  let score = 0
  const missing: string[] = []
  const types = documents.map(d => d.type_document)

  const identiteOk = !!(profile?.prenom && profile?.nom && profile?.date_naissance)
  if (identiteOk) score += 15
  else missing.push('Informations d\'identité incomplètes')

  const situationOk = !!(profile?.situation_pro && profile?.revenus_mensuels != null && profile?.loyer_cible)
  if (situationOk) score += 15
  else missing.push('Situation professionnelle ou loyer cible manquant')

  if (types.includes('identite')) score += 20
  else missing.push('Pièce d\'identité')

  if (situationPro === 'etudiant') {
    if (types.includes('certificat_scolarite')) score += 15
    else missing.push('Certificat de scolarité')
    if (types.includes('avis_imposition')) score += 10
    else missing.push("Avis d'imposition")
    if (garants.length === 0) missing.push('Garant obligatoire pour les étudiants')
    else score += 15
  } else if (situationPro === 'independant') {
    if (types.includes('kbis')) score += 10
    else missing.push('Extrait Kbis / Statuts')
    if (types.includes('bilans')) score += 10
    else missing.push('Bilans comptables')
    if (types.includes('avis_imposition')) score += 10
    else missing.push("Avis d'imposition")
  } else if (situationPro === 'retraite') {
    if (types.includes('pension')) score += 15
    else missing.push('Justificatif de pension')
    if (types.includes('avis_imposition')) score += 15
    else missing.push("Avis d'imposition")
  } else if (situationPro === 'sans_emploi') {
    if (types.includes('avis_imposition')) score += 20
    else missing.push("Avis d'imposition")
  } else {
    if (types.includes('fiches_salaire')) score += 15
    else missing.push('Bulletins de salaire')
    if (types.includes('contrat_travail')) score += 10
    else missing.push('Contrat de travail')
    if (types.includes('avis_imposition')) score += 10
    else missing.push("Avis d'imposition")
  }

  if (garants.length > 0) score += 5

  return { score: Math.min(score, 100), missing }
}

export default function DossierClient({ userId, initialProfile, initialGarants, initialDocuments, multiplicateurSeuil = 3 }: DossierClientProps) {
  const [activeSection, setActiveSection] = useState('identite')
  const [profile, setProfile] = useState<TenantProfileData>(initialProfile ?? {})
  const [garants, setGarants] = useState<GarantWithId[]>(initialGarants)
  const [documents, setDocuments] = useState<DocEntry[]>(initialDocuments)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showGarant2, setShowGarant2] = useState(initialGarants.length >= 2)
  const [showOptionalGarant, setShowOptionalGarant] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sub-fields for conditional situation fields (local state, not persisted yet)
  const [periodeEssai, setPeriodeEssai] = useState<'oui' | 'non' | ''>('')
  const [cddDebut, setCddDebut] = useState('')
  const [cddFin, setCddFin] = useState('')
  const [activiteDepuis, setActiviteDepuis] = useState('')
  const [typeActivite, setTypeActivite] = useState('')
  const [cddDateError, setCddDateError] = useState<string | null>(null)

  const situationPro = profile.situation_pro ?? ''
  const isEtudiant = situationPro === 'etudiant'
  const docTypes = getDocTypes(situationPro)

  const revenuLocataire = profile.revenus_mensuels ?? 0
  const loyerCible = profile.loyer_cible ?? 0
  const revenusGarants = garants.map(g => g.revenus_mensuels)

  const { score, missing } = calcDossierScore(profile, documents, garants, situationPro)
  const isComplete = missing.length === 0

  const seuilRecommande = loyerCible > 0 ? loyerCible * multiplicateurSeuil : null

  const guarantorResult = useMemo(() => {
    if (!['salarie_cdi', 'salarie_cdd', 'independant'].includes(situationPro)) return null
    if (!revenuLocataire || !loyerCible) return null

    const statut = situationPro === 'salarie_cdi' ? 'cdi'
      : situationPro === 'salarie_cdd' ? 'cdd'
      : 'freelance' as const

    if (statut === 'cdi') {
      if (!periodeEssai) return null
      return evaluateGuarantor({
        statut,
        periodeEssai: periodeEssai === 'oui',
        revenuMensuelNet: revenuLocataire,
        loyerMensuel: loyerCible,
        multiplicateurSeuil,
      })
    }

    if (statut === 'cdd') {
      const dateFin = parseMMAAAA(cddFin)
      if (!dateFin) return null
      return evaluateGuarantor({
        statut,
        dateFin,
        revenuMensuelNet: revenuLocataire,
        loyerMensuel: loyerCible,
        multiplicateurSeuil,
      })
    }

    // freelance
    if (!activiteDepuis) return null
    const year = parseInt(activiteDepuis)
    if (isNaN(year)) return null
    return evaluateGuarantor({
      statut,
      dateDebutActivite: new Date(year, 0, 1),
      revenuMensuelNet: revenuLocataire,
      loyerMensuel: loyerCible,
      multiplicateurSeuil,
    })
  }, [situationPro, periodeEssai, cddFin, activiteDepuis, revenuLocataire, loyerCible, multiplicateurSeuil])

  const garant1 = garants.find(g => g.ordre === 1)
  const garant2 = garants.find(g => g.ordre === 2)
  const garantRequis = isEtudiant || (guarantorResult?.required === true)

  const doAutoSave = useCallback(async (data: TenantProfileData) => {
    setSaveState('saving')
    const result = await saveTenantProfile(data)
    setSaveState(result.error ? 'error' : 'saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }, [])

  function validateCddDates(debut: string, fin: string) {
    if (!debut || !fin) { setCddDateError(null); return }
    const d = parseMMAAAA(debut)
    const f = parseMMAAAA(fin)
    if (!d || !f) { setCddDateError(null); return }
    if (f <= d) setCddDateError('La date de fin doit être postérieure à la date de début.')
    else setCddDateError(null)
  }

  function updateProfile(field: keyof TenantProfileData, value: string | number | null) {
    if (field === 'situation_pro') {
      setPeriodeEssai('')
      setCddDebut('')
      setCddFin('')
      setActiviteDepuis('')
      setTypeActivite('')
      setCddDateError(null)
    }
    setProfile(prev => {
      const next = { ...prev, [field]: value }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doAutoSave(next), 1500)
      return next
    })
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const docsByType = Object.fromEntries(
    docTypes.map(dt => [dt.type, documents.filter(d => d.type_document === dt.type)])
  )

  function addDocument(doc: DocEntry) {
    setDocuments(prev => [doc, ...prev])
  }

  function removeDocFromState(id: string) {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <>
      <style>{`
        /* ── Layout ── */
        .dc-layout { display: grid; grid-template-columns: 220px 1fr; gap: 32px; max-width: 1000px; margin: 0 auto; padding: 48px 24px 80px; }
        .dc-sidebar { position: sticky; top: 80px; height: fit-content; }
        .dc-main { min-width: 0; }

        /* ── Sticky nav ── */
        .dc-nav { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 8px; }
        .dc-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: all 0.12s; }
        .dc-nav-item:hover { background: var(--bg-soft); color: var(--text); }
        .dc-nav-item.active { background: var(--bg-soft); color: var(--brown); font-weight: 700; }
        .dc-nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
        .dc-nav-item.active .dc-nav-dot { background: var(--brown); }
        .dc-nav-divider { height: 1px; background: var(--border-soft); margin: 6px 8px; }

        /* ── Autosave badge ── */
        .dc-save-badge { display: flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; border-radius: 10px; margin-bottom: 8px; }
        .dc-save-badge.saving { color: var(--text-muted); background: var(--bg-soft); }
        .dc-save-badge.saved { color: #4A7C59; background: #EAF3EE; }
        .dc-save-badge.error { color: #9B3A2A; background: #FAECEC; }

        /* ── Page header ── */
        .dc-header { margin-bottom: 28px; }
        .dc-header h1 { font-size: 28px; font-weight: 800; color: var(--brown); letter-spacing: -0.5px; margin-bottom: 4px; }
        .dc-header p { font-size: 14px; color: var(--text-muted); }

        /* ── Section card ── */
        .dc-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; margin-bottom: 20px; overflow: hidden; scroll-margin-top: 88px; }
        .dc-section-header { display: flex; align-items: center; gap: 14px; padding: 18px 22px; cursor: pointer; }
        .dc-section-header:hover { background: var(--bg-soft); }
        .dc-section-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--brown-light); flex-shrink: 0; }
        .dc-section-title { font-size: 15px; font-weight: 700; color: var(--brown); }
        .dc-section-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .dc-section-chevron { margin-left: auto; color: var(--text-light); transition: transform 0.2s; }
        .dc-section-chevron.open { transform: rotate(180deg); }
        .dc-section-body { padding: 0 22px 22px; border-top: 1px solid var(--border-soft); }

        /* ── Form fields ── */
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
        .field-full { grid-column: 1 / -1; }
        .field-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.04em; }
        .field-input, .field-select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); transition: border-color 0.12s; box-sizing: border-box; }
        .field-input:focus, .field-select:focus { outline: none; border-color: var(--brown-light); }
        .field-input::placeholder { color: var(--text-light); }

        /* ── Solvability section ── */
        .solv-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
        .solv-block { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
        .solv-block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .solv-block-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .solv-block-tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
        .solv-tag-grey { color: var(--text-light); background: var(--border); }
        .solv-score-row { display: flex; align-items: baseline; gap: 2px; margin-bottom: 8px; }
        .solv-score-num { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
        .solv-score-denom { font-size: 14px; color: var(--text-light); }
        .solv-bar-track { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
        .solv-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        .solv-bar-caption { font-size: 11px; color: var(--text-light); }
        .solv-message { padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-top: 12px; grid-column: 1 / -1; }
        .solv-empty { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: var(--bg-soft); border-radius: 10px; font-size: 13px; color: var(--text-muted); margin-top: 18px; }

        /* ── Garant section ── */
        .garant-card { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .garant-card-info { flex: 1; }
        .garant-card-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .garant-card-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .garant-card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-garant-edit { padding: 5px 12px; border: 1px solid var(--border); border-radius: 7px; background: transparent; font-size: 12px; font-weight: 600; color: var(--brown-mid); cursor: pointer; font-family: inherit; }
        .btn-garant-edit:hover { background: var(--bg-soft); }
        .btn-garant-delete { width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 7px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-light); }
        .btn-garant-delete:hover { color: #9B3A2A; background: #FAECEC; border-color: #F5C6C0; }
        .garant-form { background: var(--bg-soft); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .garant-form-title { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .btn-garant-cancel { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: transparent; font-size: 11px; font-weight: 600; color: var(--text-muted); cursor: pointer; font-family: inherit; text-transform: none; letter-spacing: 0; }
        .garant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .garant-field { display: flex; flex-direction: column; gap: 4px; }
        .garant-error { font-size: 12px; color: #9B3A2A; background: #FAECEC; padding: 8px 12px; border-radius: 8px; margin-top: 10px; }
        .btn-garant-save { margin-top: 14px; padding: 9px 20px; background: var(--brown); color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.12s; }
        .btn-garant-save:hover { opacity: 0.85; }
        .btn-garant-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-add-garant { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px dashed var(--border); border-radius: 12px; background: transparent; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; font-family: inherit; width: 100%; justify-content: center; transition: all 0.12s; }
        .btn-add-garant:hover { border-color: var(--brown-light); color: var(--brown); background: var(--bg-soft); }
        .garant-mandatory-badge { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #FDF4E3; border: 1px solid #F5D98B; border-radius: 8px; font-size: 12px; color: #9B7226; font-weight: 500; margin-bottom: 14px; }

        /* ── Document upload ── */
        .docup-wrap { display: flex; flex-direction: column; gap: 0; }
        .docup-list { margin-bottom: 8px; }
        .docup-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-soft); }
        .docup-item:last-child { border-bottom: none; }
        .docup-item-icon { color: var(--brown-light); flex-shrink: 0; }
        .docup-item-body { flex: 1; min-width: 0; }
        .docup-item-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px; }
        .docup-item-meta { font-size: 11px; color: var(--text-light); }
        .docup-item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .badge-status { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
        .btn-doc-view, .btn-doc-delete { width: 26px; height: 26px; border: 1px solid var(--border); border-radius: 6px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-light); transition: all 0.1s; }
        .btn-doc-view:hover { color: var(--brown); border-color: var(--brown-light); }
        .btn-doc-delete:hover { color: #9B3A2A; background: #FAECEC; border-color: #F5C6C0; }
        .docup-zone { border: 1.5px dashed var(--border); border-radius: 10px; padding: 16px 20px; cursor: pointer; transition: all 0.15s; background: var(--bg); }
        .docup-zone:hover, .docup-zone--drag { border-color: var(--brown-light); background: var(--bg-soft); }
        .docup-zone--loading { pointer-events: none; opacity: 0.7; }
        .docup-zone-content { display: flex; align-items: center; gap: 10px; color: var(--text-muted); }
        .docup-zone-text { font-size: 13px; font-weight: 500; flex: 1; }
        .docup-zone-hint { font-size: 11px; color: var(--text-light); white-space: nowrap; }
        .docup-error { font-size: 12px; color: #9B3A2A; background: #FAECEC; padding: 7px 12px; border-radius: 8px; margin-top: 6px; }
        .docup-spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--brown); border-radius: 50%; animation: spin 0.6s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Doc type group ── */
        .doc-type-group { padding: 16px 0; border-bottom: 1px solid var(--border-soft); }
        .doc-type-group:last-child { border-bottom: none; }
        .doc-type-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .doc-type-label { font-size: 13px; font-weight: 700; color: var(--text); }
        .doc-type-desc { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
        .doc-type-required { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; background: #FDF4E3; color: #9B7226; }
        .doc-type-ok { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; background: #EAF3EE; color: #4A7C59; }

        /* ── Summary card ── */
        .summary-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-top: 16px; }
        .summary-score-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .summary-score-num { font-size: 44px; font-weight: 800; letter-spacing: -1px; flex-shrink: 0; }
        .summary-score-title { font-size: 13px; font-weight: 700; color: var(--brown); }
        .summary-score-sub { font-size: 12px; color: var(--text-muted); }
        .summary-bar-track { height: 8px; background: var(--border); border-radius: 99px; overflow: hidden; margin-bottom: 14px; }
        .summary-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .summary-missing { margin-bottom: 14px; }
        .summary-missing-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
        .summary-missing-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
        .summary-missing-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9B3A2A; }
        .summary-complete { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #4A7C59; background: #EAF3EE; padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; }
        .btn-share { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 20px; background: var(--brown); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.12s; }
        .btn-share:hover { opacity: 0.85; }
        .btn-share--disabled { background: var(--bg-soft); color: var(--text-light); border: 1px solid var(--border); cursor: not-allowed; }
        .btn-share--disabled:hover { opacity: 1; }

        /* ── Guarantor banner ── */
        .gban { border-radius: 10px; padding: 11px 14px; font-size: 13px; margin-top: 16px; }
        .gban--ok { background: #EAF3EE; border: 1px solid #B8D9C5; color: #2D6A47; }
        .gban--ko { background: #FEF9EC; border: 1px solid #F5D98B; color: #7A5A1A; }
        .gban-title { display: flex; align-items: center; gap: 7px; font-weight: 700; }
        .gban-reasons { margin: 6px 0 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 3px; font-weight: 500; }
        .field-seuil-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

        /* ── Conditional sub-fields ── */
        .subfields-outer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.26s ease; }
        .subfields-outer.open { grid-template-rows: 1fr; }
        .subfields-inner { overflow: hidden; }
        .subfields-inner > * { opacity: 0; transition: opacity 0.18s ease 0s; }
        .subfields-outer.open .subfields-inner > * { opacity: 1; transition: opacity 0.2s ease 0.1s; }
        .subfields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding-top: 16px; }
        .subfields-section-label { font-size: 11px; font-weight: 700; color: var(--brown-light); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; padding-top: 16px; display: flex; align-items: center; gap: 6px; }
        .subfields-section-label::before { content: ''; display: inline-block; width: 3px; height: 12px; background: var(--brown-light); border-radius: 2px; }

        /* ── Radio toggle (CDI période essai) ── */
        .radio-toggle { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .radio-toggle-label { flex: 1; position: relative; }
        .radio-toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
        .radio-toggle-btn { display: block; padding: 10px 14px; text-align: center; font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: background 0.12s, color 0.12s; border-right: 1px solid var(--border); background: var(--bg); }
        .radio-toggle-label:last-child .radio-toggle-btn { border-right: none; }
        .radio-toggle-input:checked + .radio-toggle-btn { background: var(--brown); color: #fff; font-weight: 700; }
        .radio-toggle-input:focus-visible + .radio-toggle-btn { outline: 2px solid var(--brown-light); outline-offset: -2px; }

        /* ── Field extras ── */
        .field-required { color: #9B3A2A; font-weight: 800; }
        .field-error-msg { font-size: 12px; color: #9B3A2A; background: #FAECEC; padding: 8px 12px; border-radius: 8px; margin: 0; }
        .field-input--error { border-color: #9B3A2A !important; }

        /* ── GarantBlock ── */
        .gblock { margin-bottom: 16px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .gblock--animated { animation: gblock-enter 0.2s ease-out; }
        @keyframes gblock-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .gblock-form { padding: 16px; }
        .gblock-form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .gblock-form-title { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .gblock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .gblock-col-full { grid-column: 1 / -1; }
        .gblock-subsec { padding-bottom: 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 16px; }
        .gblock-subsec:last-of-type { border-bottom: none; padding-bottom: 0; }
        .gblock-subsec-title { font-size: 11px; font-weight: 700; color: var(--brown-light); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .gblock-subsec-title::before { content: ''; display: inline-block; width: 3px; height: 12px; background: var(--brown-light); border-radius: 2px; }
        .gblock-actions { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
        .gblock-summary { padding: 14px 16px; display: flex; align-items: center; gap: 12px; background: var(--bg-soft); }
        .gblock-summary-info { flex: 1; }
        .gblock-summary-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .gblock-summary-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .gblock-summary-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .gblock-docs { padding: 16px; border-top: 1px solid var(--border-soft); }
        .garant-optional-msg { text-align: center; padding: 28px 16px; }
        .garant-optional-msg p { font-size: 13px; color: var(--text-muted); margin: 0 0 14px; }
        .btn-add-garant-optional { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border: 1px dashed var(--border); border-radius: 10px; background: transparent; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .btn-add-garant-optional:hover { border-color: var(--brown-light); color: var(--brown); background: var(--bg-soft); }

        /* ── Mobile accordion ── */
        @media (max-width: 768px) {
          .dc-layout { grid-template-columns: 1fr; gap: 0; padding: 24px 16px 60px; }
          .dc-sidebar { position: static; display: none; }
          .dc-section-header { padding: 16px; }
          .dc-section-body { padding: 0 16px 16px; }
          .field-grid { grid-template-columns: 1fr; }
          .garant-grid { grid-template-columns: 1fr; }
          .gblock-grid { grid-template-columns: 1fr; }
          .solv-wrap { grid-template-columns: 1fr; }
          .subfields-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 769px) {
          .dc-section-header { pointer-events: none; }
          .dc-section-chevron { display: none; }
          .dc-section-body { display: block !important; }
        }
      `}</style>

      <div className="dc-layout">
        {/* ── Sidebar ── */}
        <aside className="dc-sidebar">
          <nav className="dc-nav" aria-label="Sections du dossier">
            {saveState !== 'idle' && (
              <div className={`dc-save-badge ${saveState}`}>
                {saveState === 'saving' && (
                  <><div className="docup-spinner" /><span>Sauvegarde…</span></>
                )}
                {saveState === 'saved' && (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Enregistré</span></>
                )}
                {saveState === 'error' && (
                  <><span>Erreur de sauvegarde</span></>
                )}
              </div>
            )}
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`dc-nav-item${activeSection === s.id ? ' active' : ''}`}
                onClick={() => {
                  setActiveSection(s.id)
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <div className="dc-nav-dot" />
                {s.label}
              </button>
            ))}
            <div className="dc-nav-divider" />
          </nav>
          <DossierSummary
            score={score}
            missingItems={missing}
            isComplete={isComplete}
          />
        </aside>

        {/* ── Main ── */}
        <main className="dc-main">
          <div className="dc-header">
            <h1>Mon dossier locataire</h1>
            <p>Constituez votre dossier une seule fois, partagez-le à toutes vos candidatures.</p>
          </div>

          {/* Mobile summary */}
          <div style={{ marginBottom: 20 }} className="mobile-summary-only">
            <DossierSummary score={score} missingItems={missing} isComplete={isComplete} />
          </div>

          {/* ── Section 1 : Identité ── */}
          <Section
            id="identite"
            title="Informations personnelles"
            subtitle="Identité civile et coordonnées"
            active={activeSection === 'identite'}
            onToggle={() => setActiveSection(prev => prev === 'identite' ? '' : 'identite')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            }
          >
            <div className="field-grid">
              <div>
                <label className="field-label">Prénom</label>
                <input className="field-input" value={profile.prenom ?? ''} onChange={e => updateProfile('prenom', e.target.value)} placeholder="Sophie" />
              </div>
              <div>
                <label className="field-label">Nom</label>
                <input className="field-input" value={profile.nom ?? ''} onChange={e => updateProfile('nom', e.target.value)} placeholder="Marchand" />
              </div>
              <div>
                <label className="field-label">Date de naissance</label>
                <input className="field-input" type="date" value={profile.date_naissance ?? ''} onChange={e => updateProfile('date_naissance', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Nationalité</label>
                <input className="field-input" value={profile.nationalite ?? ''} onChange={e => updateProfile('nationalite', e.target.value)} placeholder="Française" />
              </div>
              <div>
                <label className="field-label">Téléphone</label>
                <input className="field-input" type="tel" value={profile.telephone ?? ''} onChange={e => updateProfile('telephone', e.target.value)} placeholder="06 00 00 00 00" />
              </div>
              <div>
                <label className="field-label">Adresse actuelle</label>
                <input className="field-input" value={profile.adresse_actuelle ?? ''} onChange={e => updateProfile('adresse_actuelle', e.target.value)} placeholder="12 rue de la Paix, Paris" />
              </div>
            </div>
          </Section>

          {/* ── Section 2 : Situation ── */}
          <Section
            id="situation"
            title="Situation professionnelle"
            subtitle="Revenus et loyer cible"
            active={activeSection === 'situation'}
            onToggle={() => setActiveSection(prev => prev === 'situation' ? '' : 'situation')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            }
          >
            <div className="field-grid">
              <div>
                <label className="field-label">Situation professionnelle</label>
                <select
                  className="field-select"
                  value={profile.situation_pro ?? ''}
                  onChange={e => updateProfile('situation_pro', e.target.value)}
                  aria-controls="situation-subfields"
                  aria-expanded={SITUATIONS_WITH_SUBFIELDS.includes(situationPro)}
                >
                  <option value="">Choisir…</option>
                  {SITUATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Type de revenus</label>
                <input className="field-input" value={profile.type_revenus ?? ''} onChange={e => updateProfile('type_revenus', e.target.value)} placeholder="Salaire, pension, allocations…" />
              </div>

              {/* ── Sous-champs conditionnels ── */}
              <div className="field-full">
                <div
                  id="situation-subfields"
                  className={`subfields-outer${SITUATIONS_WITH_SUBFIELDS.includes(situationPro) ? ' open' : ''}`}
                  role="region"
                  aria-live="polite"
                  aria-atomic="false"
                >
                  <div className="subfields-inner">

                    {/* CDI — Période d'essai */}
                    {situationPro === 'salarie_cdi' && (
                      <div>
                        <div className="subfields-section-label">Précisions CDI</div>
                        <div role="radiogroup" aria-labelledby="label-periode-essai">
                          <label id="label-periode-essai" className="field-label">
                            Période d&apos;essai <span className="field-required" aria-hidden="true">*</span>
                          </label>
                          <div className="radio-toggle" style={{ marginTop: 5 }}>
                            <label className="radio-toggle-label">
                              <input
                                type="radio"
                                name="periode_essai"
                                value="non"
                                checked={periodeEssai === 'non'}
                                onChange={() => setPeriodeEssai('non')}
                                className="radio-toggle-input"
                                aria-label="Hors période d'essai"
                              />
                              <span className="radio-toggle-btn">Hors période d&apos;essai</span>
                            </label>
                            <label className="radio-toggle-label">
                              <input
                                type="radio"
                                name="periode_essai"
                                value="oui"
                                checked={periodeEssai === 'oui'}
                                onChange={() => setPeriodeEssai('oui')}
                                className="radio-toggle-input"
                                aria-label="En période d'essai"
                              />
                              <span className="radio-toggle-btn">En période d&apos;essai</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CDD — Dates */}
                    {situationPro === 'salarie_cdd' && (
                      <div>
                        <div className="subfields-section-label">Précisions CDD</div>
                        <div className="subfields-grid">
                          <div>
                            <label className="field-label" htmlFor="cdd-debut">
                              Date de début <span className="field-required" aria-hidden="true">*</span>
                            </label>
                            <input
                              id="cdd-debut"
                              className={`field-input${cddDateError ? ' field-input--error' : ''}`}
                              value={cddDebut}
                              onChange={e => { setCddDebut(e.target.value); validateCddDates(e.target.value, cddFin) }}
                              placeholder="MM/AAAA"
                              inputMode="numeric"
                              aria-required="true"
                              aria-describedby={cddDateError ? 'cdd-date-error' : undefined}
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor="cdd-fin">
                              Date de fin <span className="field-required" aria-hidden="true">*</span>
                            </label>
                            <input
                              id="cdd-fin"
                              className={`field-input${cddDateError ? ' field-input--error' : ''}`}
                              value={cddFin}
                              onChange={e => { setCddFin(e.target.value); validateCddDates(cddDebut, e.target.value) }}
                              placeholder="MM/AAAA"
                              inputMode="numeric"
                              aria-required="true"
                              aria-describedby={cddDateError ? 'cdd-date-error' : undefined}
                            />
                          </div>
                          {cddDateError && (
                            <div className="field-full">
                              <p id="cdd-date-error" className="field-error-msg" role="alert">{cddDateError}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Indépendant / Freelance */}
                    {situationPro === 'independant' && (
                      <div>
                        <div className="subfields-section-label">Précisions activité indépendante</div>
                        <div className="subfields-grid">
                          <div>
                            <label className="field-label" htmlFor="activite-depuis">
                              Activité exercée depuis <span className="field-required" aria-hidden="true">*</span>
                            </label>
                            <input
                              id="activite-depuis"
                              className="field-input"
                              type="number"
                              min="1970"
                              max={new Date().getFullYear()}
                              value={activiteDepuis}
                              onChange={e => setActiviteDepuis(e.target.value)}
                              placeholder="Ex. 2019"
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <label className="field-label" htmlFor="type-activite">
                              Type d&apos;activité <span className="field-required" aria-hidden="true">*</span>
                            </label>
                            <select
                              id="type-activite"
                              className="field-select"
                              value={typeActivite}
                              onChange={e => setTypeActivite(e.target.value)}
                              aria-required="true"
                            >
                              <option value="">Choisir…</option>
                              {TYPE_ACTIVITE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div>
                <label className="field-label">Revenus mensuels nets (€)</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={profile.revenus_mensuels ?? ''}
                  onChange={e => updateProfile('revenus_mensuels', parseFloat(e.target.value) || null)}
                  placeholder="2 200"
                />
                {revenuLocataire > 0 && (
                  <p className="field-seuil-hint">
                    Loyer maximum recommandé : {Math.round(revenuLocataire / 3).toLocaleString('fr-FR')} €/mois
                  </p>
                )}
              </div>
              <div>
                <label className="field-label">Loyer cible (€/mois)</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={profile.loyer_cible ?? ''}
                  onChange={e => updateProfile('loyer_cible', parseFloat(e.target.value) || null)}
                  placeholder="700"
                />
              </div>
            </div>

            <SolvabilityScore
              revenuLocataire={revenuLocataire}
              loyerCible={loyerCible}
              revenusGarants={revenusGarants}
              isEtudiant={isEtudiant}
              suppressGarantDecision={!!guarantorResult}
            />

            {guarantorResult && <GuarantorBanner result={guarantorResult} />}
          </Section>

          {/* ── Section 3 : Documents ── */}
          <Section
            id="documents"
            title="Documents"
            subtitle="Vos justificatifs selon votre situation"
            active={activeSection === 'documents'}
            onToggle={() => setActiveSection(prev => prev === 'documents' ? '' : 'documents')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            }
          >
            {!situationPro ? (
              <div className="solv-empty" style={{ marginTop: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Renseignez d&apos;abord votre situation professionnelle pour voir les documents requis.
              </div>
            ) : (
              docTypes.map(dt => {
                const docs = docsByType[dt.type] ?? []
                const hasDoc = docs.length > 0
                return (
                  <div key={dt.type} className="doc-type-group">
                    <div className="doc-type-header">
                      <div>
                        <div className="doc-type-label">{dt.label}</div>
                        <div className="doc-type-desc">{dt.description}</div>
                      </div>
                      {hasDoc
                        ? <span className="doc-type-ok">✓ Fourni</span>
                        : dt.required && <span className="doc-type-required">Requis</span>
                      }
                    </div>
                    <DocumentUpload
                      userId={userId}
                      typeDocument={dt.type}
                      label={dt.label}
                      documents={docs}
                      onAdded={addDocument}
                      onRemoved={removeDocFromState}
                      storagePrefix="locataire"
                    />
                  </div>
                )
              })
            )}
          </Section>

          {/* ── Section 4 : Garant(s) ── */}
          <Section
            id="garants"
            title="Garant(s)"
            subtitle={garantRequis ? 'Requis pour ce dossier' : 'Optionnel — renforce votre dossier'}
            active={activeSection === 'garants'}
            onToggle={() => setActiveSection(prev => prev === 'garants' ? '' : 'garants')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            }
          >
            <div style={{ marginTop: 16 }}>
              {isEtudiant && garants.length === 0 && (
                <div className="garant-mandatory-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  En tant qu&apos;étudiant(e), un garant est obligatoire pour valider votre dossier.
                </div>
              )}

              {!garantRequis && !showOptionalGarant && !garant1 ? (
                <div className="garant-optional-msg">
                  <p>Votre profil ne nécessite pas de garant pour l&apos;instant.</p>
                  <button
                    type="button"
                    className="btn-add-garant-optional"
                    onClick={() => setShowOptionalGarant(true)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Ajouter un garant quand même
                  </button>
                </div>
              ) : (
                <>
                  {!garantRequis && !garant1 && showOptionalGarant && (
                    <div style={{ marginBottom: 12 }}>
                      <button
                        type="button"
                        className="btn-garant-cancel"
                        onClick={() => setShowOptionalGarant(false)}
                      >
                        ← Annuler
                      </button>
                    </div>
                  )}

                  <GarantBlock
                    ordre={1}
                    userId={userId}
                    initialGarant={garant1}
                    allDocuments={documents}
                    onSaved={g => setGarants(prev => [g, ...prev.filter(x => x.ordre !== 1)])}
                    onDeleted={id => {
                      setGarants(prev => prev.filter(x => x.id !== id))
                      if (!garantRequis) setShowOptionalGarant(false)
                    }}
                    onDocAdded={addDocument}
                    onDocRemoved={removeDocFromState}
                  />

                  {garant1 && !garant2 && !showGarant2 && (
                    <button type="button" className="btn-add-garant" onClick={() => setShowGarant2(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Ajouter un second garant
                    </button>
                  )}

                  {(showGarant2 || garant2) && (
                    <GarantBlock
                      ordre={2}
                      userId={userId}
                      initialGarant={garant2}
                      allDocuments={documents}
                      onSaved={g => setGarants(prev => [...prev.filter(x => x.ordre !== 2), g])}
                      onDeleted={id => {
                        setGarants(prev => prev.filter(x => x.id !== id))
                        setShowGarant2(false)
                      }}
                      onDocAdded={addDocument}
                      onDocRemoved={removeDocFromState}
                      isNew={!garant2}
                    />
                  )}
                </>
              )}
            </div>
          </Section>
        </main>
      </div>
    </>
  )
}

/* ── Collapsible section helper ── */
interface SectionProps {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  active: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ id, title, subtitle, icon, active, onToggle, children }: SectionProps) {
  return (
    <div className="dc-section" id={`section-${id}`}>
      <div className="dc-section-header" onClick={onToggle} role="button" aria-expanded={active} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onToggle()}>
        <div className="dc-section-icon">{icon}</div>
        <div>
          <div className="dc-section-title">{title}</div>
          {subtitle && <div className="dc-section-sub">{subtitle}</div>}
        </div>
        <div className={`dc-section-chevron${active ? ' open' : ''}`} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      <div className="dc-section-body" style={{ display: active ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  )
}
