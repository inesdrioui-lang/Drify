import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { role: string; prenom: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, prenom')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <>
      <style>{`
        .drify-nav {
          position: sticky; top: 0; z-index: 100;
          height: 60px; display: flex; align-items: center;
          padding: 0 40px;
          background: rgba(253,252,250,0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-soft);
        }
        .drify-nav .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-right: 48px; flex-shrink: 0; }
        .drify-nav .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .drify-nav .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
        .drify-nav .nav-links a:hover { color: var(--brown); background: var(--bg-soft); }
        .drify-nav .nav-end { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .drify-nav .btn-ghost { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: var(--brown-mid); border: 1px solid var(--border); background: transparent; transition: background 0.15s; font-family: inherit; white-space: nowrap; }
        .drify-nav .btn-ghost:hover { background: var(--bg-soft); }
        .drify-nav .btn-primary { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; color: #fff; background: var(--brown); border: none; transition: opacity 0.15s; font-family: inherit; white-space: nowrap; }
        .drify-nav .btn-primary:hover { opacity: 0.85; }
        .drify-nav .btn-signout { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-muted); border: 1px solid var(--border); background: transparent; transition: background 0.15s; font-family: inherit; white-space: nowrap; }
        .drify-nav .btn-signout:hover { background: var(--bg-soft); color: var(--brown); }
        @media (max-width: 620px) {
          .drify-nav { padding: 0 20px; }
          .drify-nav .nav-links { display: none; }
        }
      `}</style>
      <nav className="drify-nav">
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
          {!user ? (
            <>
              <Link href="/connexion" className="btn-ghost">Se connecter</Link>
              <Link href="/inscription" className="btn-primary">S&apos;inscrire</Link>
            </>
          ) : (
            <>
              {profile?.role === 'proprietaire' && (
                <Link href="/dashboard" className="btn-ghost">Mon dashboard</Link>
              )}
              <Link href="/profil" className="btn-ghost">Mon profil</Link>
              <form action={signOut} style={{display:'inline'}}>
                <button type="submit" className="btn-signout">Se déconnecter</button>
              </form>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
