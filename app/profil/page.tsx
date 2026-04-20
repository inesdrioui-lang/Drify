'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

type Tab = 'dossier' | 'candidatures' | 'infos' | 'trust'

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dossier')

  return (
    <>
      <style>{`
        :root{--bg:#FDFCFA;--bg-soft:#F7F3EE;--bg-card:#FFFFFF;--brown:#3D2E22;--brown-mid:#5C4433;--brown-light:#96766A;--border:#EAE3DA;--border-soft:#F0EBE4;--text:#1A0F08;--text-muted:#8A7068;--text-light:#B5A49C;--green:#2D7A4F;--green-bg:#E8F5E9;--orange:#C27015;--orange-bg:#FFF3E0;--red:#C53030;--blue:#2563EB;--blue-bg:#EFF6FF}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg-soft);color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased}
        nav{position:sticky;top:0;z-index:100;height:60px;display:flex;align-items:center;padding:0 40px;background:rgba(253,252,250,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border-soft)}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:48px;flex-shrink:0}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1}
        .nav-links a{text-decoration:none;color:var(--text-muted);font-size:14px;font-weight:500;padding:6px 14px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover{color:var(--brown);background:var(--bg-soft)}
        .nav-links a.active{color:var(--brown);font-weight:600}
        .nav-end{display:flex;align-items:center;gap:12px;flex-shrink:0}
        .nav-avatar{width:32px;height:32px;border-radius:50%;background:var(--brown);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;cursor:pointer}
        .profile-layout{max-width:900px;margin:0 auto;padding:32px 40px 100px}
        .profile-header{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:32px;display:flex;align-items:center;gap:24px;margin-bottom:24px}
        .profile-avatar-lg{width:80px;height:80px;border-radius:50%;background:var(--bg-soft);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:var(--brown-mid);flex-shrink:0}
        .profile-info{flex:1}
        .profile-info h1{font-size:24px;font-weight:800;color:var(--brown);letter-spacing:-0.5px}
        .profile-info .profile-role{font-size:13px;color:var(--text-muted);margin-top:2px}
        .profile-badges{display:flex;gap:6px;margin-top:10px}
        .profile-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600}
        .profile-badge.verified{background:var(--green-bg);color:var(--green)}
        .profile-badge.dossier{background:var(--blue-bg);color:var(--blue)}
        .profile-badge.trust{background:var(--bg-soft);color:var(--brown-mid)}
        .profile-actions{display:flex;gap:8px}
        .btn-outline{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;color:var(--brown-mid);border:1px solid var(--border);background:transparent;cursor:pointer;font-family:inherit;transition:background .15s}
        .btn-outline:hover{background:var(--bg-soft)}
        .profile-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:24px}
        .profile-tab{padding:12px 20px;font-size:14px;font-weight:600;color:var(--text-muted);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none;font-family:inherit}
        .profile-tab:hover{color:var(--brown)}
        .profile-tab.active{color:var(--brown);border-bottom-color:var(--brown)}
        .card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:20px}
        .card-header{padding:16px 24px;border-bottom:1px solid var(--border-soft);display:flex;align-items:center;justify-content:space-between}
        .card-header h2{font-size:15px;font-weight:700;color:var(--brown)}
        .card-body{padding:20px 24px}
        .dossier-progress{margin-bottom:24px}
        .progress-bar{width:100%;height:8px;background:var(--bg-soft);border-radius:4px;overflow:hidden}
        .progress-fill{height:100%;background:var(--green);border-radius:4px}
        .doc-list{list-style:none}
        .doc-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border-soft)}
        .doc-item:last-child{border-bottom:none}
        .doc-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .doc-icon.uploaded{background:var(--green-bg);color:var(--green)}
        .doc-icon.missing{background:var(--bg-soft);color:var(--text-light)}
        .doc-info{flex:1}
        .doc-info h4{font-size:14px;font-weight:600;color:var(--text)}
        .doc-info span{font-size:12px;color:var(--text-muted)}
        .doc-status{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}
        .doc-status.ok{background:var(--green-bg);color:var(--green)}
        .doc-upload-btn{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;color:var(--brown-mid);border:1px solid var(--border);background:transparent;cursor:pointer;font-family:inherit;transition:background .15s}
        .doc-upload-btn:hover{background:var(--bg-soft)}
        .dossierfacile-box{background:linear-gradient(135deg,#EFF6FF 0%,#FDFCFA 100%);border:1px solid #C7D9F0;border-radius:14px;padding:24px;display:flex;align-items:center;gap:16px;margin-bottom:20px}
        .dossierfacile-icon{width:48px;height:48px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid #C7D9F0;flex-shrink:0}
        .dossierfacile-info{flex:1}
        .dossierfacile-info h3{font-size:14px;font-weight:700;color:var(--text)}
        .dossierfacile-info p{font-size:12px;color:var(--text-muted);margin-top:2px}
        .dossierfacile-btn{padding:8px 18px;border-radius:8px;font-size:12px;font-weight:600;color:#fff;background:var(--blue);border:none;cursor:pointer;font-family:inherit;white-space:nowrap}
        .dossierfacile-btn:hover{opacity:.9}
        .info-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-soft)}
        .info-row:last-child{border-bottom:none}
        .info-label{font-size:13px;color:var(--text-muted)}
        .info-value{font-size:14px;font-weight:600;color:var(--text)}
        .info-edit{font-size:12px;font-weight:600;color:var(--brown-mid);background:none;border:none;cursor:pointer;font-family:inherit}
        .info-edit:hover{text-decoration:underline}
        .candidature-item{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid var(--border-soft)}
        .candidature-item:last-child{border-bottom:none}
        .candidature-thumb{width:64px;height:48px;border-radius:8px;background:var(--bg-soft);flex-shrink:0}
        .candidature-info{flex:1}
        .candidature-info h4{font-size:14px;font-weight:600;color:var(--text)}
        .candidature-info span{font-size:12px;color:var(--text-muted)}
        .candidature-status{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600}
        .candidature-status.pending{background:var(--orange-bg);color:var(--orange)}
        .candidature-status.reviewing{background:var(--blue-bg);color:var(--blue)}
        .candidature-status.accepted{background:var(--green-bg);color:var(--green)}
        .candidature-status.rejected{background:var(--bg-soft);color:var(--text-muted)}
        .trust-card{text-align:center;padding:32px 24px}
        .trust-circle{width:100px;height:100px;border-radius:50%;border:4px solid var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .trust-label{font-size:14px;font-weight:600;color:var(--green);margin-bottom:4px}
        .trust-desc{font-size:12px;color:var(--text-muted);max-width:280px;margin:0 auto}
        .trust-factors{margin-top:20px;text-align:left}
        .trust-factor{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px}
        .trust-check{color:var(--green)}
        .trust-pending{color:var(--text-light)}
        @media(max-width:768px){nav{padding:0 16px}.nav-links{display:none}.profile-layout{padding:20px 16px 80px}.profile-header{flex-direction:column;text-align:center;gap:16px}.profile-actions{justify-content:center}.profile-badges{justify-content:center}.dossierfacile-box{flex-direction:column;text-align:center}}
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
          <div className="nav-avatar">MD</div>
        </div>
      </nav>

      <div className="profile-layout">
        {/* PROFILE HEADER */}
        <div className="profile-header">
          <div className="profile-avatar-lg">MD</div>
          <div className="profile-info">
            <h1>Marie Duval</h1>
            <p className="profile-role">Locataire · Toulouse</p>
            <div className="profile-badges">
              <span className="profile-badge verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                Email vérifié
              </span>
              <span className="profile-badge dossier">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                Dossier complet
              </span>
              <span className="profile-badge trust">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Score 85/100
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-outline">Modifier le profil</button>
          </div>
        </div>

        {/* TABS */}
        <div className="profile-tabs">
          {(['dossier','candidatures','infos','trust'] as Tab[]).map(tab => (
            <button key={tab} className={`profile-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'dossier' ? 'Mon dossier' : tab === 'candidatures' ? 'Candidatures' : tab === 'infos' ? 'Informations' : 'Score de confiance'}
            </button>
          ))}
        </div>

        {/* TAB: DOSSIER */}
        {activeTab === 'dossier' && (
          <>
            <div className="dossierfacile-box">
              <div className="dossierfacile-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="dossierfacile-info">
                <h3>DossierFacile</h3>
                <p>Validez votre dossier locataire gratuitement via le service gouvernemental. Reconnu et accepté par les propriétaires.</p>
              </div>
              <button className="dossierfacile-btn">Connecter DossierFacile</button>
            </div>
            <div className="card">
              <div className="card-header">
                <h2>Complétude du dossier</h2>
                <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>80%</span>
              </div>
              <div className="card-body">
                <div className="dossier-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{width:'80%'}}></div></div>
                </div>
                <ul className="doc-list">
                  {[
                    {label:"Pièce d'identité", sub:'CNI_marie_duval.pdf · Uploadé le 20 mars 2026', ok:true},
                    {label:'Justificatif de domicile', sub:'facture_edf_mars2026.pdf · Uploadé le 20 mars 2026', ok:true},
                    {label:'Bulletins de salaire (3 derniers)', sub:'3 fichiers · Uploadés le 21 mars 2026', ok:true},
                    {label:'Contrat de travail', sub:'contrat_cdi_techcorp.pdf · Uploadé le 21 mars 2026', ok:true},
                    {label:"Avis d'imposition", sub:'Requis pour compléter votre dossier', ok:false},
                  ].map((doc, i) => (
                    <li key={i} className="doc-item">
                      <div className={`doc-icon ${doc.ok ? 'uploaded' : 'missing'}`}>
                        {doc.ok
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
                      </div>
                      <div className="doc-info"><h4>{doc.label}</h4><span>{doc.sub}</span></div>
                      {doc.ok ? <span className="doc-status ok">Vérifié</span> : <button className="doc-upload-btn">Uploader</button>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2>Situation financière</h2></div>
              <div className="card-body">
                {[
                  {label:'Situation professionnelle', value:'CDI'},
                  {label:'Revenu mensuel net', value:'2 800 €'},
                  {label:'Garant', value:'Oui (parent)'},
                  {label:'Capacité locative recommandée', value:'≤ 933 €/mois', green:true},
                ].map((row, i) => (
                  <div key={i} className="info-row">
                    <span className="info-label">{row.label}</span>
                    <span className="info-value" style={row.green ? {color:'var(--green)'} : {}}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB: CANDIDATURES */}
        {activeTab === 'candidatures' && (
          <div className="card">
            <div className="card-header">
              <h2>Mes candidatures</h2>
              <span style={{fontSize:12,color:'var(--text-muted)'}}>3 candidatures</span>
            </div>
            <div className="card-body">
              {[
                {title:'T3 briques roses — Capitole', info:'850 €/mois · 65 m² · Envoyée le 25 mars 2026', status:'reviewing', label:'En cours d\'examen'},
                {title:'T2 rénové — Carmes', info:'720 €/mois · 45 m² · Envoyée le 22 mars 2026', status:'pending', label:'En attente'},
                {title:'Studio lumineux — Jean Jaurès', info:'550 €/mois · 28 m² · Envoyée le 18 mars 2026', status:'rejected', label:'Refusée'},
              ].map((c, i) => (
                <div key={i} className="candidature-item">
                  <div className="candidature-thumb"></div>
                  <div className="candidature-info"><h4>{c.title}</h4><span>{c.info}</span></div>
                  <span className={`candidature-status ${c.status}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INFOS */}
        {activeTab === 'infos' && (
          <>
            <div className="card">
              <div className="card-header"><h2>Informations personnelles</h2><button className="info-edit">Modifier</button></div>
              <div className="card-body">
                {[
                  {label:'Nom complet', value:'Marie Duval'},
                  {label:'Email', value:'marie.duval@email.com'},
                  {label:'Téléphone', value:'06 12 34 56 78'},
                  {label:'Ville', value:'Toulouse'},
                  {label:'Membre depuis', value:'Mars 2026'},
                ].map((row, i) => (
                  <div key={i} className="info-row"><span className="info-label">{row.label}</span><span className="info-value">{row.value}</span></div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2>Préférences de recherche</h2><button className="info-edit">Modifier</button></div>
              <div className="card-body">
                {[
                  {label:'Ville recherchée', value:'Toulouse'},
                  {label:'Budget max', value:'900 €/mois'},
                  {label:'Type de bien', value:'Appartement T2-T3'},
                  {label:'Surface min', value:'40 m²'},
                  {label:'Quartiers préférés', value:'Capitole, Carmes, Saint-Cyprien'},
                ].map((row, i) => (
                  <div key={i} className="info-row"><span className="info-label">{row.label}</span><span className="info-value">{row.value}</span></div>
                ))}
              </div>
            </div>
            <div className="card" style={{borderColor:'var(--red)',borderStyle:'dashed'}}>
              <div className="card-header"><h2 style={{color:'var(--red)'}}>Zone de danger</h2></div>
              <div className="card-body" style={{display:'flex',gap:12}}>
                <button className="btn-outline" style={{color:'var(--red)',borderColor:'var(--red)'}}>Exporter mes données (RGPD)</button>
                <button className="btn-outline" style={{color:'var(--red)',borderColor:'var(--red)'}}>Supprimer mon compte</button>
              </div>
            </div>
          </>
        )}

        {/* TAB: TRUST SCORE */}
        {activeTab === 'trust' && (
          <div className="card">
            <div className="trust-card">
              <div className="trust-circle">
                <div><span style={{fontSize:32,fontWeight:800,color:'var(--brown)'}}>85</span><span style={{fontSize:14,color:'var(--text-light)',fontWeight:500}}>/100</span></div>
              </div>
              <div className="trust-label">Profil de confiance élevé</div>
              <p className="trust-desc">Votre score de confiance est calculé à partir de vos documents vérifiés, votre historique et votre activité sur Drify.</p>
              <div className="trust-factors">
                {[
                  'Email vérifié (+10)',
                  'Identité vérifiée (+20)',
                  'Bulletins de salaire vérifiés (+15)',
                  'Contrat CDI vérifié (+15)',
                  'Dossier complet à 80% (+25)',
                ].map((f, i) => (
                  <div key={i} className="trust-factor">
                    <svg className="trust-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </div>
                ))}
                <div className="trust-factor" style={{color:'var(--text-light)'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--text-light)'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Avis d&apos;imposition manquant (0/15)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
