'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateLocataireProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  await supabase.from('profiles').update({
    prenom: formData.get('prenom') as string,
    nom: formData.get('nom') as string,
    telephone: formData.get('telephone') as string,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  redirect('/locataire/profil?updated=1')
}

export async function insertDocument(data: {
  nom: string
  categorie: string
  fichier_path: string
  taille_bytes: number
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('documents').insert({
    user_id: user.id,
    nom: data.nom,
    categorie: data.categorie,
    fichier_path: data.fichier_path,
    taille_bytes: data.taille_bytes,
    statut: 'en_attente',
  })

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true }
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const documentId = formData.get('document_id') as string
  const fichierPath = formData.get('fichier_path') as string

  await supabase.storage.from('dossier-documents').remove([fichierPath])
  await supabase.from('documents').delete().eq('id', documentId).eq('user_id', user.id)

  revalidatePath('/locataire/dossier')
}

export async function getSignedUrl(fichierPath: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('dossier-documents')
    .createSignedUrl(fichierPath, 3600)
  return data?.signedUrl ?? null
}

export async function joinWaitlistPro(formData: FormData) {
  const supabase = await createClient()

  await supabase.from('waitlist_pro').insert({
    prenom: formData.get('prenom') as string,
    email: formData.get('email') as string,
    type_structure: formData.get('type_structure') as string,
    ville: (formData.get('ville') as string) || null,
  })

  redirect('/pro?joined=1')
}
