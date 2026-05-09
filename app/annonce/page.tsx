'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AnnoncePage() {
  const router = useRouter()
  const [showContactGate, setShowContactGate] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)

  async function handleContact() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setShowContactGate(true)
      return
    }
    setContactLoading(true)

    // Chercher une conversation existante pour éviter les doublons
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', user.id)
      .eq('property_title', 'T3 briques roses — Capitole')
      .maybeSingle()

    if (existing) {
      router.push(`/messages?conv=${existing.id}`)
      return
    }

    // Créer la conversation
    const { data: conv } = await supabase
      .from('conversations')
      .insert({
        tenant_id: user.id,
        other_user_name: 'Pierre Dupont',
        other_user_initials: 'PD',
        property_title: 'T3 briques roses — Capitole',
        property_info: '850 €/mois · 65 m² · Toulouse',
      })
      .select()
      .single()

    if (conv) {
      router.push(`/messages?conv=${conv.id}`)
    } else {
      setContactLoading(false)
    }
  }

  useEffect(() => {
    // Load Leaflet for map
    if (typeof window === 'undefined') return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as unknown as {L: {map: Function; tileLayer: Function; circle: Function}}).L
      const map = L.map('listingMap', { scrollWheelZoom: false }).setView([43.604, 1.444], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)
      L.circle([43.604, 1.444], {
        radius: 250,
        color: '#3D2E22',
        fillColor: '#3D2E22',
        fillOpacity: 0.08,
        weight: 1.5,
        opacity: 0.3
      }).addTo(map)
    }
    document.body.appendChild(script)
  }, [])

  return (
    <>
      <style>{`
        nav { position: sticky; top: 0; z-index: 200; height: 60px; display: flex; align-items: center; padding: 0 32px; background: rgba(253,252,250,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-soft); }
        .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-right: 40px; }
        .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: color .15s, background .15s; }
        .nav-links a:hover { color: var(--brown); background: var(--bg-soft); }
        .nav-end { display: flex; gap: 8px; flex-shrink: 0; }
        .btn-ghost { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: var(--brown-mid); border: 1px solid var(--border); background: transparent; font-family: inherit; white-space: nowrap; }
        .btn-ghost:hover { background: var(--bg-soft); }
        .btn-primary { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: #fff; background: var(--brown); border: none; font-family: inherit; white-space: nowrap; }
        .btn-primary:hover { opacity: .85; }

        .breadcrumb { max-width: 1120px; margin: 0 auto; padding: 14px 32px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .breadcrumb a { color: var(--brown-mid); text-decoration: none; font-weight: 500; }
        .breadcrumb a:hover { text-decoration: underline; }
        .breadcrumb svg { opacity: .4; }

        .page { max-width: 1120px; margin: 0 auto; padding: 0 32px 80px; }
        .layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }

        .gallery { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 200px 200px; gap: 6px; border-radius: 16px; overflow: hidden; margin-bottom: 28px; }
        .gallery-main { grid-row: 1 / 3; }
        .gallery-item { display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; }
        .gallery-item svg { opacity: .25; }
        .gallery-count { position: absolute; bottom: 10px; right: 10px; background: rgba(61,46,34,0.8); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; backdrop-filter: blur(4px); }

        .content { min-width: 0; }
        .badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .badge { font-size: 10px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; }
        .badge-type { background: var(--brown); color: #fff; }
        .badge-dpe { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
        .dpe-a { background: #1a9e3f; color: #333; }
        .dpe-b { background: #4cb847; color: #333; }
        .dpe-c { background: #c3d52a; color: #333; }
        .dpe-d { background: #f5e600; color: #333; }
        .dpe-e { background: #f0a500; color: #333; }
        .dpe-f { background: #e06b00; color: #333; }
        .dpe-g { background: #cc0000; color: #333; }

        .listing-title { font-size: 28px; font-weight: 800; letter-spacing: -.5px; color: var(--brown); margin-bottom: 6px; line-height: 1.2; }
        .listing-loc { display: flex; align-items: center; gap: 5px; font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }

        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 28px; }
        .meta-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; text-align: center; }
        .meta-item-value { font-size: 18px; font-weight: 800; color: var(--brown); }
        .meta-item-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        .section-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 12px; padding-top: 24px; border-top: 1px solid var(--border-soft); }
        .section-title:first-of-type { border-top: none; padding-top: 0; }
        .description { font-size: 14px; color: var(--text-muted); line-height: 1.75; margin-bottom: 24px; }

        .features-list { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }
        .feat-tag { padding: 6px 14px; background: var(--bg-soft); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; font-weight: 600; color: var(--brown-mid); }

        .details-table { width: 100%; margin-bottom: 24px; }
        .details-table tr { border-bottom: 1px solid var(--border-soft); }
        .details-table td { padding: 10px 0; font-size: 13px; }
        .details-table td:first-child { color: var(--text-muted); width: 45%; }
        .details-table td:last-child { font-weight: 600; color: var(--text); }

        .listing-map { height: 240px; border-radius: 14px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 24px; }

        .owner-section { margin-bottom: 24px; }
        .owner-card { display: flex; align-items: center; gap: 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
        .owner-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--bg-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: var(--brown); flex-shrink: 0; }
        .owner-info { flex: 1; }
        .owner-name { font-size: 15px; font-weight: 700; color: var(--text); }
        .owner-meta { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .owner-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; }
        .owner-score { font-size: 14px; font-weight: 800; color: var(--brown); }

        .sidebar { position: sticky; top: 80px; }
        .price-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 14px; box-shadow: 0 2px 16px rgba(61,46,34,0.07); }
        .price-big { font-size: 32px; font-weight: 800; color: var(--brown); line-height: 1; }
        .price-period { font-size: 14px; color: var(--text-muted); font-weight: 400; }
        .price-charges { font-size: 12px; color: var(--text-muted); margin-top: 4px; margin-bottom: 20px; }
        .price-detail { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-top: 1px solid var(--border-soft); }
        .price-detail span:first-child { color: var(--text-muted); }
        .price-detail span:last-child { font-weight: 600; color: var(--text); }

        .cta-btn { display: block; width: 100%; padding: 13px; border-radius: 10px; font-size: 14px; font-weight: 700; text-align: center; cursor: pointer; transition: opacity .15s; text-decoration: none; font-family: inherit; border: none; }
        .cta-primary { background: var(--brown); color: #fff; margin-bottom: 8px; }
        .cta-primary:hover { opacity: .85; }
        .cta-secondary { background: transparent; color: var(--brown); border: 1.5px solid var(--border); }
        .cta-secondary:hover { background: var(--bg-soft); }
        .sidebar-info { display: flex; align-items: center; gap: 6px; justify-content: center; font-size: 11px; color: var(--text-light); margin-top: 14px; }

        @media (max-width: 960px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { position: static; order: -1; }
          .gallery { grid-template-columns: 1fr; grid-template-rows: 280px; }
          .gallery-main { grid-row: auto; }
          .gallery-item:not(.gallery-main) { display: none; }
          .meta-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .page { padding: 0 16px 60px; }
          .breadcrumb { padding: 10px 16px; }
          .listing-title { font-size: 22px; }
          .meta-grid { grid-template-columns: 1fr 1fr; }
        }
        .gate-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(20,10,5,.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .gate-modal { background: #FDFCFA; border-radius: 20px; padding: 40px 36px 36px; width: min(440px, 100%); text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,.16); }
        .gate-modal-icon { width: 52px; height: 52px; border-radius: 14px; background: #F7F3EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .gate-modal h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: #3D2E22; margin-bottom: 10px; }
        .gate-modal p { font-size: 14px; color: #8A7068; line-height: 1.65; margin-bottom: 28px; max-width: 300px; margin-left: auto; margin-right: auto; }
        .gate-btn { display: block; width: 100%; background: #3D2E22; color: #fff; border: none; border-radius: 12px; padding: 14px 24px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; margin-bottom: 12px; transition: opacity .15s; font-family: inherit; }
        .gate-btn:hover { opacity: .85; }
        .gate-link { display: block; font-size: 13px; color: #8A7068; text-decoration: none; }
        .gate-link span { font-weight: 600; color: #5C4433; }
        .gate-link:hover span { text-decoration: underline; }
        .gate-close { position: absolute; top: 14px; right: 14px; width: 30px; height: 30px; border-radius: 8px; border: 1px solid #EAE3DA; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #8A7068; font-family: inherit; }
        .gate-close:hover { background: #F7F3EE; }
      `}</style>

      {showContactGate && (
        <div className="gate-overlay" onClick={e => { if (e.target === e.currentTarget) setShowContactGate(false) }}>
          <div className="gate-modal" style={{position:'relative'}}>
            <button className="gate-close" onClick={() => setShowContactGate(false)} aria-label="Fermer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="gate-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="1.7">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>Contacter le propriétaire</h2>
            <p>Connectez-vous pour envoyer un message à Pierre Dupont à propos de ce logement.</p>
            <Link href="/connexion?redirect=/annonce" className="gate-btn">Se connecter</Link>
            <Link href="/inscription?redirect=/annonce" className="gate-link">
              Pas encore de compte ?&nbsp;<span>Créer un compte</span>
            </Link>
          </div>
        </div>
      )}

      <div className="breadcrumb">
        <Link href="/recherche">Recherche</Link>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
        <Link href="/recherche?city=toulouse">Toulouse</Link>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
        <span>T3 briques roses — Capitole</span>
      </div>

      <div className="page">
        <div className="gallery">
          <div className="gallery-item gallery-main" style={{background: 'linear-gradient(135deg, #EDE5DA 0%, #DDD0C0 100%)'}}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B89878" strokeWidth="0.7">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div className="gallery-item" style={{background: 'linear-gradient(135deg, #F0E8DE 0%, #E4D5C5 100%)'}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
          <div className="gallery-item" style={{background: 'linear-gradient(135deg, #E8DDD0 0%, #D8CABC 100%)'}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B89878" strokeWidth="0.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <div className="gallery-count">+5 photos</div>
          </div>
        </div>

        <div className="layout">
          <div className="content">
            <div className="badge-row">
              <span className="badge badge-type">Location</span>
              <span className="badge badge-dpe dpe-c">DPE C</span>
            </div>

            <h1 className="listing-title">T3 briques roses — Capitole</h1>
            <div className="listing-loc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7068" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Capitole, Toulouse (31000)
            </div>

            <div className="meta-grid">
              {[{v:'65 m²',l:'Surface'},{v:'3',l:'Pièces'},{v:'2',l:'Chambres'},{v:'1',l:'Salle de bain'}].map((m,i) => (
                <div key={i} className="meta-item">
                  <div className="meta-item-value">{m.v}</div>
                  <div className="meta-item-label">{m.l}</div>
                </div>
              ))}
            </div>

            <h2 className="section-title">Description</h2>
            <div className="description">
              <p>Magnifique T3 de 65m² au cœur du quartier du Capitole, au 3ème étage d&apos;un immeuble en briques roses typique de Toulouse. L&apos;appartement offre un séjour traversant de 24m² avec double exposition est/ouest, baigné de lumière naturelle.</p>
              <br />
              <p>La cuisine est entièrement équipée et ouverte sur le séjour. Deux chambres spacieuses (12m² et 11m²) avec placards intégrés. Salle de bain avec baignoire et WC séparé. Parquet ancien en bon état dans toutes les pièces. Double vitrage. Cave en sous-sol.</p>
              <br />
              <p>Idéalement situé à 2 minutes à pied de la place du Capitole, du métro Capitole (ligne A) et de tous les commerces.</p>
            </div>

            <h2 className="section-title">Caractéristiques</h2>
            <div className="features-list">
              {['Parquet','Double vitrage','Digicode','Interphone','Cave','Cuisine équipée','Placards','Lumineux','Calme'].map(f => (
                <span key={f} className="feat-tag">{f}</span>
              ))}
            </div>

            <h2 className="section-title">Détails</h2>
            <table className="details-table">
              <tbody>
                <tr><td>Type de bien</td><td>Appartement</td></tr>
                <tr><td>Meublé</td><td>Non</td></tr>
                <tr><td>Étage</td><td>3ème sur 5</td></tr>
                <tr><td>Disponible le</td><td>1er mai 2026</td></tr>
                <tr><td>Dépôt de garantie</td><td>850 €</td></tr>
                <tr><td>DPE</td><td>C (155 kWh/m²/an)</td></tr>
                <tr><td>GES</td><td>D (32 kg CO₂/m²/an)</td></tr>
                <tr><td>Année de construction</td><td>1890</td></tr>
                <tr><td>Référence</td><td>DRF-TLS-001</td></tr>
              </tbody>
            </table>

            <h2 className="section-title">Localisation</h2>
            <div className="listing-map" id="listingMap"></div>
            <p style={{fontSize:'12px', color:'var(--text-light)', marginBottom:'24px'}}>L&apos;adresse exacte est communiquée après prise de contact avec le propriétaire.</p>

            <h2 className="section-title">Propriétaire</h2>
            <div className="owner-section">
              <div className="owner-card">
                <div className="owner-avatar">PD</div>
                <div className="owner-info">
                  <div className="owner-name">Pierre Dupont</div>
                  <div className="owner-meta">
                    <span className="owner-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Vérifié
                    </span>
                    <span>Répond en &lt; 2h</span>
                    <span>·</span>
                    <span>4 avis</span>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="owner-score">92/100</div>
                  <div style={{fontSize:'10px', color:'#166534', fontWeight:600}}>Fiable</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="sidebar">
            <div className="price-card">
              <div className="price-big">850 € <span className="price-period">/mois</span></div>
              <div className="price-charges">dont 60 € de charges</div>
              <div className="price-detail"><span>Loyer hors charges</span><span>790 €</span></div>
              <div className="price-detail"><span>Charges</span><span>60 €</span></div>
              <div className="price-detail"><span>Dépôt de garantie</span><span>850 €</span></div>
              <div style={{marginTop:'20px'}}>
                <button
                  className="cta-btn cta-primary"
                  onClick={handleContact}
                  disabled={contactLoading}
                >
                  {contactLoading ? 'Chargement…' : 'Contacter le propriétaire'}
                </button>
                <button className="cta-btn cta-secondary">Postuler avec mon dossier</button>
              </div>
              <div className="sidebar-info">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B5A49C" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Dossier envoyé de manière sécurisée
              </div>
            </div>
            <div style={{display:'flex', gap:'8px'}}>
              <button className="cta-btn cta-secondary" style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontSize:'12px', padding:'10px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Sauvegarder
              </button>
              <button className="cta-btn cta-secondary" style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontSize:'12px', padding:'10px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D2E22" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Partager
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
