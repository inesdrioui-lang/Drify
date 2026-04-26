'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

interface MobileMenuProps {
  isLoggedIn: boolean
  role: string | null
}

export default function MobileMenu({ isLoggedIn, role }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  // Ferme le menu au changement de page
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isProprietaire = role === 'proprietaire'
  const isLocataire = role === 'locataire'

  function close() { setOpen(false) }

  return (
    <>
      <style>{`
        .hamburger-btn {
          display: none;
          align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 9px;
          border: 1px solid var(--border); background: transparent;
          color: var(--brown-mid); cursor: pointer; flex-shrink: 0;
          transition: background 0.15s;
        }
        .hamburger-btn:hover { background: var(--bg-soft); }
        @media (max-width: 620px) {
          .hamburger-btn { display: flex; }
        }

        .mobile-overlay {
          position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
          z-index: 98; background: rgba(253,252,250,0.97);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          overflow-y: auto; padding: 12px 16px 40px;
          animation: mmSlideIn 0.18s ease-out both;
        }
        @keyframes mmSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mm-link {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 11px;
          font-size: 16px; font-weight: 600; color: var(--brown);
          text-decoration: none; transition: background 0.12s;
        }
        .mm-link:hover { background: var(--bg-soft); }
        .mm-link-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--brown-light); flex-shrink: 0;
        }
        .mm-divider { height: 1px; background: var(--border-soft); margin: 8px 0; }
        .mm-auth-section { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
        .mm-btn-primary {
          display: block; width: 100%; padding: 14px 16px;
          border-radius: 11px; font-size: 15px; font-weight: 700;
          text-align: center; text-decoration: none;
          background: var(--brown); color: #fff; border: none;
          cursor: pointer; font-family: inherit; transition: opacity 0.15s;
        }
        .mm-btn-primary:hover { opacity: 0.88; }
        .mm-btn-ghost {
          display: block; width: 100%; padding: 14px 16px;
          border-radius: 11px; font-size: 15px; font-weight: 600;
          text-align: left; text-decoration: none;
          background: transparent; color: var(--brown-mid);
          border: 1px solid var(--border); cursor: pointer;
          font-family: inherit; transition: background 0.15s;
        }
        .mm-btn-ghost:hover { background: var(--bg-soft); }
      `}</style>

      <button
        className="hamburger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="mobile-overlay">
          {/* Navigation principale */}
          <Link className="mm-link" href="/" onClick={close}>
            <span className="mm-link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            Accueil
          </Link>
          <Link className="mm-link" href="/recherche" onClick={close}>
            <span className="mm-link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            Rechercher
          </Link>
          {isProprietaire && (
            <Link className="mm-link" href="/publier" onClick={close}>
              <span className="mm-link-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              Publier
            </Link>
          )}
          <Link className="mm-link" href="/messages" onClick={close}>
            <span className="mm-link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            Messages
          </Link>
          <Link className="mm-link" href="/favoris" onClick={close}>
            <span className="mm-link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            Favoris
          </Link>
          <Link className="mm-link" href="/pro" onClick={close} style={{ color: 'var(--brown-mid)' }}>
            <span className="mm-link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </span>
            Drify Pro
          </Link>

          <div className="mm-divider" />

          {/* Auth */}
          <div className="mm-auth-section">
            {!isLoggedIn ? (
              <>
                <Link href="/connexion" className="mm-btn-ghost" onClick={close}>Se connecter</Link>
                <Link href="/inscription" className="mm-btn-primary" onClick={close}>S&apos;inscrire</Link>
              </>
            ) : (
              <>
                {isProprietaire && (
                  <Link href="/dashboard" className="mm-btn-ghost" onClick={close}>Mon dashboard</Link>
                )}
                {isLocataire && (
                  <Link href="/locataire/dossier" className="mm-btn-ghost" onClick={close}>Mon dossier</Link>
                )}
                <Link href={isLocataire ? '/locataire/profil' : '/profil'} className="mm-btn-ghost" onClick={close}>
                  Mon profil
                </Link>
                <form action={signOut}>
                  <button type="submit" className="mm-btn-ghost" style={{ width: '100%', color: 'var(--error)' }}>
                    Se déconnecter
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
