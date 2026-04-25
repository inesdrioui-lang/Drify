import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Application = {
  id: string
  statut: string
  message: string | null
  created_at: string
  listings: {
    titre: string
    ville: string | null
    prix: number | null
  } | null
}

function statutLabel(statut: string) {
  if (statut === 'acceptee') return { label: 'Acceptée', color: '#4A7C59', bg: '#EAF3EE' }
  if (statut === 'refusee') return { label: 'Refusée', color: '#9B3A2A', bg: '#FAECEC' }
  if (statut === 'retiree') return { label: 'Retirée', color: '#8A7068', bg: '#F0EBE4' }
  return { label: 'En attente', color: '#9B7226', bg: '#FDF4E3' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; applied?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'proprietaire') redirect('/dashboard')

  const { statut: filtreStatut, applied } = await searchParams

  // Candidatures avec join sur listings
  let applications: Application[] = []
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('id, statut, message, created_at, listings(titre, ville, prix)')
    .eq('locataire_id', user.id)
    .order('created_at', { ascending: false })

  if (!appsError) {
    const raw = appsData ?? []
    applications = raw.map((a: Record<string, unknown>) => ({
      id: a.id as string,
      statut: a.statut as string,
      message: a.message as string | null,
      created_at: a.created_at as string,
      listings: a.listings as Application['listings'],
    }))
  }

  const filteredApps = filtreStatut
    ? applications.filter(a => a.statut === filtreStatut)
    : applications

  const counts = {
    all: applications.length,
    en_attente: applications.filter(a => a.statut === 'en_attente').length,
    acceptee: applications.filter(a => a.statut === 'acceptee').length,
    refusee: applications.filter(a => a.statut === 'refusee').length,
  }

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }
        .arch-page { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; animation: archFade 0.25s ease-out both; }
        @keyframes archFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        /* Header */
        .arch-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
        .arch-header h1 { font-size: 28px; font-weight: 800; color: var(--brown); letter-spacing: -0.5px; margin-bottom: 4px; }
        .arch-header p { font-size: 14px; color: var(--text-muted); }

        /* Filtres */
        .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { padding: 7px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); text-decoration: none; transition: background 0.12s, color 0.12s, border-color 0.12s; display: flex; align-items: center; gap: 6px; }
        .filter-btn:hover { background: var(--bg-soft); color: var(--brown); }
        .filter-btn.active { background: var(--brown); color: #fff; border-color: var(--brown); }
        .filter-count { font-size: 11px; font-weight: 700; opacity: 0.7; }

        /* Liste */
        .app-list { display: flex; flex-direction: column; gap: 12px; }
        .app-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; transition: box-shadow 0.18s, transform 0.18s; }
        .app-card:hover { box-shadow: 0 6px 20px rgba(61,46,34,0.08); transform: translateY(-1px); }
        .app-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .app-titre { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 3px; }
        .app-ville { font-size: 13px; color: var(--text-muted); }
        .app-prix { font-size: 13px; font-weight: 700; color: var(--brown-mid); }
        .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .app-meta { font-size: 12px; color: var(--text-light); margin-bottom: 10px; }
        .app-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .action-link { font-size: 12px; font-weight: 600; color: var(--text-muted); text-decoration: none; padding: 5px 12px; border-radius: 7px; border: 1px solid var(--border); transition: background 0.12s, color 0.12s; }
        .action-link:hover { background: var(--bg-soft); color: var(--brown); }
        .action-link.primary { background: var(--brown); color: #fff; border-color: var(--brown); }
        .action-link.primary:hover { opacity: 0.85; }

        /* Alerte */
        .success-banner { background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2D7A4F; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        /* État vide */
        .empty-state { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 60px 24px; text-align: center; }
        .empty-icon { width: 56px; height: 56px; border-radius: 16px; background: var(--bg-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--brown-light); }
        .empty-state h3 { font-size: 16px; font-weight: 700; color: var(--brown); margin-bottom: 6px; }
        .empty-state p { font-size: 13px; color: var(--text-muted); max-width: 300px; margin: 0 auto 20px; }
        .btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #fff; background: var(--brown); border: none; cursor: pointer; text-decoration: none; transition: opacity 0.15s; }
        .btn-primary:hover { opacity: 0.85; }

        @media (max-width: 640px) {
          .arch-page { padding: 28px 16px 60px; }
          .arch-header { flex-direction: column; }
          .app-card { padding: 16px; }
          .app-top { flex-direction: column; gap: 8px; }
        }
      `}</style>

      <main className="arch-page">
        {applied && (
          <div className="success-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Candidature envoyée avec succès !
          </div>
        )}

        <div className="arch-header">
          <div>
            <h1>Mes candidatures</h1>
            <p>{counts.all} candidature{counts.all !== 1 ? 's' : ''} au total</p>
          </div>
          <Link href="/recherche" className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Chercher un logement
          </Link>
        </div>

        {/* ── Filtres ── */}
        {applications.length > 0 && (
          <div className="filters">
            <Link href="/locataire/archives" className={`filter-btn${!filtreStatut ? ' active' : ''}`}>
              Toutes <span className="filter-count">{counts.all}</span>
            </Link>
            <Link href="/locataire/archives?statut=en_attente" className={`filter-btn${filtreStatut === 'en_attente' ? ' active' : ''}`}>
              En attente <span className="filter-count">{counts.en_attente}</span>
            </Link>
            <Link href="/locataire/archives?statut=acceptee" className={`filter-btn${filtreStatut === 'acceptee' ? ' active' : ''}`}>
              Acceptées <span className="filter-count">{counts.acceptee}</span>
            </Link>
            <Link href="/locataire/archives?statut=refusee" className={`filter-btn${filtreStatut === 'refusee' ? ' active' : ''}`}>
              Refusées <span className="filter-count">{counts.refusee}</span>
            </Link>
          </div>
        )}

        {/* ── Liste ── */}
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            {applications.length === 0 ? (
              <>
                <h3>Aucune candidature pour l&apos;instant</h3>
                <p>Trouvez le logement idéal et envoyez votre dossier en quelques secondes.</p>
                <Link href="/recherche" className="btn-primary">Trouver un logement</Link>
              </>
            ) : (
              <>
                <h3>Aucune candidature dans ce filtre</h3>
                <p>Essayez un autre filtre pour voir vos candidatures.</p>
                <Link href="/locataire/archives" className="btn-primary">Voir tout</Link>
              </>
            )}
          </div>
        ) : (
          <div className="app-list">
            {filteredApps.map(app => {
              const s = statutLabel(app.statut)
              const listing = app.listings
              return (
                <div key={app.id} className="app-card">
                  <div className="app-top">
                    <div>
                      <div className="app-titre">
                        {listing?.titre ?? 'Annonce supprimée'}
                      </div>
                      <div className="app-ville">
                        {listing?.ville && `📍 ${listing.ville}`}
                        {listing?.prix && ` · ${listing.prix.toLocaleString('fr-FR')} €/mois`}
                      </div>
                    </div>
                    <span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                  </div>
                  <div className="app-meta">
                    Candidature envoyée le {formatDate(app.created_at)}
                  </div>
                  <div className="app-actions">
                    {app.statut === 'acceptee' && (
                      <a href="#" className="action-link primary">Voir le bail</a>
                    )}
                    <Link href="/locataire/dossier" className="action-link">Mon dossier</Link>
                    {app.statut === 'en_attente' && (
                      <a href="#" className="action-link">Retirer la candidature</a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
