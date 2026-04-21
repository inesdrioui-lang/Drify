'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { signUp } from '@/app/auth/actions'

export default function InscriptionPage() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirm: '', telephone: '', ville: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [profileError, setProfileError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function updateField(field: string, value: string) {
    setForm(prev => ({...prev, [field]: value}))
    setErrors(prev => ({...prev, [field]: ''}))
  }

  function validateEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!selectedProfile) { setProfileError('Veuillez choisir un profil.') }
    else setProfileError('')
    if (!form.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire.'
    if (!form.nom.trim()) newErrors.nom = 'Le nom est obligatoire.'
    if (!form.email.trim()) newErrors.email = "L'email est obligatoire."
    else if (!validateEmail(form.email)) newErrors.email = 'Veuillez entrer un email valide.'
    if (!form.password) newErrors.password = 'Le mot de passe est obligatoire.'
    else if (form.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    if (!form.confirm) newErrors.confirm = 'Veuillez confirmer votre mot de passe.'
    else if (form.confirm !== form.password) newErrors.confirm = 'Les mots de passe ne correspondent pas.'
    if (selectedProfile === 'proprietaire') {
      if (!form.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire.'
      if (!form.ville.trim()) newErrors.ville = 'La ville est obligatoire.'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0 && selectedProfile) {
      setIsLoading(true)
      setServerError('')
      const fd = new FormData()
      fd.append('email', form.email)
      fd.append('password', form.password)
      fd.append('role', selectedProfile)
      fd.append('prenom', form.prenom)
      fd.append('nom', form.nom)
      fd.append('telephone', form.telephone)
      const result = await signUp(fd)
      if (result?.error) {
        setServerError(result.error)
        setIsLoading(false)
      } else if (result?.success) {
        setEmailSent(true)
        setIsLoading(false)
      }
    }
  }

  const eyeOpen = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  const eyeClosed = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

  return (
    <>
      <style>{`
        nav { position: sticky; top: 0; z-index: 100; height: 60px; display: flex; align-items: center; padding: 0 40px; background: rgba(253,252,250,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-soft); }
        .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-right: 48px; flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
        .nav-links a:hover { color: var(--brown); background: var(--bg-soft); }
        .nav-end { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-ghost { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: var(--brown-mid); border: 1px solid var(--border); background: transparent; transition: background 0.15s; font-family: inherit; white-space: nowrap; }
        .btn-ghost:hover { background: var(--bg-soft); }
        .btn-primary { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: #fff; background: var(--brown); border: none; transition: opacity 0.15s; font-family: inherit; white-space: nowrap; }
        .btn-primary:hover { opacity: 0.85; }

        body { display: flex; flex-direction: column; min-height: 100vh; }
        .auth-page { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 20px; }
        .auth-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 4px 24px rgba(61,46,34,0.07); padding: 40px 40px 36px; width: 100%; max-width: 480px; }
        .auth-logo { display: flex; justify-content: center; margin-bottom: 28px; text-decoration: none; }
        .auth-card h1 { font-size: 22px; font-weight: 700; color: var(--brown); text-align: center; letter-spacing: -0.4px; margin-bottom: 24px; }
        .profile-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .profile-card { border: 1.5px solid var(--border); border-radius: 12px; padding: 16px 12px; cursor: pointer; text-align: center; transition: border-color 0.15s, background 0.15s; user-select: none; }
        .profile-card:hover { border-color: var(--brown-light); background: var(--bg-soft); }
        .profile-card.selected { border-color: var(--brown); background: #F5EDE7; }
        .profile-label { font-size: 13px; font-weight: 700; color: var(--brown); display: block; margin-bottom: 3px; }
        .profile-desc { font-size: 12px; color: var(--text-muted); }
        .profile-error { display: block; font-size: 12px; color: var(--error); margin-top: -16px; margin-bottom: 16px; min-height: 16px; }
        .field-group { margin-bottom: 16px; }
        .field-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .field-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .field-group input:focus { border-color: var(--brown-light); box-shadow: 0 0 0 3px rgba(150,118,106,0.12); }
        .field-group input.error { border-color: var(--error); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .input-wrap { position: relative; }
        .input-wrap input { padding-right: 44px; }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-light); display: flex; align-items: center; transition: color 0.15s; }
        .eye-btn:hover { color: var(--brown-mid); }
        .field-error { display: block; font-size: 12px; color: var(--error); margin-top: 5px; min-height: 16px; }
        .proprietaire-fields { display: none; border-top: 1px solid var(--border-soft); margin-top: 4px; padding-top: 16px; }
        .proprietaire-fields.visible { display: block; }
        .proprietaire-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-light); margin-bottom: 12px; }
        .btn-submit { width: 100%; padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; background: var(--brown); border: none; font-family: inherit; transition: opacity 0.15s; margin-top: 8px; }
        .btn-submit:hover { opacity: 0.85; }
        .auth-switch { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 20px; }
        .auth-switch a { color: var(--brown); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }

        footer { border-top: 1px solid var(--border); padding: 48px 40px 36px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 36px; }
        .footer-brand p { font-size: 13px; color: var(--text-muted); margin-top: 10px; line-height: 1.65; max-width: 240px; }
        .footer-col h4 { font-size: 12px; font-weight: 700; color: var(--text); letter-spacing: 0.3px; margin-bottom: 12px; }
        .footer-col a { display: block; font-size: 13px; color: var(--text-muted); text-decoration: none; margin-bottom: 7px; transition: color 0.15s; }
        .footer-col a:hover { color: var(--brown); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding-top: 20px; border-top: 1px solid var(--border-soft); }
        .footer-bottom p, .footer-bottom a { font-size: 12px; color: var(--text-light); text-decoration: none; }
        .footer-links { display: flex; gap: 18px; }

        @media (max-width: 960px) { .footer-top { grid-template-columns: 1fr 1fr; } }
        /* Modal confirmation email */
        .email-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(15,10,5,0.45);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: overlayIn 0.2s ease-out;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .email-modal {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 20px; padding: 40px 36px;
          max-width: 420px; width: 100%; text-align: center;
          box-shadow: 0 20px 60px rgba(61,46,34,0.18);
          animation: modalIn 0.25s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .email-modal-icon {
          width: 64px; height: 64px; border-radius: 18px;
          background: #F5EDE7; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; color: var(--brown);
        }
        .email-modal h2 {
          font-size: 20px; font-weight: 800;
          color: var(--brown); letter-spacing: -0.4px; margin-bottom: 10px;
        }
        .email-modal p {
          font-size: 14px; color: var(--text-muted);
          line-height: 1.6; margin-bottom: 8px;
        }
        .email-modal p strong { color: var(--text); font-weight: 600; }
        .email-modal .hint {
          font-size: 12px; color: var(--text-light);
          margin-top: 16px; margin-bottom: 24px;
        }
        .btn-modal-primary {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; padding: 12px 20px; border-radius: 10px;
          font-size: 14px; font-weight: 600; color: #fff;
          background: var(--brown); text-decoration: none;
          transition: opacity 0.15s; font-family: inherit;
        }
        .btn-modal-primary:hover { opacity: 0.85; }

        @media (max-width: 620px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .auth-card { padding: 32px 24px 28px; }
          .field-row { grid-template-columns: 1fr; }
          footer { padding: 36px 20px 28px; }
          .footer-top { grid-template-columns: 1fr; }
          .email-modal { padding: 32px 24px; }
        }
      `}</style>


      {emailSent && (
        <div className="email-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="email-modal">
            <div className="email-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 id="modal-title">Vérifiez votre email</h2>
            <p>Un lien de confirmation a été envoyé à</p>
            <p><strong>{form.email}</strong></p>
            <p className="hint">
              Cliquez sur le lien dans l&apos;email pour activer votre compte.<br/>
              Vérifiez aussi vos spams si vous ne le voyez pas.
            </p>
            <Link href="/connexion" className="btn-modal-primary">
              Aller à la page de connexion
            </Link>
          </div>
        </div>
      )}

      <main className="auth-page">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            <Image src="/logo.svg" height={36} width={90} style={{width:'auto'}} alt="Drify" />
          </Link>

          <h1>Rejoindre Drify</h1>

          <div className="profile-selector" role="group" aria-label="Choisir un profil">
            <div
              className={`profile-card${selectedProfile === 'locataire' ? ' selected' : ''}`}
              role="button" tabIndex={0}
              aria-pressed={selectedProfile === 'locataire'}
              onClick={() => { setSelectedProfile('locataire'); setProfileError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProfile('locataire'); setProfileError('') } }}
            >
              <span className="profile-label">Locataire</span>
              <span className="profile-desc">Je recherche un logement</span>
            </div>
            <div
              className={`profile-card${selectedProfile === 'proprietaire' ? ' selected' : ''}`}
              role="button" tabIndex={0}
              aria-pressed={selectedProfile === 'proprietaire'}
              onClick={() => { setSelectedProfile('proprietaire'); setProfileError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProfile('proprietaire'); setProfileError('') } }}
            >
              <span className="profile-label">Propriétaire</span>
              <span className="profile-desc">Je publie des annonces</span>
            </div>
          </div>
          <span className="profile-error">{profileError}</span>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="prenom">Prénom</label>
                <input type="text" id="prenom" placeholder="Marie" autoComplete="given-name" className={errors.prenom ? 'error' : ''} value={form.prenom} onChange={e => updateField('prenom', e.target.value)} />
                <span className="field-error">{errors.prenom || ''}</span>
              </div>
              <div className="field-group">
                <label htmlFor="nom">Nom</label>
                <input type="text" id="nom" placeholder="Duval" autoComplete="family-name" className={errors.nom ? 'error' : ''} value={form.nom} onChange={e => updateField('nom', e.target.value)} />
                <span className="field-error">{errors.nom || ''}</span>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="votre@email.com" autoComplete="email" className={errors.email ? 'error' : ''} value={form.email} onChange={e => updateField('email', e.target.value)} />
              <span className="field-error">{errors.email || ''}</span>
            </div>

            <div className="field-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrap">
                <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Minimum 8 caractères" autoComplete="new-password" className={errors.password ? 'error' : ''} value={form.password} onChange={e => updateField('password', e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? eyeClosed : eyeOpen}</button>
              </div>
              <span className="field-error">{errors.password || ''}</span>
            </div>

            <div className="field-group">
              <label htmlFor="confirm">Confirmer le mot de passe</label>
              <div className="input-wrap">
                <input type={showConfirm ? 'text' : 'password'} id="confirm" placeholder="Répétez votre mot de passe" autoComplete="new-password" className={errors.confirm ? 'error' : ''} value={form.confirm} onChange={e => updateField('confirm', e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? eyeClosed : eyeOpen}</button>
              </div>
              <span className="field-error">{errors.confirm || ''}</span>
            </div>

            <div className={`proprietaire-fields${selectedProfile === 'proprietaire' ? ' visible' : ''}`}>
              <p className="proprietaire-label">Informations propriétaire</p>
              <div className="field-group">
                <label htmlFor="telephone">Téléphone</label>
                <input type="tel" id="telephone" placeholder="06 12 34 56 78" autoComplete="tel" className={errors.telephone ? 'error' : ''} value={form.telephone} onChange={e => updateField('telephone', e.target.value)} />
                <span className="field-error">{errors.telephone || ''}</span>
              </div>
              <div className="field-group">
                <label htmlFor="ville">Ville principale de vos biens</label>
                <input type="text" id="ville" placeholder="Toulouse" className={errors.ville ? 'error' : ''} value={form.ville} onChange={e => updateField('ville', e.target.value)} />
                <span className="field-error">{errors.ville || ''}</span>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
            {serverError && (
              <p style={{color:'var(--error)',fontSize:'13px',textAlign:'center',marginTop:'10px'}}>
                {serverError}
              </p>
            )}
          </form>

          <p className="auth-switch">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <Image src="/logo.svg" height={28} width={70} style={{width:'auto'}} alt="Drify" />
              </Link>
              <p>La plateforme qui simplifie toute l&apos;expérience locative.</p>
            </div>
            <div className="footer-col">
              <h4>Plateforme</h4>
              <Link href="/recherche">Rechercher</Link>
              <Link href="/publier">Publier</Link>
              <Link href="/profil">Mon dossier</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className="footer-col">
              <h4>Fonctionnalités</h4>
              <a href="#">Passeport Locataire</a>
              <a href="#">Score de confiance</a>
              <Link href="/messages">Messagerie</Link>
              <a href="#">Génération de baux</a>
            </div>
            <div className="footer-col">
              <h4>Entreprise</h4>
              <a href="#">À propos</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
              <a href="#">Tarifs</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Drify</p>
            <div className="footer-links">
              <a href="#">Confidentialité</a>
              <a href="#">CGU</a>
              <a href="#">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
