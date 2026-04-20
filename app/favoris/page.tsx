'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const LISTINGS = [
  { id:1,  title:'T3 briques roses — Capitole',         city:'Capitole',          price:850,    badge:'Location', img:'#EDE5DA', surface:65,  rooms:3, furnished:false, dpe:'C' },
  { id:2,  title:'Studio meublé — Saint-Cyprien',       city:'Saint-Cyprien',      price:520,    badge:'Location', img:'#E8DDD0', surface:26,  rooms:1, furnished:true,  dpe:'D' },
  { id:3,  title:'T3 lumineux — Carmes',                city:'Carmes',             price:780,    badge:'Location', img:'#F0E8DE', surface:62,  rooms:3, furnished:false, dpe:'B' },
  { id:4,  title:'Loft rénové — Saint-Étienne',         city:'Saint-Étienne',      price:1100,   badge:'Location', img:'#E5DCD2', surface:85,  rooms:4, furnished:true,  dpe:'C' },
  { id:5,  title:'Studio calme — Rangueil',             city:'Rangueil',           price:430,    badge:'Location', img:'#EDE2D4', surface:22,  rooms:1, furnished:true,  dpe:'E' },
  { id:6,  title:'Maison avec jardin — Lardenne',       city:'Lardenne',           price:1350,   badge:'Location', img:'#E9E0D5', surface:110, rooms:5, furnished:false, dpe:'C' },
  { id:7,  title:'T2 rénové — Jean Jaurès',             city:'Jean Jaurès',        price:620,    badge:'Location', img:'#F2EAE0', surface:42,  rooms:2, furnished:false, dpe:'D' },
  { id:8,  title:'Chambre meublée — Arnaud Bernard',    city:'Arnaud Bernard',     price:380,    badge:'Location', img:'#E8DDD0', surface:14,  rooms:1, furnished:true,  dpe:'F' },
  { id:9,  title:'T4 familial — Côte Pavée',            city:'Côte Pavée',         price:1050,   badge:'Location', img:'#EDE5DA', surface:88,  rooms:4, furnished:false, dpe:'B' },
  { id:10, title:'T3 terrasse — Compans',               city:'Compans-Caffarelli', price:890,    badge:'Location', img:'#E5DDD5', surface:70,  rooms:3, furnished:true,  dpe:'A' },
  { id:11, title:'Studio étudiant — Mirail',            city:'Mirail',             price:390,    badge:'Location', img:'#F0E8DE', surface:20,  rooms:1, furnished:true,  dpe:'C' },
  { id:12, title:'T3 calme — Minimes',                  city:'Minimes',            price:730,    badge:'Location', img:'#EAE0D5', surface:58,  rooms:3, furnished:false, dpe:'D' },
  { id:13, title:'Appartement T4 — Côte Pavée',         city:'Côte Pavée',         price:295000, badge:'Vente',    img:'#EDE5DA', surface:92,  rooms:4, furnished:false, dpe:'C' },
  { id:14, title:'Maison 5 pièces — Lardenne',          city:'Lardenne',           price:420000, badge:'Vente',    img:'#E9E0D5', surface:130, rooms:5, furnished:false, dpe:'B' },
  { id:15, title:'Studio investissement — Jean Jaurès', city:'Jean Jaurès',        price:98000,  badge:'Vente',    img:'#F2EAE0', surface:24,  rooms:1, furnished:true,  dpe:'D' },
]

const DPE_BG: Record<string, string> = { A:'#dcfce7', B:'#d1fae5', C:'#fef9c3', D:'#fef3c7', E:'#fee2e2', F:'#fecaca', G:'#fca5a5' }
const DPE_COLOR: Record<string, string> = { A:'#166534', B:'#065f46', C:'#854d0e', D:'#92400e', E:'#991b1b', F:'#7f1d1d', G:'#7f1d1d' }

export default function FavorisPage() {
  const [favIds, setFavIds] = useState<number[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('drify_favorites')
    if (saved) setFavIds(JSON.parse(saved))
  }, [])

  function removeFav(id: number) {
    const next = favIds.filter(f => f !== id)
    setFavIds(next)
    localStorage.setItem('drify_favorites', JSON.stringify(next))
  }

  const listings = favIds.map(id => LISTINGS.find(l => l.id === id)).filter(Boolean) as typeof LISTINGS

  return (
    <>
      <style>{`
        :root {
          --bg:#FDFCFA; --bg-soft:#F7F3EE; --bg-card:#FFFFFF;
          --brown:#3D2E22; --brown-mid:#5C4433; --brown-light:#96766A;
          --border:#EAE3DA; --border-soft:#F0EBE4;
          --text:#1A0F08; --text-muted:#8A7068; --text-light:#B5A49C;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
        nav{position:sticky;top:0;z-index:200;height:60px;display:flex;align-items:center;padding:0 32px;background:rgba(253,252,250,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border-soft)}
        .logo{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:40px}
        .nav-links{display:flex;align-items:center;gap:2px;flex:1}
        .nav-links a{text-decoration:none;color:var(--text-muted);font-size:14px;font-weight:500;padding:6px 14px;border-radius:8px;transition:color .15s,background .15s}
        .nav-links a:hover{color:var(--brown);background:var(--bg-soft)}
        .nav-links a.active{color:var(--brown);font-weight:600}
        .nav-end{display:flex;gap:8px;flex-shrink:0}
        .btn-ghost{padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;color:var(--brown-mid);border:1px solid var(--border);background:transparent;transition:background .15s;font-family:inherit;white-space:nowrap}
        .btn-ghost:hover{background:var(--bg-soft)}
        .btn-primary{padding:7px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;color:#fff;background:var(--brown);border:none;transition:opacity .15s;font-family:inherit;white-space:nowrap}
        .btn-primary:hover{opacity:.85}
        .page-header{padding:32px 40px 24px;border-bottom:1px solid var(--border-soft)}
        .page-header h1{font-size:22px;font-weight:700;color:var(--text);letter-spacing:-0.3px}
        .content{max-width:1200px;margin:0 auto;padding:32px 40px 64px}
        .listings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;text-decoration:none;color:inherit;display:block;transition:transform .2s,box-shadow .2s}
        .card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(61,46,34,0.10)}
        .card-img{height:170px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .card-badge{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;background:var(--brown);color:#fff;padding:3px 8px;border-radius:20px}
        .card-fav{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.88);border:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .15s;background-color:transparent;border:none}
        .card-fav:hover{transform:scale(1.12)}
        .card-body{padding:14px 16px}
        .card-title{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
        .card-loc{display:flex;align-items:center;gap:3px;font-size:12px;color:var(--text-muted);margin-bottom:10px}
        .card-meta{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--text-muted);padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid var(--border-soft)}
        .card-meta span{display:flex;align-items:center;gap:3px}
        .card-price strong{font-size:17px;font-weight:800;color:var(--brown)}
        .card-price span{font-size:11px;color:var(--text-muted);margin-left:2px}
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center}
        .empty-icon{width:64px;height:64px;border-radius:50%;background:var(--bg-soft);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
        .empty-state h2{font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px}
        .empty-state p{font-size:14px;color:var(--text-muted);max-width:360px;line-height:1.6;margin-bottom:24px}
        .btn-search{padding:10px 22px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;color:#fff;background:var(--brown);border:none;transition:opacity .15s;font-family:inherit;display:inline-block}
        .btn-search:hover{opacity:.85}
        footer{border-top:1px solid var(--border);padding:48px 40px 36px}
        .footer-inner{max-width:1200px;margin:0 auto}
        .footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:36px}
        .footer-brand p{font-size:13px;color:var(--text-muted);margin-top:10px;line-height:1.65;max-width:240px}
        .footer-col h4{font-size:12px;font-weight:700;color:var(--text);letter-spacing:0.3px;margin-bottom:12px}
        .footer-col a{display:block;font-size:13px;color:var(--text-muted);text-decoration:none;margin-bottom:7px;transition:color 0.15s}
        .footer-col a:hover{color:var(--brown)}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:20px;border-top:1px solid var(--border-soft)}
        .footer-bottom p,.footer-bottom a{font-size:12px;color:var(--text-light);text-decoration:none}
        .footer-bottom a:hover{color:var(--text-muted)}
        .footer-links{display:flex;gap:18px}
        @media(max-width:1100px){.listings-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:960px){.footer-top{grid-template-columns:1fr 1fr}}
        @media(max-width:700px){nav{padding:0 16px}.nav-links{display:none}.page-header{padding:24px 20px 20px}.content{padding:24px 20px 48px}.listings-grid{grid-template-columns:1fr}footer{padding:36px 20px 28px}.footer-top{grid-template-columns:1fr}}
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
          <Link href="/favoris" className="active">Favoris</Link>
        </div>
        <div className="nav-end">
          <Link href="/connexion" className="btn-ghost">Se connecter</Link>
          <Link href="/inscription" className="btn-primary">S&apos;inscrire</Link>
        </div>
      </nav>

      <div className="page-header">
        <h1>Mes favoris{favIds.length > 0 ? ` (${favIds.length})` : ''}</h1>
      </div>

      <div className="content">
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#96766A" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2>Aucun favori pour le moment</h2>
            <p>Explorez les annonces et sauvegardez celles qui vous intéressent en cliquant sur le cœur.</p>
            <Link href="/recherche" className="btn-search">Rechercher des annonces</Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(l => (
              <Link href={`/annonce?id=${l.id}`} key={l.id} className="card">
                <div className="card-img" style={{background:`linear-gradient(135deg, ${l.img} 0%, ${l.img}cc 100%)`}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="0.8" style={{opacity:.6}}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span className="card-badge">{l.badge}</span>
                  <button className="card-fav" onClick={e => { e.preventDefault(); removeFav(l.id) }} title="Retirer des favoris"
                    style={{position:'absolute',top:10,right:10,width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.88)',border:'1px solid rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#3D2E22" stroke="#3D2E22" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div className="card-body">
                  <div className="card-title">{l.title}</div>
                  <div className="card-loc">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {l.city}
                  </div>
                  <div className="card-meta">
                    <span>{l.surface} m²</span>
                    <span>{l.rooms} p.</span>
                    {l.furnished && <span>Meublé</span>}
                    <span style={{marginLeft:'auto',padding:'1px 6px',borderRadius:4,fontWeight:700,background:DPE_BG[l.dpe]||'#f3f4f6',color:DPE_COLOR[l.dpe]||'#374151'}}>{l.dpe}</span>
                  </div>
                  <div className="card-price">
                    <strong>{l.price.toLocaleString('fr-FR')} €</strong>
                    {l.badge === 'Location' && <span>/ mois CC</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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
