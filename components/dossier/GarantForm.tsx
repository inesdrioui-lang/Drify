'use client'

import { useState } from 'react'
import { saveGarant, deleteGarant } from '@/app/locataire/dossier/actions'
import type { GarantData } from '@/app/locataire/dossier/actions'

interface GarantFormProps {
  ordre: 1 | 2
  initial?: GarantData & { id: string }
  onSaved: (g: GarantData & { id: string }) => void
  onDeleted: (id: string) => void
  disabled?: boolean
}

const SITUATIONS = [
  { value: 'salarie_cdi', label: 'Salarié CDI' },
  { value: 'salarie_cdd', label: 'Salarié CDD' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'independant', label: 'Indépendant / Freelance' },
  { value: 'retraite', label: 'Retraité' },
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

export default function GarantForm({ ordre, initial, onSaved, onDeleted, disabled }: GarantFormProps) {
  const [open, setOpen] = useState(!initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<GarantData>({
    id: initial?.id,
    prenom: initial?.prenom ?? '',
    nom: initial?.nom ?? '',
    email: initial?.email ?? '',
    telephone: initial?.telephone ?? '',
    lien: initial?.lien ?? 'parent',
    situation_pro: initial?.situation_pro ?? 'salarie_cdi',
    revenus_mensuels: initial?.revenus_mensuels ?? 0,
    ordre,
  })

  function set(field: keyof GarantData, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.prenom || !form.nom || !form.revenus_mensuels) {
      setError('Prénom, nom et revenus mensuels sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')
    const result = await saveGarant(form)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    const saved = { ...form, id: result.id! }
    onSaved(saved)
    setOpen(false)
  }

  async function handleDelete() {
    if (!form.id) return
    setDeleting(true)
    await deleteGarant(form.id)
    onDeleted(form.id)
  }

  if (!open && initial) {
    return (
      <div className="garant-card">
        <div className="garant-card-info">
          <div className="garant-card-name">{initial.prenom} {initial.nom}</div>
          <div className="garant-card-meta">
            {LIENS.find(l => l.value === initial.lien)?.label} ·{' '}
            {SITUATIONS.find(s => s.value === initial.situation_pro)?.label} ·{' '}
            {initial.revenus_mensuels.toLocaleString('fr-FR')} €/mois
          </div>
        </div>
        <div className="garant-card-actions">
          <button type="button" onClick={() => setOpen(true)} className="btn-garant-edit">
            Modifier
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-garant-delete"
            aria-label="Supprimer ce garant"
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
    )
  }

  return (
    <form className="garant-form" onSubmit={handleSave} noValidate>
      <div className="garant-form-title">
        Garant {ordre === 2 ? '2' : '1'}
        {initial && (
          <button type="button" onClick={() => setOpen(false)} className="btn-garant-cancel">
            Annuler
          </button>
        )}
      </div>

      <div className="garant-grid">
        <div className="garant-field">
          <label className="field-label">Prénom *</label>
          <input
            className="field-input"
            value={form.prenom}
            onChange={e => set('prenom', e.target.value)}
            placeholder="Marie"
            disabled={disabled || saving}
          />
        </div>
        <div className="garant-field">
          <label className="field-label">Nom *</label>
          <input
            className="field-input"
            value={form.nom}
            onChange={e => set('nom', e.target.value)}
            placeholder="Dupont"
            disabled={disabled || saving}
          />
        </div>
        <div className="garant-field">
          <label className="field-label">Lien avec le garant</label>
          <select
            className="field-select"
            value={form.lien}
            onChange={e => set('lien', e.target.value)}
            disabled={disabled || saving}
          >
            {LIENS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div className="garant-field">
          <label className="field-label">Situation professionnelle</label>
          <select
            className="field-select"
            value={form.situation_pro}
            onChange={e => set('situation_pro', e.target.value)}
            disabled={disabled || saving}
          >
            {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="garant-field">
          <label className="field-label">Revenus mensuels nets * (€)</label>
          <input
            className="field-input"
            type="number"
            min="0"
            value={form.revenus_mensuels || ''}
            onChange={e => set('revenus_mensuels', parseFloat(e.target.value) || 0)}
            placeholder="2 500"
            disabled={disabled || saving}
          />
        </div>
        <div className="garant-field">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="marie@email.com"
            disabled={disabled || saving}
          />
        </div>
      </div>

      {error && <div className="garant-error">{error}</div>}

      <button type="submit" className="btn-garant-save" disabled={saving || disabled}>
        {saving ? 'Enregistrement…' : 'Enregistrer le garant'}
      </button>
    </form>
  )
}
