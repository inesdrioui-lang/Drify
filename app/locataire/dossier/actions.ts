'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface TenantProfileData {
  prenom?: string
  nom?: string
  date_naissance?: string
  nationalite?: string
  telephone?: string
  adresse_actuelle?: string
  situation_pro?: string
  revenus_mensuels?: number | null
  type_revenus?: string
  loyer_cible?: number | null
}

export interface GarantData {
  id?: string
  type_garant?: 'physique' | 'organisme'
  prenom: string
  nom: string
  nationalite?: string
  email?: string
  telephone?: string
  date_naissance?: string
  adresse?: string
  lien?: string
  type_revenus?: string
  situation_pro: string
  revenus_mensuels: number
  ordre: 1 | 2
}

export async function saveTenantProfile(
  data: TenantProfileData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('tenant_profiles')
    .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true }
}

export async function saveGarant(
  data: GarantData
): Promise<{ error?: string; success?: boolean; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  if (data.id) {
    const { error } = await supabase
      .from('garants')
      .update({ ...data })
      .eq('id', data.id)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/locataire/dossier')
    return { success: true, id: data.id }
  } else {
    const { data: inserted, error } = await supabase
      .from('garants')
      .insert({ user_id: user.id, ...data })
      .select('id')
      .single()
    if (error) return { error: error.message }
    revalidatePath('/locataire/dossier')
    return { success: true, id: inserted?.id }
  }
}

export async function deleteGarant(
  garantId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('garants')
    .delete()
    .eq('id', garantId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true }
}

export async function recordDocument(data: {
  nom: string
  type_document: string
  fichier_path: string
  taille_bytes: number
  garant_id?: string | null
}): Promise<{ error?: string; success?: boolean; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: inserted, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      nom: data.nom,
      categorie: data.type_document,
      fichier_path: data.fichier_path,
      taille_bytes: data.taille_bytes,
      statut: 'en_attente',
      garant_id: data.garant_id ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true, id: inserted?.id }
}

export async function removeDocument(
  documentId: string,
  fichierPath: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  await supabase.storage.from('dossier-documents').remove([fichierPath])
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true }
}

export async function getDocumentSignedUrl(fichierPath: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('dossier-documents')
    .createSignedUrl(fichierPath, 3600)
  return data?.signedUrl ?? null
}

export async function validateDossier(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('tenant_profiles')
    .update({ dossier_statut: 'valide' })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/locataire/dossier')
  return { success: true }
}
