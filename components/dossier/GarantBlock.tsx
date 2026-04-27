'use client'

import { useState } from 'react'
import { saveGarant, deleteGarant } from '@/app/locataire/dossier/actions'
import type { GarantData } from '@/app/locataire/dossier/actions'
import type { DocEntry } from '@/components/dossier/DocumentUpload'
import DocumentUpload from '@/components/dossier/DocumentUpload'

const SITUATIONS = [
  { value: 'salarie_cdi', label: 'Salarié CDI' },
  { value: 'salarie_cdd', label: 'Salarié CDD' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'independant', label: 'Indépendant / Freelance' },
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'retraite', label: 'Retraité(e)' },
  { value: 'sans_emploi', label: 'Sans emploi' },
  { value: 'autre', label: 'Autre' },
]

const LIENS = [
  { value: 'parent', label: 'Parent' },
  { value: 'frere_soeur', label: 'Frère / Sœur' },
  { value: 'grands_parents', label: 'Grands-parents' },
  { value: 'ami', label: 'Ami(e)' },
  { value: 'conjoint', label: 'Conjoint(e)' },
  { value: 'autre', label: 'Autre' },
]

const TYPE_ACTIVITE = [
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

function getGarantDocTypes(situationPro: string) {
  const base = [
    { type: 'identite', label: "Pièce d'identité", description: 'CNI ou passeport en cours de validité', required: true },
    { type: 'justificatif_domicile', label: 'Justificatif de domicile', description: 'Taxe foncière ou 3 dernières quittances de loyer', required: true },
    { type: 'avis_imposition', label: "Avis d'imposition", description: 'Dernier avis d\'imposition', required: true },
  ]

  if (situationPro === 'salarie_cdi' || situationPro === 'salarie_cdd' || situationPro === 'fonctionnaire') {
    return [
      ...base,
      { type: 'fiches_salaire', label: 'Bulletins de salaire', description: '3 derniers bulletins de salaire', required: true },
      { type: 'contrat_travail', label: 'Contrat de travail', description: 'Contrat de travail ou attestation employeur', required: true },
    ]
  }

  if (situationPro === 'independant') {
    return [
      ...base,
      { type: 'kbis', label: 'Extrait Kbis / Statuts', description: 'Kbis de moins de 3 mois ou statuts de l\'entreprise', required: true },
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

  const [formOpen, setFormOpen] = useState(!initialGarant)
  const [garantDbId, setGarantDbId] = useState(initialGarant?.id ?? '')
  const [prenom, setPrenom] = useState(initialGarant?.prenom ?? '')
  const [nom, setNom] = useState(initialGarant?.nom ?? '')
  const [email, setEmail] = useState(initialGarant?.email ?? '')
  const [telephone, setTelephone] = useState(initialGarant?.telephone ?? '')
  const [lien, setLien] = useState(initialGarant?.lien ?? 'parent')
  const [situationPro, setSituationPro] = useState(initialGarant?.situation_pro ?? 'salarie_cdi')
  const [revenus, setRevenus] = useState<number>(initialGarant?.revenus_mensuels ?? 0)

  // Extended local fields (not in Supabase schema yet)
  const [dateNaissance, setDateNaissance] = useState('')
  const [adresse, setAdresse] = useState('')

  // Subfields (local)
  const [periodeEssai, setPeriodeEssai] = useState<'oui' | 'non' | ''>('')
  const [cddDebut, setCddDebut] = useState('')
  const [cddFin, setCddFin] = useState('')
  const [activiteDepuis, setActiviteDepuis] = useState('')
  const [typeActivite, setTypeActivite] = useState('')
  const [cddDateError, setCddDateError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')

  function validateCddDates(debut: string, fin: string) {
    if (!debut || !fin) { setCddDateError(null); return }
    const d = parseMMAAAA(debut)
    const f = parseMMAAAA(fin)
    if (!d || !f) { setCddDateError(null); return }
    if (f <= d) setCddDateError('La date de fin doit être postérieure à la date de début.')
    else setCddDateError(null)
  }

  function handleChangeSituation(val: string) {
    setSituationPro(val)
    setPeriodeEssai('')
    setCddDebut('')
    setCddFin('')
    setActiviteDepuis('')
    setTypeActivite('')
    setCddDateError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!prenom || !nom || !revenus) {
      setSaveError('Prénom, nom et revenus mensuels sont obligatoires.')
      return
    }
    setSaving(true)
    setSaveError('')
    const data: GarantData = {
      id: garantDbId || undefined,
      prenom, nom, email, telephone, lien,
      situation_pro: situationPro,
      revenus_mensuels: revenus,
      ordre,
    }
    const result = await saveGarant(data)
    setSaving(false)
    if (result.error) { setSaveError(result.error); return }
    const saved = { ...data, id: result.id! }
    setGarantDbId(result.id!)
    onSaved(saved)
    setFormOpen(false)
  }

  async function handleDelete() {
    if (garantDbId) {
      setDeleting(true)
      await deleteGarant(garantDbId)
    }
    onDeleted(garantDbId)
  }

  const garantDocTypes = getGarantDocTypes(situationPro)
  const garantDocs = allDocuments.filter(d => d.fichier_path.includes(`/${garantPrefix}/`))

  return (
    <div className={`gblock${isNew ? ' gblock--animated' : ''}`}>
      {/* Summary card (collapsed) */}
      {!formOpen ? (
        <div className="gblock-summary">
          <div className="gblock-summary-info">
            <div className="gblock-summary-name">{prenom} {nom}</div>
            <div className="gblock-summary-meta">
              {LIENS.find(l => l.value === lien)?.label}
              {' · '}{SITUATIONS.find(s => s.value === situationPro)?.label}
              {' · '}{revenus.toLocaleString('fr-FR')} €/mois
            </div>
          </div>
          <div className="gblock-summary-actions">
            <button type="button" onClick={() => setFormOpen(true)} className="btn-garant-edit">
              Modifier
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-garant-delete"
              aria-label={`Supprimer le garant ${prenom} ${nom}`}
            >
              {deleting ? '…' : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Full form */
        <form className="gblock-form" onSubmit={handleSave} noValidate>
          <div className="gblock-form-header">
            <span className="gblock-form-title">Garant {ordre}</span>
            {initialGarant && (
              <button type="button" onClick={() => setFormOpen(false)} className="btn-garant-cancel">
                Annuler
              </button>
            )}
          </div>

          {/* 3a — Informations */}
          <div className="gblock-subsec">
            <div className="gblock-subsec-title">Informations</div>
            <div className="gblock-grid">
              <div>
                <label className="field-label">Prénom <span className="field-required">*</span></label>
                <input className="field-input" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Marie" disabled={saving} />
              </div>
              <div>
                <label className="field-label">Nom <span className="field-required">*</span></label>
                <input className="field-input" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" disabled={saving} />
              </div>
              <div>
                <label className="field-label">Date de naissance</label>
                <input className="field-input" type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} disabled={saving} />
              </div>
              <div>
                <label className="field-label">Lien avec vous</label>
                <select className="field-select" value={lien} onChange={e => setLien(e.target.value)} disabled={saving}>
                  {LIENS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@email.com" disabled={saving} />
              </div>
              <div>
                <label className="field-label">Téléphone</label>
                <input className="field-input" type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 00 00 00 00" disabled={saving} />
              </div>
              <div className="gblock-col-full">
                <label className="field-label">Adresse actuelle</label>
                <input className="field-input" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="12 rue de la Paix, Paris" disabled={saving} />
              </div>
            </div>
          </div>

          {/* 3b — Situation professionnelle */}
          <div className="gblock-subsec">
            <div className="gblock-subsec-title">Situation professionnelle</div>
            <div className="gblock-grid">
              <div>
                <label className="field-label">Situation</label>
                <select
                  className="field-select"
                  value={situationPro}
                  onChange={e => handleChangeSituation(e.target.value)}
                  disabled={saving}
                  aria-controls={`gblock${ordre}-subfields`}
                  aria-expanded={SITUATIONS_WITH_SUBFIELDS.includes(situationPro)}
                >
                  {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Revenus mensuels nets (€) <span className="field-required">*</span></label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  value={revenus || ''}
                  onChange={e => setRevenus(parseFloat(e.target.value) || 0)}
                  placeholder="2 500"
                  disabled={saving}
                />
              </div>

              {/* Sous-champs conditionnels */}
              <div className="gblock-col-full">
                <div
                  id={`gblock${ordre}-subfields`}
                  className={`subfields-outer${SITUATIONS_WITH_SUBFIELDS.includes(situationPro) ? ' open' : ''}`}
                  role="region"
                  aria-live="polite"
                  aria-atomic="false"
                >
                  <div className="subfields-inner">
                    {/* CDI */}
                    {situationPro === 'salarie_cdi' && (
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
                                name={`g${ordre}-periode_essai`}
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
                                name={`g${ordre}-periode_essai`}
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

                    {/* CDD */}
                    {situationPro === 'salarie_cdd' && (
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
                            <div className="gblock-col-full">
                              <p className="field-error-msg" role="alert">{cddDateError}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Indépendant */}
                    {situationPro === 'independant' && (
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
                              {TYPE_ACTIVITE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {saveError && <div className="garant-error">{saveError}</div>}

          <div className="gblock-actions">
            <button type="submit" className="btn-garant-save" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer le garant'}
            </button>
          </div>
        </form>
      )}

      {/* 3c — Documents (only available once garant is saved in DB) */}
      {garantDbId && (
        <div className="gblock-docs">
          <div className="gblock-subsec-title" style={{ marginBottom: 12 }}>Documents du garant</div>
          {garantDocTypes.map(dt => {
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
          })}
        </div>
      )}
    </div>
  )
}
