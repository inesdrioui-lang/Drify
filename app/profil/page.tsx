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

  const { updated } = await searchParams
  const initiales = `${profile?.prenom?.[0] ?? ''}${profile?.nom?.[0] ?? ''}`.toUpperCase()

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }
        .profil-page { max-width: 640px; margin: 0 auto; padding: 48px 24px 80px; }
        .profil-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin-bottom: 20px; }
        .profil-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--bg-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: var(--brown-mid); margin-bottom: 16px; }
        .profil-name { font-size: 22px; font-weight: 800; color: var(--brown); letter-spacing: -0.4px; margin-bottom: 4px; }
        .profil-role { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
        .profil-email { font-size: 13px; color: var(--text-light); }
        .form-title { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 20px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .field input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
        .field input:focus { border-color: var(--brown-light); box-shadow: 0 0 0 3px rgba(150,118,106,0.12); }
        .btn-save { padding: 11px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; background: var(--brown); border: none; font-family: inherit; transition: opacity 0.15s; }
        .btn-save:hover { opacity: 0.85; }
        .success-msg { display: flex; align-items: center; gap: 8px; background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2D7A4F; margin-bottom: 20px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 620px) { .field-row { grid-template-columns: 1fr; } .profil-page { padding: 32px 16px 60px; } }
      `}</style>

      <main className="profil-page">
        {updated && (
          <div className="success-msg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Profil mis à jour avec succès.
          </div>
        )}

        <div className="profil-card">
          <div className="profil-avatar">{initiales || '?'}</div>
          <div className="profil-name">
            {profile?.prenom && profile?.nom
              ? `${profile.prenom} ${profile.nom}`
              : 'Mon profil'}
          </div>
          <div className="profil-role">
            {profile?.role === 'proprietaire' ? 'Propriétaire' : 'Locataire'}
          </div>
          <div className="profil-email">{user.email}</div>
        </div>

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
            <button type="submit" className="btn-save">Enregistrer</button>
          </form>
        </div>
      </main>
    </>
  )
}
