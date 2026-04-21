'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'locataire' | 'proprietaire'
  const prenom = formData.get('prenom') as string | null
  const nom = formData.get('nom') as string | null
  const telephone = formData.get('telephone') as string | null

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Une erreur est survenue. Veuillez réessayer.' }

  await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    role,
    prenom: prenom || null,
    nom: nom || null,
    telephone: telephone || null,
  })

  // Session active immédiatement (confirmation email désactivée dans Supabase)
  if (data.session) {
    redirect(role === 'proprietaire' ? '/dashboard' : '/profil')
  }

  // Confirmation email requise → le client affiche le modal
  return { success: true, role }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Email ou mot de passe incorrect.' }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  await supabase.from('profiles').update({
    prenom: formData.get('prenom') as string,
    nom: formData.get('nom') as string,
    telephone: formData.get('telephone') as string,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  redirect('/profil?updated=1')
}
