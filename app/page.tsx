'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [currentSearchType, setCurrentSearchType] = useState('location')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function doSearch() {
    const type = currentSearchType === 'vente' ? 'sale' : 'rent'
    const params = new URLSearchParams({ type })
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    router.push('/recherche?' + params.toString())
  }

  return (
    <>
      <style>{`
        nav {
          position: sticky; top: 0; z-index: 100;
          height: 60px;
          display: flex; align-items: center;
          padding: 0 40px;
          background: rgba(253,252,250,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-soft);
        }
        .logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; margin-right: 48px; flex-shrink: 0;
        }
        .logo-text {
          font-size: 18px; font-weight: 700;
          letter-spacing: -0.3px; color: #4B2E1E;
          font-family: 'Nunito', -apple-system, sans-serif;
        }
        .nav-links {
          display: flex; align-items: center; gap: 2px; flex: 1;
        }
        .nav-links a {
          text-decoration: none; color: var(--text-muted);
          font-size: 14px; font-weight: 500;
          padding: 6px 14px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-links a:hover { color: var(--brown); background: var(--bg-soft); }
        .nav-links a.active { color: var(--brown); font-weight: 600; }
        .nav-end { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .btn-ghost {
          padding: 7px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          text-decoration: none; color: var(--brown-mid);
          border: 1px solid var(--border);
          background: transparent;
          transition: background 0.15s;
          font-family: inherit; white-space: nowrap;
        }
        .btn-ghost:hover { background: var(--bg-soft); }
        .btn-primary {
          padding: 7px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          text-decoration: none; color: #fff;
          background: var(--brown);
          border: none;
          transition: opacity 0.15s;
          font-family: inherit; white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.85; }

        .hero {
          padding: 80px 40px 96px;
          text-align: center;
          max-width: 860px; margin: 0 auto;
          position: relative;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 960px; height: 520px;
          background: radial-gradient(ellipse at 50% 25%, rgba(234,221,205,0.55) 0%, transparent 65%);
          pointer-events: none;
          z-index: -1;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px; font-weight: 600;
          color: var(--brown-mid);
          margin-bottom: 28px;
          letter-spacing: 0.1px;
          box-shadow: 0 1px 4px rgba(61,46,34,0.06);
        }
        .hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--brown-light); flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(150,118,106,0.2);
        }
        .hero h1 {
          font-size: 58px; font-weight: 800;
          letter-spacing: -2.5px; line-height: 1.08;
          color: var(--brown); margin-bottom: 22px;
        }
        .hero-eyebrow {
          display: inline-block;
          font-size: 13px; font-weight: 500; letter-spacing: 0.04em;
          color: var(--brown-light); text-transform: uppercase;
          margin-bottom: 20px; opacity: 0.8;
        }
        .hero-sub {
          font-size: 17px; color: var(--text-muted);
          max-width: 500px; margin: 0 auto 40px;
          line-height: 1.75; font-weight: 400;
        }
        .hero-owner-row {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-top: 20px; flex-wrap: wrap;
          font-size: 13px; color: var(--text-muted);
        }
        .hero-owner-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--brown-mid); font-weight: 600; font-size: 13px;
          text-decoration: none;
          padding: 7px 15px; border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: background 0.15s, border-color 0.15s, gap 0.15s;
          font-family: inherit;
        }
        .hero-owner-btn:hover {
          background: var(--bg-soft);
          border-color: var(--brown-light);
          gap: 9px;
        }
        .hero-pillars {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 36px; flex-wrap: wrap;
        }
        .hero-pillar {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          color: var(--brown-mid);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 7px 14px;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(61,46,34,0.05);
        }

        .search-wrap {
          max-width: 620px; margin: 0 auto 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(61,46,34,0.10), 0 1px 4px rgba(61,46,34,0.06);
          display: flex; align-items: center; position: relative;
        }
        .search-tab {
          display: flex; align-items: center;
          border-right: 1px solid var(--border-soft);
          flex-shrink: 0;
        }
        .search-tab-btn {
          padding: 0 18px; height: 58px;
          display: flex; align-items: center;
          font-size: 13px; font-weight: 600; color: var(--brown);
          background: transparent; border: none; cursor: pointer;
          transition: background 0.15s;
        }
        .search-tab-btn.active { background: var(--bg-soft); }
        .type-dropdown { position: relative; }
        .type-dropdown-btn { display: flex; align-items: center; gap: 8px; border-radius: 14px 0 0 14px; }
        .type-dropdown-menu {
          display: none; position: absolute; top: calc(100% + 4px); left: 0;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; box-shadow: 0 4px 16px rgba(61,46,34,0.12);
          list-style: none; padding: 4px; margin: 0; min-width: 140px; z-index: 200;
        }
        .type-dropdown-menu.open { display: block; }
        .type-dropdown-menu li {
          padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--brown);
          border-radius: 6px; cursor: pointer; transition: background .12s;
        }
        .type-dropdown-menu li:hover { background: var(--bg-soft); }
        .type-dropdown-menu li.active { background: var(--brown); color: #fff; }
        .search-input {
          flex: 1; padding: 0 20px; height: 58px;
          border: none; outline: none; background: transparent;
          font-size: 14px; color: var(--text);
          font-family: inherit;
        }
        .search-input::placeholder { color: var(--text-light); }
        .search-btn {
          margin: 7px; padding: 0 24px; height: 44px;
          background: var(--brown); color: #fff;
          border: none; border-radius: 11px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          transition: opacity 0.15s; white-space: nowrap;
          font-family: inherit;
        }
        .search-btn:hover { opacity: 0.85; }

        .section { padding: 0 40px 88px; max-width: 1200px; margin: 0 auto; }
        .section-head {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 32px;
        }
        .section-head h2 {
          font-size: 26px; font-weight: 700;
          letter-spacing: -0.5px; color: var(--brown);
        }
        .section-head a {
          font-size: 13px; font-weight: 600;
          color: var(--brown-mid); text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: gap 0.15s;
        }
        .section-head a:hover { gap: 8px; }

        .grid-3 {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
        }
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
          text-decoration: none; color: inherit;
          display: block;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(61,46,34,0.10);
        }
        .card-img {
          height: 190px; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .card-badge {
          position: absolute; top: 12px; left: 12px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase;
          background: var(--brown); color: #fff;
          padding: 3px 9px; border-radius: 20px;
        }
        .card-badge.sale { background: var(--brown-mid); }
        .card-fav {
          position: absolute; top: 12px; right: 12px;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .card-body { padding: 16px 18px 18px; }
        .card-title {
          font-size: 14px; font-weight: 700; color: var(--text);
          margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .card-loc {
          display: flex; align-items: center; gap: 3px;
          font-size: 12px; color: var(--text-muted); margin-bottom: 13px;
        }
        .card-meta {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--text-muted);
          padding-bottom: 13px; margin-bottom: 13px;
          border-bottom: 1px solid var(--border-soft);
        }
        .card-meta span { display: flex; align-items: center; gap: 3px; }
        .card-price strong { font-size: 19px; font-weight: 800; color: var(--brown); }
        .card-price span { font-size: 12px; color: var(--text-muted); margin-left: 3px; }

        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .feat {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px 24px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .feat:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(61,46,34,0.08);
        }
        .feat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .feat h3 { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 7px; }
        .feat p { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

        .split {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          display: grid; grid-template-columns: 1fr 1fr;
        }
        .split-text {
          padding: 52px 48px; display: flex;
          flex-direction: column; justify-content: center;
        }
        .split-text .label {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: var(--brown-light);
          margin-bottom: 14px;
        }
        .split-text h2 {
          font-size: 28px; font-weight: 800;
          letter-spacing: -0.5px; color: var(--brown);
          margin-bottom: 12px; line-height: 1.2;
        }
        .split-text p { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 28px; }
        .split-visual {
          background: var(--bg-soft);
          border-left: 1px solid var(--border);
          padding: 40px 32px;
          display: flex; flex-direction: column; gap: 12px;
          justify-content: center;
        }
        .mini-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 18px;
          box-shadow: 0 1px 6px rgba(61,46,34,0.05);
        }
        .mini-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--brown); flex-shrink: 0;
        }
        .mini-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .mini-role { font-size: 11px; color: var(--text-muted); }
        .badge-trust {
          margin-left: auto; font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 20px;
          background: #e6f4ec; color: #1a6b3c;
        }
        .score-row {
          display: flex; justify-content: space-between;
          font-size: 11px; color: var(--text-muted); margin-bottom: 5px;
        }
        .score-row strong { color: var(--brown); font-weight: 700; }
        .bar-bg { height: 5px; background: var(--bg-soft); border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: var(--brown); border-radius: 3px; }
        .docs-list { display: flex; flex-direction: column; gap: 5px; }
        .doc-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-muted); }
        .doc-ok { color: #1a6b3c; font-size: 13px; }

        .cta-banner {
          background: var(--brown);
          border-radius: 20px;
          padding: 72px 56px; text-align: center;
        }
        .cta-banner h2 {
          font-size: 36px; font-weight: 800;
          letter-spacing: -0.8px; color: #fff; margin-bottom: 12px;
        }
        .cta-banner p { font-size: 15px; color: rgba(255,255,255,0.65); margin-bottom: 36px; }
        .cta-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .btn-inv {
          padding: 11px 26px; border-radius: 10px;
          font-size: 14px; font-weight: 700;
          background: #fff; color: var(--brown);
          border: none; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: opacity 0.15s; font-family: inherit;
        }
        .btn-inv:hover { opacity: 0.9; }
        .btn-inv-outline {
          padding: 11px 26px; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          background: transparent; color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.3);
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: border-color 0.15s, color 0.15s; font-family: inherit;
        }
        .btn-inv-outline:hover { border-color: rgba(255,255,255,0.7); color: #fff; }

        footer { border-top: 1px solid var(--border); padding: 48px 40px 36px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px; margin-bottom: 36px;
        }
        .footer-brand p { font-size: 13px; color: var(--text-muted); margin-top: 10px; line-height: 1.65; max-width: 240px; }
        .footer-col h4 { font-size: 12px; font-weight: 700; color: var(--text); letter-spacing: 0.3px; margin-bottom: 12px; }
        .footer-col a { display: block; font-size: 13px; color: var(--text-muted); text-decoration: none; margin-bottom: 7px; transition: color 0.15s; }
        .footer-col a:hover { color: var(--brown); }
        .footer-bottom {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 10px;
          padding-top: 20px; border-top: 1px solid var(--border-soft);
        }
        .footer-bottom p, .footer-bottom a { font-size: 12px; color: var(--text-light); text-decoration: none; }
        .footer-bottom a:hover { color: var(--text-muted); }
        .footer-links { display: flex; gap: 18px; }

        @media (max-width: 960px) {
          .hero h1 { font-size: 42px; letter-spacing: -1.5px; }
          .grid-3 { grid-template-columns: 1fr 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .split { grid-template-columns: 1fr; }
          .split-visual { border-left: none; border-top: 1px solid var(--border); }
          .footer-top { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 620px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hero { padding: 52px 20px 64px; }
          .hero::before { width: 100%; }
          .hero h1 { font-size: 36px; letter-spacing: -1.2px; line-height: 1.12; }
          .hero-sub { font-size: 15px; margin-bottom: 32px; }
          .hero-owner-row { flex-direction: column; gap: 8px; }
          .hero-pillars { gap: 6px; margin-top: 28px; }
          .hero-pillar { font-size: 11px; padding: 6px 12px; }
          .section { padding: 0 20px 64px; }
          .grid-3 { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .split-text { padding: 36px 24px; }
          .cta-banner { padding: 48px 24px; }
          .cta-banner h2 { font-size: 26px; }
          .search-wrap { flex-direction: column; border-radius: 12px; }
          .search-tab { border-right: none; border-bottom: 1px solid var(--border-soft); width: 100%; }
          .search-btn { margin: 8px; width: calc(100% - 16px); justify-content: center; }
          .footer-top { grid-template-columns: 1fr; }
        }
      `}</style>


      <section className="hero">
        <p className="hero-eyebrow">Drify — l&apos;immobilier locatif simplifié</p>
        <h1>Louez mieux.</h1>
        <p className="hero-sub">Pas un site d&apos;annonces de plus.<br />Une plateforme complète, de la recherche à la fin du bail.</p>

        <div className="search-wrap">
          <div className="search-tab">
            <div className="type-dropdown">
              <button
                className="search-tab-btn type-dropdown-btn"
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
              >
                <span>{currentSearchType === 'location' ? 'Location' : 'Vente'}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path fill="#5C4433" d="M0 0l5 6 5-6z"/></svg>
              </button>
              <ul className={`type-dropdown-menu${dropdownOpen ? ' open' : ''}`}>
                <li className={currentSearchType === 'location' ? 'active' : ''} onClick={() => { setCurrentSearchType('location'); setDropdownOpen(false) }}>Location</li>
                <li className={currentSearchType === 'vente' ? 'active' : ''} onClick={() => { setCurrentSearchType('vente'); setDropdownOpen(false) }}>Vente</li>
              </ul>
            </div>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Ville, quartier, code postal…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
          />
          <button className="search-btn" onClick={doSearch}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Rechercher
          </button>
        </div>

        <div className="hero-owner-row">
          <span>Vous êtes propriétaire ?</span>
          <Link href="/publier" className="hero-owner-btn">
            Publier une annonce
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="hero-pillars">
          <span className="hero-pillar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C4433" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
            Dossier vérifié
          </span>
          <span className="hero-pillar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C4433" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
            Quittances automatiques
          </span>
          <span className="hero-pillar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C4433" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            Score de confiance
          </span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Biens à la une</h2>
          <Link href="/recherche">Voir tout <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
        </div>
        <div className="grid-3">
          <Link href="/annonce" className="card">
            <div className="card-img" style={{background: 'linear-gradient(135deg, #F0E8DF 0%, #E4D5C5 100%)'}}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="0.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="card-badge">Location</span>
              <div className="card-fav">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div className="card-body">
              <div className="card-title">T3 briques roses — Capitole</div>
              <div className="card-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Toulouse — Capitole
              </div>
              <div className="card-meta">
                <span>65 m²</span>
                <span>3 pièces</span>
                <span>2 ch.</span>
              </div>
              <div className="card-price"><strong>850 €</strong><span>/ mois CC</span></div>
            </div>
          </Link>

          <Link href="/annonce" className="card">
            <div className="card-img" style={{background: 'linear-gradient(135deg, #EDE5DB 0%, #E0D0C0 100%)'}}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#B89070" strokeWidth="0.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="card-badge">Location</span>
              <div className="card-fav">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div className="card-body">
              <div className="card-title">Studio meublé — Saint-Cyprien</div>
              <div className="card-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Toulouse — Saint-Cyprien
              </div>
              <div className="card-meta">
                <span>26 m²</span>
                <span>Studio</span>
                <span>Meublé</span>
              </div>
              <div className="card-price"><strong>520 €</strong><span>/ mois CC</span></div>
            </div>
          </Link>

          <Link href="/annonce" className="card">
            <div className="card-img" style={{background: 'linear-gradient(135deg, #F5EDDF 0%, #EBD9C5 100%)'}}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#CCA880" strokeWidth="0.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="card-badge sale">Vente</span>
              <div className="card-fav">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <div className="card-body">
              <div className="card-title">Maison avec jardin — Lardenne</div>
              <div className="card-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Toulouse — Lardenne
              </div>
              <div className="card-meta">
                <span>110 m²</span>
                <span>5 pièces</span>
                <span>4 ch.</span>
              </div>
              <div className="card-price"><strong>1 350 €</strong><span>/ mois</span></div>
            </div>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Tout en un seul endroit</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></>, title: 'Dossier numérique', desc: 'Centralisez vos documents une fois, partagez-les en un clic à chaque propriétaire.' },
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title: 'Score de confiance', desc: 'Un score /100 certifié basé sur votre historique locatif. Soyez reconnu comme locataire fiable.' },
            { icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, title: 'Loyer en ligne', desc: 'Paiement sécurisé, quittances automatiques chaque mois. Zéro démarche.' },
            { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, title: 'Messagerie directe', desc: 'Communiquez, échangez des documents et planifiez des visites sans quitter la plateforme.' },
            { icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, title: 'Recherche avancée', desc: 'Filtres précis, carte interactive, alertes personnalisées. Trouvez le bon bien rapidement.' },
            { icon: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>, title: 'Avis vérifiés', desc: 'Des évaluations mutuelles après chaque location. Un historique transparent qui rassure.' },
          ].map((f, i) => (
            <div key={i} className="feat">
              <div className="feat-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">{f.icon}</svg>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div className="split-text">
            <span className="label">Fonctionnalité clé</span>
            <h2>Le Passeport<br />Locataire</h2>
            <p>Votre identité locative numérique et portable. Créez-la une fois, utilisez-la partout. Les propriétaires voient immédiatement que vous êtes fiable.</p>
            <Link href="/profil" className="btn-primary" style={{alignSelf:'flex-start', padding: '10px 22px', fontSize: '13px'}}>
              Créer mon passeport →
            </Link>
          </div>
          <div className="split-visual">
            <div className="mini-card">
              <div className="mini-card-top">
                <div className="avatar">ML</div>
                <div>
                  <div className="mini-name">Marie Lefebvre</div>
                  <div className="mini-role">Locataire · Toulouse</div>
                </div>
                <span className="badge-trust">Fiable</span>
              </div>
              <div className="score-row">
                <span>Score de confiance</span>
                <strong>87 / 100</strong>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{width:'87%', background:'#1a6b3c'}}></div>
              </div>
            </div>
            <div className="mini-card">
              <div style={{fontSize:'12px',fontWeight:700,color:'var(--text)',marginBottom:'10px'}}>Dossier complet ✓</div>
              <div className="docs-list">
                <div className="doc-row"><span className="doc-ok">✓</span> Pièce d&apos;identité</div>
                <div className="doc-row"><span className="doc-ok">✓</span> Bulletins de salaire</div>
                <div className="doc-row"><span className="doc-ok">✓</span> Avis d&apos;imposition</div>
                <div className="doc-row"><span className="doc-ok">✓</span> Justificatif de domicile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-banner">
          <h2>Prêt à commencer ?</h2>
          <p>Gratuit pour démarrer. Rejoignez Drify en moins de 3 minutes.</p>
          <div className="cta-btns">
            <Link href="/recherche" className="btn-inv">Je cherche un bien</Link>
            <Link href="/publier" className="btn-inv-outline">Je publie une annonce</Link>
          </div>
        </div>
      </section>

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
