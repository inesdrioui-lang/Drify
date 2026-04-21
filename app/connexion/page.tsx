'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { signIn } from '@/app/auth/actions'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: {email?: string; password?: string} = {}
    if (!email) newErrors.email = "L'email est obligatoire."
    else if (!validateEmail(email)) newErrors.email = 'Veuillez entrer un email valide.'
    if (!password) newErrors.password = 'Le mot de passe est obligatoire.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      setServerError('')
      const fd = new FormData()
      fd.append('email', email)
      fd.append('password', password)
      const result = await signIn(fd)
      if (result?.error) setServerError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        nav {
          position: sticky; top: 0; z-index: 100;
          height: 60px; display: flex; align-items: center; padding: 0 40px;
          background: rgba(253,252,250,0.85); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-soft);
        }
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
        .auth-card h1 { font-size: 22px; font-weight: 700; color: var(--brown); text-align: center; letter-spacing: -0.4px; margin-bottom: 6px; }
        .auth-subtitle { font-size: 14px; color: var(--text-muted); text-align: center; margin-bottom: 28px; }
        .field-group { margin-bottom: 16px; }
        .field-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .field-group input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .field-group input:focus { border-color: var(--brown-light); box-shadow: 0 0 0 3px rgba(150,118,106,0.12); }
        .field-group input.error { border-color: var(--error); }
        .input-wrap { position: relative; }
        .input-wrap input { padding-right: 44px; }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-light); display: flex; align-items: center; transition: color 0.15s; }
        .eye-btn:hover { color: var(--brown-mid); }
        .field-error { display: block; font-size: 12px; color: var(--error); margin-top: 5px; min-height: 16px; }
        .btn-submit { width: 100%; padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; background: var(--brown); border: none; font-family: inherit; transition: opacity 0.15s; margin-top: 8px; }
        .btn-submit:hover { opacity: 0.85; }
        .forgot-link { display: block; text-align: center; font-size: 13px; color: var(--text-muted); text-decoration: none; margin-top: 14px; transition: color 0.15s; }
        .forgot-link:hover { color: var(--brown); }
        .separator { display: flex; align-items: center; gap: 12px; margin: 22px 0; color: var(--text-light); font-size: 12px; }
        .separator::before, .separator::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .auth-switch { text-align: center; font-size: 13px; color: var(--text-muted); }
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
        .footer-bottom a:hover { color: var(--text-muted); }
        .footer-links { display: flex; gap: 18px; }

        @media (max-width: 960px) { .footer-top { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 620px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .auth-card { padding: 32px 24px 28px; }
          footer { padding: 36px 20px 28px; }
          .footer-top { grid-template-columns: 1fr; }
        }
      `}</style>


      <main className="auth-page">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            <Image src="/logo.svg" height={36} width={90} style={{width:'auto'}} alt="Drify" />
          </Link>

          <h1>Bon retour sur Drify</h1>
          <p className="auth-subtitle">Connectez-vous à votre compte</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                type="email" id="email" name="email"
                placeholder="votre@email.com" autoComplete="email"
                className={errors.email ? 'error' : ''}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ''})) }}
              />
              <span className="field-error">{errors.email || ''}</span>
            </div>

            <div className="field-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" name="password"
                  placeholder="Votre mot de passe" autoComplete="current-password"
                  className={errors.password ? 'error' : ''}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ''})) }}
                />
                <button type="button" className="eye-btn" aria-label="Afficher le mot de passe" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <span className="field-error">{errors.password || ''}</span>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </button>
            {serverError && (
              <p style={{color:'var(--error)',fontSize:'13px',textAlign:'center',marginTop:'10px'}}>
                {serverError}
              </p>
            )}
          </form>

          <a href="#" className="forgot-link">Mot de passe oublié ?</a>

          <div className="separator"><span>ou</span></div>

          <p className="auth-switch">Pas encore de compte ? <Link href="/inscription">S&apos;inscrire</Link></p>
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
