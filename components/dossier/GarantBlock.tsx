'use client'

import { useState, useRef, useEffect } from 'react'
import { saveGarant, deleteGarant } from '@/app/locataire/dossier/actions'
import type { GarantData } from '@/app/locataire/dossier/actions'
import type { DocEntry } from '@/components/dossier/DocumentUpload'
import DocumentUpload from '@/components/dossier/DocumentUpload'

type TypeGarant = 'physique' | 'organisme'

interface GarantFormData {
  typeGarant: TypeGarant
  nomOrganisme: string
  prenom: string
  nom: string
  dateNaissance: string
  nationalite: string
  telephone: string
  adresse: string
  situationPro: string
  typeRevenus: string
  revenus: number
}

const SITUATIONS = [
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

function getPhysiqueDocTypes(situationPro: string) {
  const base = [
    { type: 'identite', label: "Pièce d'identité", description: 'CNI ou passeport en cours de validité', required: true },
    { type: 'avis_imposition', label: "Avis d'imposition", description: "Dernier avis d'imposition", required: true },
  ]
  if (['salarie_cdi', 'salarie_cdd', 'fonctionnaire'].includes(situationPro)) {
    return [
      ...base,
      { type: 'fiches_salaire', label: 'Bulletins de salaire', description: '3 derniers bulletins de salaire', required: true },
      { type: 'contrat_travail', label: 'Contrat de travail', description: 'Contrat de travail ou attestation employeur', required: true },
    ]
  }
  if (situationPro === 'independant') {
    return [
      ...base,
      { type: 'kbis', label: 'Extrait Kbis / Statuts', description: "Kbis de moins de 3 mois ou statuts de l'entreprise", required: true },
      { type: 'bilans', label: 'Bilans comptables', description: '2 derniers bilans comptables', required: true },
    ]
  }
  if (situationPro === 'retraite') {
    return [
      ...base,
      { type: 'pension', label: 'Justificatif de pension', description: 'Relevé de pension ou notification de retraite', required: true },
    ]
  }
  return base
}

const ORGANISME_DOC_TYPES = [
  {
    type: 'attestation_garantie',
    label: 'Attestation de garantie',
    description: "Document officiel de l'organisme garant (Visale, Action Logement…)",
    required: true,
  },
]

interface GarantBlockProps {
  ordre: 1 | 2
  userId: string
  initialGarant?: GarantData & { id: string }
  allDocuments: DocEntry[]
  onSaved: (g: GarantData & { id: string }) => void
  onDeleted: (id: string) => void
  onDocAdded: (doc: DocEntry) => void
  onDocRemoved: (id: string) => void
  isNew?: boolean
}

function buildInitialForm(g?: GarantData & { id: string }): GarantFormData {
  const isOrganisme = g?.type_garant === 'organisme' || g?.lien === 'organisme'
  return {
    typeGarant: isOrganisme ? 'organisme' : 'physique',
    nomOrganisme: isOrganisme ? (g?.nom ?? '') : '',
    prenom: isOrganisme ? '' : (g?.prenom ?? ''),
    nom: isOrganisme ? '' : (g?.nom ?? ''),
    dateNaissance: g?.date_naissance ?? '',
    nationalite: g?.nationalite ?? '',
    telephone: g?.telephone ?? '',
    adresse: g?.adresse ?? '',
    situationPro: isOrganisme ? 'salarie_cdi' : (g?.situation_pro ?? 'salarie_cdi'),
    typeRevenus: g?.type_revenus ?? '',
    revenus: g?.revenus_mensuels ?? 0,
  }
}

function formToGarantData(f: GarantFormData, garantDbId: string, ordre: 1 | 2): GarantData {
  // type_garant, nationalite, type_revenus sont envoyés uniquement si la migration 003 est exécutée.
  // En attendant, le type est encodé dans le champ lien ('organisme' vs 'parent').
  if (f.typeGarant === 'organisme') {
    return {
      id: garantDbId || undefined,
      prenom: '',
      nom: f.nomOrganisme,
      telephone: f.telephone || undefined,
      adresse: f.adresse || undefined,
      lien: 'organisme',
      situation_pro: 'sans_emploi',
      revenus_mensuels: 0,
      ordre,
    }
  }
  return {
    id: garantDbId || undefined,
    prenom: f.prenom,
    nom: f.nom,
    date_naissance: f.dateNaissance || undefined,
    telephone: f.telephone || undefined,
    adresse: f.adresse || undefined,
    lien: 'parent',
    situation_pro: f.situationPro,
    revenus_mensuels: f.revenus,
    ordre,
  }
}

export default function GarantBlock({
  ordre,
  userId,
  initialGarant,
  allDocuments,
  onSaved,
  onDeleted,
  onDocAdded,
  onDocRemoved,
  isNew,
}: GarantBlockProps) {
  const garantPrefix = `garant-${ordre}`
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [garantDbId, setGarantDbId] = useState(initialGarant?.id ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState<GarantFormData>(() => buildInitialForm(initialGarant))

  // Subfields (local only, not persisted)
  const [periodeEssai, setPeriodeEssai] = useState<'oui' | 'non' | ''>('')
  const [cddDebut, setCddDebut] = useState('')
  const [cddFin, setCddFin] = useState('')
  const [activiteDepuis, setActiviteDepuis] = useState('')
  const [typeActivite, setTypeActivite] = useState('')
  const [cddDateError, setCddDateError] = useState<string | null>(null)

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  async function doSave(data: GarantData) {
    setSaveState('saving')
    setSaveError('')
    const result = await saveGarant(data)
    if (result.error) {
      setSaveState('error')
      setSaveError(result.error)
      return
    }
    const id = result.id ?? garantDbId
    if (!garantDbId && id) {
      setGarantDbId(id)
      onSaved({ ...data, id })
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  function updateForm(field: keyof GarantFormData, value: GarantFormData[keyof GarantFormData]) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        doSave(formToGarantData(next, garantDbId, ordre))
      }, 1500)
      return next
    })
  }

  function handleTypeGarantChange(type: TypeGarant) {
    setForm(prev => {
      const next = { ...prev, typeGarant: type }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        doSave(formToGarantData(next, garantDbId, ordre))
      }, 1500)
      return next
    })
  }

  function handleChangeSituation(val: string) {
    setPeriodeEssai('')
    setCddDebut('')
    setCddFin('')
    setActiviteDepuis('')
    setTypeActivite('')
    setCddDateError(null)
    updateForm('situationPro', val)
  }

  function validateCddDates(debut: string, fin: string) {
    if (!debut || !fin) { setCddDateError(null); return }
    const d = parseMMAAAA(debut)
    const f = parseMMAAAA(fin)
    if (!d || !f) { setCddDateError(null); return }
    if (f <= d) setCddDateError('La date de fin doit être postérieure à la date de début.')
    else setCddDateError(null)
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    if (garantDbId) await deleteGarant(garantDbId)
    onDeleted(garantDbId)
  }

  const docTypes = form.typeGarant === 'organisme' ? ORGANISME_DOC_TYPES : getPhysiqueDocTypes(form.situationPro)
  const garantDocs = allDocuments.filter(d => d.fichier_path.includes(`/${garantPrefix}/`))

  const displayName = form.typeGarant === 'organisme'
    ? form.nomOrganisme
    : [form.prenom, form.nom].filter(Boolean).join(' ')

  return (
    <>
      <style>{`
        .garant-wrapper { margin-bottom: 28px; }
        .garant-wrapper--new { animation: gblock-enter 0.2s ease-out; }
        @keyframes gblock-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .garant-wrapper-hd {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 4px 14px;
        }
        .garant-wrapper-label {
          font-size: 13px; font-weight: 700; color: var(--brown-mid);
          text-transform: uppercase; letter-spacing: 0.05em;
          display: flex; align-items: center; gap: 8px; flex: 1;
        }
        .garant-wrapper-name {
          font-size: 13px; font-weight: 600; color: var(--text-muted);
          text-transform: none; letter-spacing: 0;
        }
        .garant-wrapper-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .garant-save-badge {
          font-size: 11px; font-weight: 600; padding: 4px 10px;
          border-radius: 8px; display: flex; align-items: center; gap: 5px;
        }
        .garant-save-badge--saving { color: var(--text-muted); background: var(--bg-soft); }
        .garant-save-badge--saved { color: #4A7C59; background: #EAF3EE; }
        .garant-save-badge--error { color: #9B3A2A; background: #FAECEC; }

        .btn-del-garant {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px;
          background: transparent; font-size: 12px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; font-family: inherit;
          transition: all 0.12s;
        }
        .btn-del-garant:hover { color: #9B3A2A; background: #FAECEC; border-color: #F5C6C0; }
        .btn-del-garant--confirm { color: #9B3A2A; background: #FAECEC; border-color: #F5C6C0; }
        .btn-del-cancel {
          padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px;
          background: transparent; font-size: 12px; font-weight: 600;
          color: var(--text-muted); cursor: pointer; font-family: inherit;
        }

        .garant-sub-section {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 16px; margin-bottom: 12px; overflow: hidden;
        }
        .garant-sub-hd {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-soft);
        }
        .garant-sub-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--brown-light); flex-shrink: 0;
        }
        .garant-sub-title { font-size: 15px; font-weight: 700; color: var(--brown); }
        .garant-sub-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .garant-sub-body { padding: 0 20px 20px; }

        .garant-doc-empty {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 0; font-size: 13px; color: var(--text-muted);
          margin-top: 12px;
        }
        .garant-save-error {
          font-size: 12px; color: #9B3A2A; background: #FAECEC;
          padding: 8px 12px; border-radius: 8px; margin-top: 8px;
        }
      `}</style>

      <div className={`garant-wrapper${isNew ? ' garant-wrapper--new' : ''}`}>
        {/* ── En-tête garant ── */}
        <div className="garant-wrapper-hd">
          <div className="garant-wrapper-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Garant {ordre}
            {displayName && (
              <span className="garant-wrapper-name">— {displayName}</span>
            )}
          </div>

          <div className="garant-wrapper-right">
            {saveState !== 'idle' && (
              <div className={`garant-save-badge garant-save-badge--${saveState}`}>
                {saveState === 'saving' && (
                  <><div className="docup-spinner" /><span>Sauvegarde…</span></>
                )}
                {saveState === 'saved' && (
                  <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Enregistré</span></>
                )}
                {saveState === 'error' && <span>Erreur</span>}
              </div>
            )}

            {confirmDelete ? (
              <>
                <span style={{ fontSize: 12, color: '#9B3A2A', fontWeight: 600 }}>Confirmer ?</span>
                <button
                  type="button"
                  className="btn-del-garant btn-del-garant--confirm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? '…' : 'Oui, supprimer'}
                </button>
                <button type="button" className="btn-del-cancel" onClick={() => setConfirmDelete(false)}>
                  Annuler
                </button>
              </>
            ) : (
              <button type="button" className="btn-del-garant" onClick={() => setConfirmDelete(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Supprimer ce garant
              </button>
            )}
          </div>
        </div>

        {/* ── Bloc 1 : Informations personnelles ── */}
        <div className="garant-sub-section">
          <div className="garant-sub-hd">
            <div className="garant-sub-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div className="garant-sub-title">Informations personnelles</div>
              <div className="garant-sub-sub">Identité civile et coordonnées</div>
            </div>
          </div>

          <div className="garant-sub-body">
            <div className="field-grid">
              {/* Type de garant */}
              <div className="field-full">
                <label className="field-label">Type de garant</label>
                <div className="radio-toggle" style={{ marginTop: 5 }}>
                  <label className="radio-toggle-label">
                    <input
                      type="radio"
                      name={`g${ordre}-type`}
                      value="physique"
                      checked={form.typeGarant === 'physique'}
                      onChange={() => handleTypeGarantChange('physique')}
                      className="radio-toggle-input"
                    />
                    <span className="radio-toggle-btn">Physique</span>
                  </label>
                  <label className="radio-toggle-label">
                    <input
                      type="radio"
                      name={`g${ordre}-type`}
                      value="organisme"
                      checked={form.typeGarant === 'organisme'}
                      onChange={() => handleTypeGarantChange('organisme')}
                      className="radio-toggle-input"
                    />
                    <span className="radio-toggle-btn">Organisme</span>
                  </label>
                </div>
              </div>

              {form.typeGarant === 'organisme' ? (
                <div className="field-full">
                  <label className="field-label">Nom de l&apos;organisme <span className="field-required">*</span></label>
                  <input
                    className="field-input"
                    value={form.nomOrganisme}
                    onChange={e => updateForm('nomOrganisme', e.target.value)}
                    placeholder="Visale, Action Logement…"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="field-label">Prénom <span className="field-required">*</span></label>
                    <input
                      className="field-input"
                      value={form.prenom}
                      onChange={e => updateForm('prenom', e.target.value)}
                      placeholder="Marie"
                    />
                  </div>
                  <div>
                    <label className="field-label">Nom <span className="field-required">*</span></label>
                    <input
                      className="field-input"
                      value={form.nom}
                      onChange={e => updateForm('nom', e.target.value)}
                      placeholder="Dupont"
                    />
                  </div>
                  <div>
                    <label className="field-label">Date de naissance</label>
                    <input
                      className="field-input"
                      type="date"
                      value={form.dateNaissance}
                      onChange={e => updateForm('dateNaissance', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Nationalité</label>
                    <input
                      className="field-input"
                      value={form.nationalite}
                      onChange={e => updateForm('nationalite', e.target.value)}
                      placeholder="Française"
                    />
                  </div>
                  <div>
                    <label className="field-label">Téléphone</label>
                    <input
                      className="field-input"
                      type="tel"
                      value={form.telephone}
                      onChange={e => updateForm('telephone', e.target.value)}
                      placeholder="06 00 00 00 00"
                    />
                  </div>
                  <div>
                    <label className="field-label">Adresse actuelle</label>
                    <input
                      className="field-input"
                      value={form.adresse}
                      onChange={e => updateForm('adresse', e.target.value)}
                      placeholder="12 rue de la Paix, Paris"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bloc 2 : Situation professionnelle (masqué si Organisme) ── */}
        {form.typeGarant === 'physique' && (
          <div className="garant-sub-section">
            <div className="garant-sub-hd">
              <div className="garant-sub-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              <div>
                <div className="garant-sub-title">Situation professionnelle</div>
                <div className="garant-sub-sub">Revenus et emploi du garant</div>
              </div>
            </div>

            <div className="garant-sub-body">
              <div className="field-grid">
                <div>
                  <label className="field-label">Situation professionnelle</label>
                  <select
                    className="field-select"
                    value={form.situationPro}
                    onChange={e => handleChangeSituation(e.target.value)}
                    aria-controls={`g${ordre}-subfields`}
                    aria-expanded={SITUATIONS_WITH_SUBFIELDS.includes(form.situationPro)}
                  >
                    {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Type de revenus</label>
                  <input
                    className="field-input"
                    value={form.typeRevenus}
                    onChange={e => updateForm('typeRevenus', e.target.value)}
                    placeholder="Salaire, pension, allocations…"
                  />
                </div>

                {/* Sous-champs conditionnels */}
                <div className="field-full">
                  <div
                    id={`g${ordre}-subfields`}
                    className={`subfields-outer${SITUATIONS_WITH_SUBFIELDS.includes(form.situationPro) ? ' open' : ''}`}
                    role="region"
                    aria-live="polite"
                    aria-atomic="false"
                  >
                    <div className="subfields-inner">
                      {/* CDI — Période d'essai */}
                      {form.situationPro === 'salarie_cdi' && (
                        <div>
                          <div className="subfields-section-label">Précisions CDI</div>
                          <div role="radiogroup" aria-labelledby={`g${ordre}-label-pe`}>
                            <label id={`g${ordre}-label-pe`} className="field-label">
                              Période d&apos;essai
                            </label>
                            <div className="radio-toggle" style={{ marginTop: 5 }}>
                              <label className="radio-toggle-label">
                                <input
                                  type="radio"
                                  name={`g${ordre}-pe`}
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
                                  name={`g${ordre}-pe`}
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
                      {form.situationPro === 'salarie_cdd' && (
                        <div>
                          <div className="subfields-section-label">Précisions CDD</div>
                          <div className="subfields-grid">
                            <div>
                              <label className="field-label" htmlFor={`g${ordre}-cdd-debut`}>Date de début</label>
                              <input
                                id={`g${ordre}-cdd-debut`}
                                className={`field-input${cddDateError ? ' field-input--error' : ''}`}
                                value={cddDebut}
                                onChange={e => { setCddDebut(e.target.value); validateCddDates(e.target.value, cddFin) }}
                                placeholder="MM/AAAA"
                                inputMode="numeric"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`g${ordre}-cdd-fin`}>Date de fin</label>
                              <input
                                id={`g${ordre}-cdd-fin`}
                                className={`field-input${cddDateError ? ' field-input--error' : ''}`}
                                value={cddFin}
                                onChange={e => { setCddFin(e.target.value); validateCddDates(cddDebut, e.target.value) }}
                                placeholder="MM/AAAA"
                                inputMode="numeric"
                              />
                            </div>
                            {cddDateError && (
                              <div className="field-full">
                                <p className="field-error-msg" role="alert">{cddDateError}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Indépendant */}
                      {form.situationPro === 'independant' && (
                        <div>
                          <div className="subfields-section-label">Précisions activité indépendante</div>
                          <div className="subfields-grid">
                            <div>
                              <label className="field-label" htmlFor={`g${ordre}-activite-depuis`}>Activité exercée depuis</label>
                              <input
                                id={`g${ordre}-activite-depuis`}
                                className="field-input"
                                type="number"
                                min="1970"
                                max={new Date().getFullYear()}
                                value={activiteDepuis}
                                onChange={e => setActiviteDepuis(e.target.value)}
                                placeholder="Ex. 2019"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`g${ordre}-type-activite`}>Type d&apos;activité</label>
                              <select
                                id={`g${ordre}-type-activite`}
                                className="field-select"
                                value={typeActivite}
                                onChange={e => setTypeActivite(e.target.value)}
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
                  <label className="field-label">Revenus mensuels nets (€) <span className="field-required">*</span></label>
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    value={form.revenus || ''}
                    onChange={e => updateForm('revenus', parseFloat(e.target.value) || 0)}
                    placeholder="2 500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Bloc 3 : Documents ── */}
        <div className="garant-sub-section">
          <div className="garant-sub-hd">
            <div className="garant-sub-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <div className="garant-sub-title">Documents</div>
              <div className="garant-sub-sub">
                {form.typeGarant === 'organisme'
                  ? "Attestation de garantie de l’organisme"
                  : 'Justificatifs selon sa situation'}
              </div>
            </div>
          </div>

          <div className="garant-sub-body">
            {!garantDbId ? (
              <div className="garant-doc-empty">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Renseignez les informations du garant pour activer l&apos;ajout de documents.
              </div>
            ) : (
              docTypes.map(dt => {
                const docs = garantDocs.filter(d => d.type_document === dt.type)
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
                      onAdded={onDocAdded}
                      onRemoved={onDocRemoved}
                      garantId={garantDbId}
                      storagePrefix={garantPrefix}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {saveError && <div className="garant-save-error">{saveError}</div>}
      </div>
    </>
  )
}
