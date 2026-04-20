'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <style>{`
        :root { --green: #2D7A4F; --green-bg: #E8F5E9; --orange: #C27015; --orange-bg: #FFF3E0; --red: #C53030; --red-bg: #FFF5F5; --blue: #2563EB; --blue-bg: #EFF6FF; }
        body { background: var(--bg-soft); }
        nav { position: sticky; top: 0; z-index: 100; height: 60px; display: flex; align-items: center; padding: 0 40px; background: rgba(253,252,250,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-soft); }
        .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-right: 48px; flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
        .nav-links a:hover { color: var(--brown); background: var(--bg-soft); }
        .nav-end { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .nav-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--brown); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; cursor: pointer; }

        .dash-layout { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 60px); }
        .dash-sidebar { background: var(--bg-card); border-right: 1px solid var(--border-soft); padding: 24px 0; }
        .dash-sidebar-section { padding: 0 16px; margin-bottom: 24px; }
        .dash-sidebar-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); padding: 0 12px; margin-bottom: 8px; }
        .dash-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text-muted); text-decoration: none; cursor: pointer; transition: all 0.15s; background: none; border: none; width: 100%; font-family: inherit; }
        .dash-nav-item:hover { color: var(--brown); background: var(--bg-soft); }
        .dash-nav-item.active { color: var(--brown); background: var(--bg-soft); font-weight: 600; }
        .dash-nav-badge { margin-left: auto; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; min-width: 18px; text-align: center; }

        .dash-main { padding: 32px 40px; max-width: 1100px; }
        .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .dash-header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: var(--brown); }
        .dash-header-sub { font-size: 14px; color: var(--text-muted); margin-top: 2px; }
        .btn-primary-lg { padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: #fff; background: var(--brown); border: none; transition: opacity 0.15s; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary-lg:hover { opacity: 0.85; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; color: var(--brown); letter-spacing: -1px; }
        .stat-change { font-size: 12px; font-weight: 600; margin-top: 4px; }
        .stat-change.up { color: var(--green); }

        .content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
        .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: space-between; }
        .card-header h2 { font-size: 15px; font-weight: 700; color: var(--brown); }
        .card-header-action { font-size: 12px; font-weight: 600; color: var(--brown-mid); text-decoration: none; cursor: pointer; }

        .property-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--border-soft); transition: background 0.1s; }
        .property-row:last-child { border-bottom: none; }
        .property-row:hover { background: var(--bg-soft); }
        .property-thumb { width: 56px; height: 42px; border-radius: 8px; background: var(--bg-soft); flex-shrink: 0; border: 1px solid var(--border-soft); }
        .property-info { flex: 1; min-width: 0; }
        .property-info h4 { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .property-info span { font-size: 12px; color: var(--text-muted); }
        .property-price { font-size: 14px; font-weight: 700; color: var(--brown); white-space: nowrap; }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .status-badge.published { background: var(--green-bg); color: var(--green); }
        .status-badge.draft { background: var(--bg-soft); color: var(--text-muted); }
        .status-badge.rented { background: var(--blue-bg); color: var(--blue); }

        .activity-item { display: flex; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border-soft); }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .activity-icon.candidature { background: var(--blue-bg); color: var(--blue); }
        .activity-icon.message { background: var(--green-bg); color: var(--green); }
        .activity-icon.payment { background: var(--orange-bg); color: var(--orange); }
        .activity-icon.view { background: var(--bg-soft); color: var(--text-muted); }
        .activity-text { flex: 1; min-width: 0; }
        .activity-text p { font-size: 13px; color: var(--text); line-height: 1.4; }
        .activity-text p strong { font-weight: 600; }
        .activity-text time { font-size: 11px; color: var(--text-light); }

        .rent-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border-soft); }
        .rent-row:last-child { border-bottom: none; }
        .rent-tenant { display: flex; align-items: center; gap: 10px; }
        .rent-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--bg-soft); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--brown-mid); flex-shrink: 0; }
        .rent-info h5 { font-size: 13px; font-weight: 600; color: var(--text); }
        .rent-info span { font-size: 11px; color: var(--text-muted); }
        .rent-status { display: flex; align-items: center; gap: 8px; }
        .rent-amount { font-size: 14px; font-weight: 700; color: var(--brown); }
        .rent-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .rent-badge.paid { background: var(--green-bg); color: var(--green); }
        .rent-badge.pending { background: var(--orange-bg); color: var(--orange); }

        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 20px; }
        .quick-action { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 10px; border: 1px solid var(--border); border-radius: 10px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-decoration: none; cursor: pointer; transition: all 0.15s; text-align: center; background: none; font-family: inherit; }
        .quick-action:hover { border-color: var(--brown-light); color: var(--brown); background: var(--bg-soft); }

        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .dash-layout { grid-template-columns: 1fr; }
          .dash-sidebar { display: none; }
          .dash-main { padding: 20px 16px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-value { font-size: 22px; }
        }
      `}</style>

      <nav>
        <Link href="/" className="logo">
          <Image src="/logo.svg" height={32} width={80} style={{width:'auto'}} alt="Drify" />
        </Link>
        <div className="nav-links">
          <Link href="/">Accueil</Link>
          <Link href="/recherche">Rechercher</Link>
          <Link href="/publier">Publier</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/favoris">Favoris</Link>
        </div>
        <div className="nav-end">
          <div className="nav-avatar">PD</div>
        </div>
      </nav>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-section">
            <div className="dash-sidebar-label">Gestion</div>
            <button className={`dash-nav-item${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Vue d&apos;ensemble
            </button>
            <button className={`dash-nav-item${activeTab === 'properties' ? ' active' : ''}`} onClick={() => setActiveTab('properties')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              Mes biens
              <span className="dash-nav-badge">3</span>
            </button>
            <button className={`dash-nav-item${activeTab === 'applications' ? ' active' : ''}`} onClick={() => setActiveTab('applications')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              Candidatures
              <span className="dash-nav-badge">5</span>
            </button>
          </div>
          <div className="dash-sidebar-section">
            <div className="dash-sidebar-label">Finances</div>
            <button className={`dash-nav-item${activeTab === 'rents' ? ' active' : ''}`} onClick={() => setActiveTab('rents')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>
              Loyers
            </button>
            <button className="dash-nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Quittances
            </button>
          </div>
          <div className="dash-sidebar-section">
            <div className="dash-sidebar-label">Communication</div>
            <Link href="/messages" className="dash-nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Messages
              <span className="dash-nav-badge">2</span>
            </Link>
            <button className="dash-nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              Notifications
            </button>
          </div>
        </aside>

        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1>Bonjour, Pierre</h1>
              <p className="dash-header-sub">Voici un aperçu de votre activité locative à Toulouse.</p>
            </div>
            <Link href="/publier" className="btn-primary-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Nouvelle annonce
            </Link>
          </div>

          <div className="stats-grid">
            {[
              { icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>, label: 'Biens actifs', value: '3', change: '2 publiés, 1 loué' },
              { icon: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>, label: 'Candidatures', value: '5', change: '+3 cette semaine' },
              { icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>, label: 'Loyers ce mois', value: '850 €', change: 'Payé' },
              { icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>, label: 'Vues (30j)', value: '247', change: '+18% vs mois dernier' },
            ].map((s,i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}</svg>
                  {s.label}
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-change up">{s.change}</div>
              </div>
            ))}
          </div>

          <div className="content-grid">
            <div>
              <div className="card" style={{marginBottom:'24px'}}>
                <div className="card-header">
                  <h2>Mes biens</h2>
                  <Link href="/publier" className="card-header-action">+ Ajouter</Link>
                </div>
                {[
                  {title:'T3 briques roses — Capitole', sub:'65 m² · 3 pièces · Toulouse', status:'published', statusLabel:'Publié', price:'850 €'},
                  {title:'Studio meublé — Saint-Cyprien', sub:'26 m² · 1 pièce · Toulouse', status:'published', statusLabel:'Publié', price:'520 €'},
                  {title:'T4 avec jardin — Lardenne', sub:'95 m² · 4 pièces · Toulouse', status:'rented', statusLabel:'Loué', price:'1 350 €'},
                ].map((p,i) => (
                  <div key={i} className="property-row">
                    <div className="property-thumb"></div>
                    <div className="property-info"><h4>{p.title}</h4><span>{p.sub}</span></div>
                    <span className={`status-badge ${p.status}`}>{p.statusLabel}</span>
                    <span className="property-price">{p.price}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-header">
                  <h2>Loyers — Mars 2026</h2>
                  <span className="card-header-action">Voir tout</span>
                </div>
                <div className="rent-row">
                  <div className="rent-tenant">
                    <div className="rent-avatar">SB</div>
                    <div className="rent-info"><h5>Sophie Bertrand</h5><span>T4 Lardenne</span></div>
                  </div>
                  <div className="rent-status"><span className="rent-amount">1 350 €</span><span className="rent-badge paid">Payé</span></div>
                </div>
                <div className="rent-row">
                  <div className="rent-tenant">
                    <div className="rent-avatar">ML</div>
                    <div className="rent-info"><h5>Marc Lefèvre</h5><span>Studio Saint-Cyprien</span></div>
                  </div>
                  <div className="rent-status"><span className="rent-amount">520 €</span><span className="rent-badge pending">En attente</span></div>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{marginBottom:'24px'}}>
                <div className="card-header"><h2>Actions rapides</h2></div>
                <div className="quick-actions">
                  <Link href="/publier" className="quick-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>
                    Publier une annonce
                  </Link>
                  <button className="quick-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Générer quittance
                  </button>
                  <button className="quick-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                    Voir candidatures
                  </button>
                  <button className="quick-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Écrire un message
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2>Activité récente</h2></div>
                {[
                  { type:'candidature', icon:<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>, text:<><strong>Nouvelle candidature</strong> pour T3 Capitole de Marie Duval</>, time:'Il y a 2 heures' },
                  { type:'payment', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8"/></>, text:<><strong>Loyer reçu</strong> — 1 350 € de Sophie Bertrand</>, time:'Il y a 5 heures' },
                  { type:'message', icon:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>, text:<><strong>Message</strong> de Lucas Martin à propos du Studio Saint-Cyprien</>, time:'Hier à 18h30' },
                  { type:'candidature', icon:<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>, text:<><strong>Candidature acceptée</strong> — Sophie Bertrand pour T4 Lardenne</>, time:'Il y a 3 jours' },
                  { type:'view', icon:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>, text:<><strong>42 vues</strong> sur T3 Capitole cette semaine</>, time:'Il y a 3 jours' },
                ].map((a,i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-icon ${a.type}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{a.icon}</svg>
                    </div>
                    <div className="activity-text">
                      <p>{a.text}</p>
                      <time>{a.time}</time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
