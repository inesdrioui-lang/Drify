import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteDocument } from '@/app/locataire/actions'
import FileUpload from '@/components/locataire/FileUpload'
import ViewDocumentButton from '@/components/locataire/ViewDocumentButton'

type Document = {
  id: string
  nom: string
  categorie: string
  fichier_path: string
  taille_bytes: number
  statut: string
  created_at: string
}

const CATEGORIES = [
  {
    id: 'identite',
    label: "Pièce d'identité",
    description: 'CNI, passeport en cours de validité',
    points: 20,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'revenus',
    label: 'Bulletins de salaire',
    description: '3 derniers bulletins de salaire',
    points: 20,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'emploi',
    label: "Justificatifs d'emploi",
    description: "Contrat de travail, attestation employeur",
    points: 15,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    id: 'impots',
    label: "Avis d'imposition",
    description: '3 derniers avis d\'imposition',
    points: 15,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'garant',
    label: 'Documents garant',
    description: 'CNI et justificatifs de revenus du garant',
    points: 10,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'quittances',
    label: 'Quittances de loyer',
    description: '3 dernières quittances de votre logement actuel',
    points: 0,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function calcScore(docs: Document[], profileComplete: boolean): number {
  let score = 0
  if (profileComplete) score += 20
  const cats = docs.map(d => d.categorie)
  if (cats.includes('identite')) score += 20
  if (cats.includes('revenus')) score += 20
  if (cats.includes('emploi')) score += 15
  if (cats.includes('impots')) score += 15
  if (cats.includes('garant')) score += 10
  return Math.min(score, 100)
}

function statutBadge(statut: string) {
  if (statut === 'valide') return { label: 'Validé', color: '#4A7C59', bg: '#EAF3EE' }
  if (statut === 'refuse') return { label: 'Refusé', color: '#9B3A2A', bg: '#FAECEC' }
  return { label: 'En attente', color: '#9B7226', bg: '#FDF4E3' }
}

export default async function DossierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, nom, telephone, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'proprietaire') redirect('/dashboard')

  // Documents avec fallback si table absente
  let documents: Document[] = []
  const { data: docsData, error: docsError } = await supabase
    .from('documents')
    .select('id, nom, categorie, fichier_path, taille_bytes, statut, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (!docsError) documents = docsData ?? []

  const profileComplete = !!(profile?.prenom && profile?.nom && profile?.telephone)
  const score = calcScore(documents, profileComplete)
  const scoreColor = score >= 80 ? '#4A7C59' : score >= 50 ? '#9B7226' : '#9B3A2A'

  const docsByCategorie = Object.fromEntries(
    CATEGORIES.map(cat => [cat.id, documents.filter(d => d.categorie === cat.id)])
  )

  return (
    <>
      <style>{`
        body { background: var(--bg-soft); }
        .dossier-page { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; animation: dFade 0.25s ease-out both; }
        @keyframes dFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        /* Header */
        .dossier-header { margin-bottom: 28px; }
        .dossier-header h1 { font-size: 28px; font-weight: 800; color: var(--brown); letter-spacing: -0.5px; margin-bottom: 4px; }
        .dossier-header p { font-size: 14px; color: var(--text-muted); }

        /* Score card */
        .score-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; }
        .score-num { font-size: 40px; font-weight: 800; letter-spacing: -1px; flex-shrink: 0; }
        .score-right { flex: 1; }
        .score-label { font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 8px; }
        .score-bar-track { height: 10px; background: var(--border); border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
        .score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
        .score-hint { font-size: 12px; color: var(--text-light); }
        .score-pts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .score-pt { font-size: 11px; padding: 3px 8px; border-radius: 99px; font-weight: 600; }

        /* Category card */
        .cat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; margin-bottom: 14px; overflow: hidden; }
        .cat-header { display: flex; align-items: center; gap: 14px; padding: 18px 22px; border-bottom: 1px solid var(--border-soft); }
        .cat-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-soft); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--brown-light); flex-shrink: 0; }
        .cat-title { font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 2px; }
        .cat-desc { font-size: 12px; color: var(--text-muted); }
        .cat-pts { margin-left: auto; flex-shrink: 0; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
        .cat-body { padding: 16px 22px; }

        /* Document item */
        .doc-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-soft); }
        .doc-item:last-child { border-bottom: none; }
        .doc-icon { color: var(--brown-light); flex-shrink: 0; }
        .doc-body { flex: 1; min-width: 0; }
        .doc-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .doc-meta { font-size: 11px; color: var(--text-light); }
        .doc-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .badge-sm { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
        .btn-delete { background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-light); transition: color 0.12s; border-radius: 6px; }
        .btn-delete:hover { color: var(--error); background: #FAECEC; }

        /* Upload zone */
        .upload-wrap { margin-top: 14px; }

        /* Alerte table absente */
        .info-banner { background: #FDF4E3; border: 1px solid #F5D98B; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #9B7226; margin-bottom: 20px; }

        @media (max-width: 640px) {
          .dossier-page { padding: 28px 16px 60px; }
          .score-card { flex-direction: column; align-items: flex-start; gap: 12px; }
          .cat-header { padding: 14px 16px; }
          .cat-body { padding: 12px 16px; }
        }
      `}</style>

      <main className="dossier-page">
        <div className="dossier-header">
          <h1>Mon dossier locataire</h1>
          <p>Constituez votre dossier une seule fois, envoyez-le à toutes vos candidatures.</p>
        </div>

        {docsError && (
          <div className="info-banner">
            La table des documents n&apos;est pas encore configurée dans Supabase.
            Créez la table <code>documents</code> pour activer cette fonctionnalité.
          </div>
        )}

        {/* ── Score global ── */}
        <div className="score-card">
          <div className="score-num" style={{ color: scoreColor }}>{score}</div>
          <div className="score-right">
            <div className="score-label">Force du dossier · {score}/100</div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
            </div>
            <div className="score-hint">
              {score < 40 && 'Ajoutez vos documents pour renforcer votre dossier.'}
              {score >= 40 && score < 70 && 'Bon début ! Continuez pour atteindre un dossier solide.'}
              {score >= 70 && score < 100 && 'Excellent dossier — encore quelques documents pour être au max.'}
              {score === 100 && 'Dossier complet — vous êtes prêt à postuler partout !'}
            </div>
            <div className="score-pts">
              <span className="score-pt" style={{ background: profileComplete ? '#EAF3EE' : '#F0EBE4', color: profileComplete ? '#4A7C59' : 'var(--text-light)' }}>
                {profileComplete ? '✓' : '○'} Profil +20
              </span>
              {CATEGORIES.filter(c => c.points > 0).map(cat => {
                const has = (docsByCategorie[cat.id]?.length ?? 0) > 0
                return (
                  <span key={cat.id} className="score-pt" style={{ background: has ? '#EAF3EE' : '#F0EBE4', color: has ? '#4A7C59' : 'var(--text-light)' }}>
                    {has ? '✓' : '○'} {cat.label.split(' ')[0]} +{cat.points}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Catégories ── */}
        {CATEGORIES.map(cat => {
          const catDocs = docsByCategorie[cat.id] ?? []
          const hasDoc = catDocs.length > 0
          return (
            <div key={cat.id} className="cat-card">
              <div className="cat-header">
                <div className="cat-icon">{cat.icon}</div>
                <div>
                  <div className="cat-title">{cat.label}</div>
                  <div className="cat-desc">{cat.description}</div>
                </div>
                {cat.points > 0 && (
                  <span className="cat-pts" style={{
                    background: hasDoc ? '#EAF3EE' : '#F0EBE4',
                    color: hasDoc ? '#4A7C59' : 'var(--text-light)',
                  }}>
                    {hasDoc ? '✓' : '+'}{cat.points} pts
                  </span>
                )}
              </div>

              <div className="cat-body">
                {catDocs.length > 0 && (
                  <>
                    {catDocs.map(doc => {
                      const s = statutBadge(doc.statut)
                      return (
                        <div key={doc.id} className="doc-item">
                          <div className="doc-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="doc-body">
                            <div className="doc-name">{doc.nom}</div>
                            <div className="doc-meta">{formatSize(doc.taille_bytes)} · {formatDate(doc.created_at)}</div>
                          </div>
                          <div className="doc-actions">
                            <span className="badge-sm" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                            <ViewDocumentButton fichierPath={doc.fichier_path} />
                            <form action={deleteDocument}>
                              <input type="hidden" name="document_id" value={doc.id} />
                              <input type="hidden" name="fichier_path" value={doc.fichier_path} />
                              <button type="submit" className="btn-delete" aria-label="Supprimer le document">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            </form>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}

                <div className="upload-wrap">
                  <FileUpload categorie={cat.id} userId={user.id} />
                </div>
              </div>
            </div>
          )
        })}
      </main>
    </>
  )
}
