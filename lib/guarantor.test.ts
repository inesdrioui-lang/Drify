import { describe, it, expect } from 'vitest'
import { evaluateGuarantor } from './guarantor'

const LOYER = 700
const SEUIL = LOYER * 3 // 2100

function dateInFuture(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d
}

function dateInPast(years: number): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d
}

describe('evaluateGuarantor', () => {
  // ── CDI ──────────────────────────────────────────────────────────────
  describe('CDI', () => {
    it('hors période essai + revenus OK → pas de garant', () => {
      const r = evaluateGuarantor({ statut: 'cdi', periodeEssai: false, revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(false)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(0)
    })

    it('hors période essai + revenus KO → garant pour revenus seuls', () => {
      const r = evaluateGuarantor({ statut: 'cdi', periodeEssai: false, revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(1)
    })

    it('en période essai + revenus OK → garant pour profil seul', () => {
      const r = evaluateGuarantor({ statut: 'cdi', periodeEssai: true, revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(1)
      expect(r.reasons[0]).toContain("période d'essai")
    })

    it('en période essai + revenus KO → garant pour profil ET revenus', () => {
      const r = evaluateGuarantor({ statut: 'cdi', periodeEssai: true, revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(2)
    })
  })

  // ── CDD ──────────────────────────────────────────────────────────────
  describe('CDD', () => {
    it('≥6 mois restants + revenus OK → pas de garant', () => {
      const r = evaluateGuarantor({ statut: 'cdd', dateFin: dateInFuture(8), revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(false)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(0)
    })

    it('≥6 mois restants + revenus KO → garant pour revenus seuls', () => {
      const r = evaluateGuarantor({ statut: 'cdd', dateFin: dateInFuture(8), revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(1)
    })

    it('<6 mois restants + revenus OK → garant pour profil seul', () => {
      const r = evaluateGuarantor({ statut: 'cdd', dateFin: dateInFuture(4), revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(1)
      expect(r.reasons[0]).toContain('6 mois')
    })

    it('<6 mois restants + revenus KO → garant pour profil ET revenus', () => {
      const r = evaluateGuarantor({ statut: 'cdd', dateFin: dateInFuture(4), revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(2)
    })
  })

  // ── Freelance ─────────────────────────────────────────────────────────
  describe('Freelance', () => {
    it('≥2 ans ancienneté + revenus OK → pas de garant', () => {
      const r = evaluateGuarantor({ statut: 'freelance', dateDebutActivite: dateInPast(3), revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(false)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(0)
    })

    it('≥2 ans ancienneté + revenus KO → garant pour revenus seuls', () => {
      const r = evaluateGuarantor({ statut: 'freelance', dateDebutActivite: dateInPast(3), revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(true)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(1)
    })

    it('<2 ans ancienneté + revenus OK → garant pour profil seul', () => {
      const r = evaluateGuarantor({ statut: 'freelance', dateDebutActivite: dateInPast(1), revenuMensuelNet: SEUIL, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(true)
      expect(r.reasons).toHaveLength(1)
      expect(r.reasons[0]).toContain('2 ans')
    })

    it('<2 ans ancienneté + revenus KO → garant pour profil ET revenus', () => {
      const r = evaluateGuarantor({ statut: 'freelance', dateDebutActivite: dateInPast(1), revenuMensuelNet: SEUIL - 1, loyerMensuel: LOYER })
      expect(r.required).toBe(true)
      expect(r.profilOk).toBe(false)
      expect(r.revenusOk).toBe(false)
      expect(r.reasons).toHaveLength(2)
    })
  })
})
