import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateLocataireProfile } from '@/app/locataire/actions'
import Link from 'next/link'

type Document = { categorie: string }

function calcScore(profile: {
  prenom?: string | null
  nom?: string | null
  telephone?: string | null
}, docs: Document[]): number {
  let score = 0
  // Profil complet → +20
  if (profile.prenom && profile.nom && profile.telephone) score += 20
  // Par catégorie
  const cats = docs.map(d => d.categorie)
  if (cats.includes('identite')) score += 20
  if (cats.includes('revenus')) score += 20
  if (cats.includes('emploi')) score += 15
  if (cats.includes('impots')) score += 15
  if (cats.includes('garant')) score += 10
  return Math.min(score, 100)
}

const SITUATIONS = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'independant', label: 'Indépendant / Freelance' },
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'retraite', label: 'Retraité' },
  { value: 'autre', label: 'Autre' },
]

export default async function LocataireProfilPage({
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

  if (profile?.role === 'proprietaire') redirect('/dashboard')

  // Documents pour le score
  let docs: Document[] = []
  const { data: docsData, error: docsError } = await supabase
    .from('documents')
    .select('categorie')
    .eq('user_id', user.id)
  if (!docsError) docs = docsData ?? []

  const { updated } = await searchParams
  const initiales = `${profile?.prenom?.[0] ?? ''}${profile?.nom?.[0] ?? ''}`.toUpperCase()
  const score = calcScore(profile ?? {}, docs)

  // Calcul de complétion du profil
  const fieldsTotal = 5
  let fieldsFilled = 0
  if (profile?.prenom) fieldsFilled++
  if (profile?.nom) fieldsFilled++
  if (profile?.telephone) fieldsFilled++
  if ((profile as Record<string, unknown>)?.situation_pro) fieldsFilled++
  if ((profile as Record<string, unknown>)?.revenus_mensuels) fieldsFilled++
  const completion = Math.round((fieldsFilled / fieldsTotal) * 100)

  const scoreColor = score >= 80 ? '#4A7C59' : score >= 50 ? '#9B7226' : '#9B3A2A'
  const scoreBg = score >= 80 ? '#EAF3EE' : score >= 50 ? '#FDF4E3' : '#FAECEC'

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }
        .lp-page { max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; animation: lpFade 0.25s ease-out both; }
        @keyframes lpFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .lp-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px 32px; margin-bottom: 16px; }

        /* Avatar */
        .lp-avatar { width: 64px; height: 64px; border-radius: 50%; background: #EDE0CF; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: var(--brown-mid); flex-shrink: 0; }
        .lp-identity { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .lp-name { font-size: 22px; font-weight: 800; color: var(--brown); letter-spacing: -0.4px; margin-bottom: 2px; }
        .lp-role { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .lp-email { font-size: 13px; color: var(--text-light); margin-top: 2px; }

        /* Score */
        .score-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border-soft); }
        .score-badge { display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 14px; font-size: 20px; font-weight: 800; flex-shrink: 0; }
        .score-info { flex: 1; }
        .score-title { font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 6px; }
        .score-bar-track { height: 8px; background: var(--border); border-radius: 99px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .score-sub { font-size: 11px; color: var(--text-light); margin-top: 4px; }

        /* Complétion */
        .completion-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; background: var(--bg-soft); border: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); }

        /* Forme */
        .form-title { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 20px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .field input, .field select { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; font-family: inherit; color: var(--text); background: var(--bg); outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; -webkit-appearance: none; }
        .field input:focus, .field select:focus { border-color: var(--brown-light); box-shadow: 0 0 0 3px rgba(150,118,106,0.12); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-hint { font-size: 11px; color: var(--text-light); margin-top: 4px; }
        .btn-save { padding: 11px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; background: var(--brown); border: none; font-family: inherit; transition: opacity 0.15s; }
        .btn-save:hover { opacity: 0.85; }

        /* Garants section */
        .section-title { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 4px; }
        .section-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
        .garant-empty { padding: 32px; text-align: center; border: 1px dashed var(--border); border-radius: 12px; }
        .garant-empty p { font-size: 13px; color: var(--text-muted); margin-top: 8px; }
        .btn-ghost-sm { padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; color: var(--brown-mid); border: 1px solid var(--border); background: transparent; cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; }
        .btn-ghost-sm:hover { background: var(--bg-card); color: var(--brown); }

        /* Succes */
        .success-msg { display: flex; align-items: center; gap: 8px; background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2D7A4F; margin-bottom: 20px; }

        /* CTA dossier */
        .dossier-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .dossier-cta-text { font-size: 13px; color: var(--text-muted); }
        .btn-primary-sm { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; color: #fff; background: var(--brown); border: none; cursor: pointer; text-decoration: none; font-family: inherit; transition: opacity 0.15s; white-space: nowrap; }
        .btn-primary-sm:hover { opacity: 0.85; }

        @media (max-width: 640px) {
          .lp-page { padding: 28px 16px 60px; }
          .lp-card { padding: 20px; }
          .field-row { grid-template-columns: 1fr; }
          .dossier-cta { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <main className="lp-page">
        {updated && (
          <div className="success-msg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Profil mis à jour.
          </div>
        )}

        {/* ── Identité + Score ── */}
        <div className="lp-card">
          <div className="lp-identity">
            <div className="lp-avatar">{initiales || '?'}</div>
            <div>
              <div className="lp-name">
                {profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : 'Mon profil'}
              </div>
              <div className="lp-role">Locataire</div>
              <div className="lp-email">{user.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="completion-chip">
                Profil complété à {completion}%
              </span>
            </div>
          </div>

          <div className="score-row">
            <div className="score-badge" style={{ background: scoreBg, color: scoreColor }}>
              {score}
            </div>
            <div className="score-info">
              <div className="score-title">Force du dossier · {score}/100</div>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
              </div>
              <div className="score-sub">
                {score < 40 && 'Commencez par compléter votre profil et ajouter vos documents.'}
                {score >= 40 && score < 70 && 'Bon début — ajoutez vos documents manquants pour renforcer votre dossier.'}
                {score >= 70 && score < 100 && 'Très bon dossier ! Quelques documents supplémentaires pour atteindre 100.'}
                {score === 100 && 'Dossier complet — votre profil est au maximum !'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Lien vers le dossier ── */}
        <div className="lp-card">
          <div className="dossier-cta">
            <div>
              <div className="section-title">Mon dossier locataire</div>
              <div className="dossier-cta-text">Gérez vos documents pour postuler aux annonces rapidement.</div>
            </div>
            <Link href="/locataire/dossier" className="btn-primary-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Voir mon dossier
            </Link>
          </div>
        </div>

        {/* ── Modifier le profil ── */}
        <div className="lp-card">
          <div className="form-title">Modifier mes informations</div>
          <form action={updateLocataireProfile}>
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
            <div className="field-row">
              <div className="field">
                <label htmlFor="situation_pro">Situation professionnelle</label>
                <select id="situation_pro" name="situation_pro" defaultValue={(profile as Record<string, unknown>)?.situation_pro as string ?? ''}>
                  <option value="">Choisir…</option>
                  {SITUATIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="revenus_mensuels">Revenus mensuels nets (€)</label>
                <input type="number" id="revenus_mensuels" name="revenus_mensuels" defaultValue={(profile as Record<string, unknown>)?.revenus_mensuels as number ?? ''} placeholder="Ex: 2 500" min="0" step="100" />
                <div className="field-hint">Utilisé pour calculer la force de votre dossier</div>
              </div>
            </div>
            <button type="submit" className="btn-save">Enregistrer</button>
          </form>
        </div>

        {/* ── Garants ── */}
        <div className="lp-card">
          <div className="section-title">Mes garants</div>
          <div className="section-sub">Ajoutez jusqu&apos;à 2 garants pour renforcer votre dossier (+10 pts).</div>
          <div className="garant-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" style={{margin:'0 auto'}}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p>Aucun garant ajouté pour l&apos;instant.</p>
            <a href="#" className="btn-ghost-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Ajouter un garant
            </a>
          </div>
        </div>

        {/* ── Nav rapide ── */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
          <Link href="/locataire/archives" style={{ padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, color: 'var(--brown-mid)', border: '1px solid var(--border)', background: 'transparent', textDecoration: 'none' }}>
            Mes candidatures
          </Link>
          <Link href="/recherche" style={{ padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, color: 'var(--brown-mid)', border: '1px solid var(--border)', background: 'transparent', textDecoration: 'none' }}>
            Chercher un logement
          </Link>
        </div>
      </main>
    </>
  )
}
