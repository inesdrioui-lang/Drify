import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/app/auth/actions'

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Locataires → page dédiée
  if (profile?.role === 'locataire') redirect('/locataire/profil')

  // Statistiques propriétaire
  let listingsCount = 0
  let applicationsCount = 0
  const { count: lc } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  listingsCount = lc ?? 0
  const { count: ac } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
  applicationsCount = ac ?? 0

  const { updated } = await searchParams
  const initiales = `${profile?.prenom?.[0] ?? ''}${profile?.nom?.[0] ?? ''}`.toUpperCase()

  // Calcul complétion
  const fields = [profile?.prenom, profile?.nom, profile?.telephone, (profile as Record<string, unknown>)?.presentation]
  const filled = fields.filter(Boolean).length
  const completion = Math.round((filled / fields.length) * 100)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }
        .profil-page { max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; animation: proFade 0.25s ease-out both; }
        @keyframes proFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .profil-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px 32px; margin-bottom: 16px; }

        /* Identity */
        .profil-identity { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
        .profil-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: #EDE0CF; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: var(--brown-mid);
          flex-shrink: 0; position: relative; cursor: pointer;
        }
        .profil-avatar-hint {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(61,46,34,0.5); display: flex; align-items: center;
          justify-content: center; opacity: 0; transition: opacity 0.15s;
          font-size: 11px; font-weight: 700; color: #fff; text-align: center;
          line-height: 1.2;
        }
        .profil-avatar:hover .profil-avatar-hint { opacity: 1; }
        .profil-name { font-size: 22px; font-weight: 800; color: var(--brown); letter-spacing: -0.4px; margin-bottom: 2px; }
        .profil-role { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        /* Completion */
        .completion-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border-soft); }
        .completion-label { font-size: 13px; font-weight: 600; color: var(--brown); }
        .completion-bar-wrap { flex: 1; }
        .completion-bar-track { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .completion-bar-fill { height: 100%; border-radius: 99px; background: var(--brown-mid); transition: width 0.5s ease; }
        .completion-pct { font-size: 13px; font-weight: 700; color: var(--brown-mid); flex-shrink: 0; }

        /* Stats */
        .stats-row { display: flex; gap: 0; border-top: 1px solid var(--border-soft); margin-top: 16px; }
        .stat-item { flex: 1; padding: 16px 12px; text-align: center; border-right: 1px solid var(--border-soft); }
        .stat-item:last-child { border-right: none; }
        .stat-value { font-size: 20px; font-weight: 800; color: var(--brown); margin-bottom: 2px; }
        .stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; }

        /* Form */
        .form-title { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 20px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .field input, .field textarea {
          width: 100%; padding: 10px 14px; border: 1px solid var(--border);
          border-radius: 10px; font-size: 14px; font-family: inherit;
          color: var(--text); background: var(--bg); outline: none;
          box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
        .field input:focus, .field textarea:focus {
          border-color: var(--brown-light);
          box-shadow: 0 0 0 3px rgba(150,118,106,0.12);
        }
        .field-hint { font-size: 11px; color: var(--text-light); margin-top: 4px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .char-count { font-size: 11px; color: var(--text-light); text-align: right; margin-top: 4px; }
        .btn-save { padding: 11px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; background: var(--brown); border: none; font-family: inherit; transition: opacity 0.15s; }
        .btn-save:hover { opacity: 0.85; }

        /* Succès */
        .success-msg { display: flex; align-items: center; gap: 8px; background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2D7A4F; margin-bottom: 20px; }

        @media (max-width: 620px) {
          .profil-page { padding: 32px 16px 60px; }
          .profil-card { padding: 20px; }
          .field-row { grid-template-columns: 1fr; }
          .profil-identity { flex-direction: column; gap: 12px; }
          .stats-row { flex-direction: column; }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border-soft); }
          .stat-item:last-child { border-bottom: none; }
        }
      `}</style>

      <main className="profil-page">
        {updated && (
          <div className="success-msg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Profil mis à jour avec succès.
          </div>
        )}

        {/* ── Identité + complétion ── */}
        <div className="profil-card">
          <div className="profil-identity">
            <div className="profil-avatar" title="Changer la photo (bientôt disponible)">
              {initiales || '?'}
              <span className="profil-avatar-hint">Changer<br/>photo</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="profil-name">
                {profile?.prenom && profile?.nom
                  ? `${profile.prenom} ${profile.nom}`
                  : 'Mon profil'}
              </div>
              <div className="profil-role">Propriétaire</div>
            </div>
          </div>

          {/* Barre de complétion */}
          <div className="completion-row">
            <div className="completion-label">Profil complété</div>
            <div className="completion-bar-wrap">
              <div className="completion-bar-track">
                <div className="completion-bar-fill" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="completion-pct">{completion}%</div>
          </div>

          {/* Statistiques */}
          <div className="stats-row">
            {memberSince && (
              <div className="stat-item">
                <div className="stat-value" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{memberSince}</div>
                <div className="stat-label">Membre depuis</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-value">{listingsCount}</div>
              <div className="stat-label">Annonce{listingsCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{applicationsCount}</div>
              <div className="stat-label">Candidature{applicationsCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* ── Modifier les informations ── */}
        <div className="profil-card">
          <div className="form-title">Modifier mes informations</div>
          <form action={updateProfile}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="prenom">Prénom</label>
                <input type="text" id="prenom" name="prenom" defaultValue={profile?.prenom ?? ''} placeholder="Votre prénom" />
              </div>
              <div className="field">
                <label htmlFor="nom">Nom</label>
                <input type="text" id="nom" name="nom" defaultValue={profile?.nom ?? ''} placeholder="Votre nom" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="telephone">Téléphone</label>
              <input type="tel" id="telephone" name="telephone" defaultValue={profile?.telephone ?? ''} placeholder="06 12 34 56 78" />
            </div>
            <div className="field">
              <label htmlFor="presentation">Présentation (visible par les locataires)</label>
              <textarea
                id="presentation"
                name="presentation"
                defaultValue={(profile as Record<string, unknown>)?.presentation as string ?? ''}
                placeholder="Décrivez-vous en quelques mots : expérience, type de biens, votre approche en tant que propriétaire…"
                maxLength={500}
              />
              <div className="field-hint">Rassure les locataires et améliore la visibilité de vos annonces · 500 caractères max</div>
            </div>
            <button type="submit" className="btn-save">Enregistrer</button>
          </form>
        </div>
      </main>
    </>
  )
}
