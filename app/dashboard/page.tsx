import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Listing = {
  id: string
  titre: string
  statut: string
  created_at: string
}

type Application = {
  id: string
  locataire_nom: string
  listing_titre: string
  created_at: string
  statut: string
}

function statutListingLabel(statut: string) {
  if (statut === 'actif') return { label: 'Actif', color: '#4A7C59', bg: '#EAF3EE' }
  if (statut === 'en_attente') return { label: 'En attente', color: '#9B7226', bg: '#FDF4E3' }
  return { label: 'Archivé', color: '#8A7068', bg: '#F0EBE4' }
}

function statutApplicationLabel(statut: string) {
  if (statut === 'acceptee') return { label: 'Acceptée', color: '#4A7C59', bg: '#EAF3EE' }
  if (statut === 'refusee') return { label: 'Refusée', color: '#9B3A2A', bg: '#FAECEC' }
  return { label: 'En attente', color: '#9B7226', bg: '#FDF4E3' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, prenom, nom')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'proprietaire') redirect('/profil')

  // Annonces — fallback gracieux si table absente
  let listingsCount = 0
  let recentListings: Listing[] = []
  const { count: lCount, error: lError } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if (!lError) {
    listingsCount = lCount ?? 0
    const { data: lData } = await supabase
      .from('listings')
      .select('id, titre, statut, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
    recentListings = (lData ?? []) as Listing[]
  }

  // Candidatures — fallback gracieux si table absente
  let applicationsCount = 0
  let recentApplications: Application[] = []
  const { count: aCount, error: aError } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
  if (!aError) {
    applicationsCount = aCount ?? 0
    const { data: aData } = await supabase
      .from('applications')
      .select('id, locataire_nom, listing_titre, created_at, statut')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
    recentApplications = (aData ?? []) as Application[]
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const prenom = profile?.prenom ?? ''

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }

        /* Layout */
        .dash-page {
          max-width: 960px; margin: 0 auto;
          padding: 48px 24px 96px;
          animation: dashFadeIn 0.25s ease-out both;
        }
        @keyframes dashFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Bienvenue */
        .dash-welcome {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          margin-bottom: 36px;
        }
        .dash-welcome h1 {
          font-size: 30px; font-weight: 800;
          letter-spacing: -0.6px; color: var(--brown);
          line-height: 1.15; margin-bottom: 6px;
        }
        .dash-welcome p { font-size: 14px; color: var(--text-muted); }
        .dash-date {
          font-size: 13px; color: var(--text-light);
          white-space: nowrap; padding-top: 6px;
          text-transform: capitalize;
        }

        /* Métriques */
        .dash-metrics {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 36px;
        }
        .metric-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 16px; padding: 22px 24px;
          text-decoration: none; display: flex;
          flex-direction: column; gap: 4px;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative; overflow: hidden;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(61,46,34,0.10);
        }
        .metric-label {
          font-size: 12px; font-weight: 600;
          color: var(--text-muted); letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 36px; font-weight: 800;
          color: var(--brown); letter-spacing: -1px;
          line-height: 1;
        }
        .metric-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .metric-arrow {
          position: absolute; right: 20px; top: 50%;
          transform: translateY(-50%);
          color: var(--border); font-size: 18px;
          transition: color 0.18s, right 0.18s;
        }
        .metric-card:hover .metric-arrow { color: var(--brown-light); right: 16px; }

        /* Sections */
        .dash-section { margin-bottom: 32px; }
        .dash-section-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .dash-section-header h2 {
          font-size: 16px; font-weight: 700;
          color: var(--brown); letter-spacing: -0.2px;
        }
        .link-see-all {
          font-size: 13px; font-weight: 600;
          color: var(--brown-mid); text-decoration: none;
          transition: color 0.15s;
        }
        .link-see-all:hover { color: var(--brown); }

        /* Cartes liste */
        .list-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
        }
        .list-item {
          display: flex; align-items: center;
          gap: 14px; padding: 16px 20px;
          border-bottom: 1px solid var(--border-soft);
          transition: background 0.12s;
        }
        .list-item:last-child { border-bottom: none; }
        .list-item:hover { background: var(--bg-soft); }
        .list-item-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: var(--brown-light);
        }
        .list-item-body { flex: 1; min-width: 0; }
        .list-item-title {
          font-size: 14px; font-weight: 600;
          color: var(--text); white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .list-item-sub {
          font-size: 12px; color: var(--text-muted);
          margin-top: 2px;
        }
        .list-item-end {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 6px; flex-shrink: 0;
        }
        .badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1px;
        }
        .list-item-actions {
          display: flex; gap: 8px;
        }
        .action-link {
          font-size: 12px; font-weight: 600;
          color: var(--text-muted); text-decoration: none;
          padding: 4px 10px; border-radius: 7px;
          border: 1px solid var(--border);
          transition: background 0.12s, color 0.12s;
        }
        .action-link:hover { background: var(--bg-soft); color: var(--brown); }

        /* État vide */
        .empty-state {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 14px; padding: 48px 24px;
          text-align: center;
        }
        .empty-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--bg-soft); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: var(--brown-light);
        }
        .empty-state h3 {
          font-size: 15px; font-weight: 700;
          color: var(--brown); margin-bottom: 6px;
        }
        .empty-state p {
          font-size: 13px; color: var(--text-muted);
          margin-bottom: 20px; max-width: 280px; margin-left: auto; margin-right: auto;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 10px;
          font-size: 13px; font-weight: 600; color: #fff;
          background: var(--brown); border: none;
          cursor: pointer; text-decoration: none;
          font-family: inherit; transition: opacity 0.15s, transform 0.12s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-primary:active { transform: scale(0.97); }

        /* Actions rapides */
        .quick-actions {
          display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px;
        }
        .btn-ghost {
          padding: 9px 18px; border-radius: 9px;
          font-size: 13px; font-weight: 600;
          color: var(--brown-mid); border: 1px solid var(--border);
          background: transparent; text-decoration: none;
          transition: background 0.15s, color 0.15s; font-family: inherit;
        }
        .btn-ghost:hover { background: var(--bg-card); color: var(--brown); }

        /* Responsive */
        @media (max-width: 640px) {
          .dash-page { padding: 28px 16px 72px; }
          .dash-metrics { grid-template-columns: 1fr; gap: 10px; }
          .dash-welcome { flex-direction: column; gap: 4px; }
          .dash-welcome h1 { font-size: 24px; }
          .btn-primary { width: 100%; justify-content: center; }
          .list-item-actions { display: none; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .dash-page { padding: 40px 32px 80px; }
        }
      `}</style>

      <main className="dash-page">

        {/* ── Bienvenue ── */}
        <div className="dash-welcome">
          <div>
            <h1>Bonjour{prenom ? `, ${prenom}` : ''}</h1>
            <p>Voici un aperçu de votre activité</p>
          </div>
          <span className="dash-date">{today}</span>
        </div>

        {/* ── Métriques ── */}
        <div className="dash-metrics">
          <Link href="/publier" className="metric-card">
            <span className="metric-label">Mes annonces</span>
            <span className="metric-value">{listingsCount}</span>
            <span className="metric-sub">annonce{listingsCount !== 1 ? 's' : ''} active{listingsCount !== 1 ? 's' : ''}</span>
            <span className="metric-arrow">→</span>
          </Link>
          <Link href="#candidatures" className="metric-card">
            <span className="metric-label">Candidatures</span>
            <span className="metric-value">{applicationsCount}</span>
            <span className="metric-sub">reçue{applicationsCount !== 1 ? 's' : ''} au total</span>
            <span className="metric-arrow">→</span>
          </Link>
          <div className="metric-card" style={{ cursor: 'default' }}>
            <span className="metric-label">Vues ce mois</span>
            <span className="metric-value" style={{ fontSize: '28px', color: 'var(--text-light)' }}>—</span>
            <span className="metric-sub">disponible bientôt</span>
          </div>
        </div>

        {/* ── Mes annonces ── */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2>Mes annonces</h2>
            <Link href="/publier" className="btn-primary" style={{ fontSize: '12px', padding: '7px 16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Publier une annonce
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>Aucune annonce publiée</h3>
              <p>Publiez votre première annonce et commencez à recevoir des candidatures.</p>
              <Link href="/publier" className="btn-primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Publier une annonce
              </Link>
            </div>
          ) : (
            <div className="list-card">
              {recentListings.map((listing) => {
                const s = statutListingLabel(listing.statut)
                return (
                  <div className="list-item" key={listing.id}>
                    <div className="list-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div className="list-item-body">
                      <div className="list-item-title">{listing.titre}</div>
                      <div className="list-item-sub">Publiée le {formatDate(listing.created_at)}</div>
                    </div>
                    <div className="list-item-end">
                      <span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                      <div className="list-item-actions">
                        <a href="#" className="action-link">Modifier</a>
                        <a href="#" className="action-link">Candidatures</a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Dernières candidatures ── */}
        <div className="dash-section" id="candidatures">
          <div className="dash-section-header">
            <h2>Dernières candidatures</h2>
            {recentApplications.length > 0 && (
              <a href="#" className="link-see-all">Voir tout →</a>
            )}
          </div>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Aucune candidature reçue</h3>
              <p>Vos candidatures apparaîtront ici dès qu&apos;un locataire postulera à l&apos;une de vos annonces.</p>
            </div>
          ) : (
            <div className="list-card">
              {recentApplications.map((app) => {
                const s = statutApplicationLabel(app.statut)
                return (
                  <div className="list-item" key={app.id}>
                    <div className="list-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <div className="list-item-body">
                      <div className="list-item-title">{app.locataire_nom}</div>
                      <div className="list-item-sub">{app.listing_titre} · {formatDate(app.created_at)}</div>
                    </div>
                    <div className="list-item-end">
                      <span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Actions rapides ── */}
        <div className="quick-actions">
          <Link href="/profil" className="btn-ghost">Mon profil</Link>
          <Link href="/messages" className="btn-ghost">Messages</Link>
          <Link href="/recherche" className="btn-ghost">Voir les annonces</Link>
        </div>

      </main>
    </>
  )
}
