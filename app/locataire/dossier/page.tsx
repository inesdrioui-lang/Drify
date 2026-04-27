import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DossierClient from '@/components/dossier/DossierClient'
import type { DocEntry } from '@/components/dossier/DocumentUpload'
import type { GarantData } from '@/app/locataire/dossier/actions'

type GarantWithId = GarantData & { id: string }

export default async function DossierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'proprietaire') redirect('/dashboard')

  // Fetch tenant profile (graceful fallback)
  let tenantProfile = null
  const { data: tp } = await supabase
    .from('tenant_profiles')
    .select('prenom, nom, date_naissance, nationalite, telephone, adresse_actuelle, situation_pro, revenus_mensuels, type_revenus, loyer_cible, dossier_statut')
    .eq('user_id', user.id)
    .single()
  if (tp) tenantProfile = tp

  // Fetch garants (graceful fallback)
  let garants: GarantWithId[] = []
  const { data: garantsData } = await supabase
    .from('garants')
    .select('id, prenom, nom, email, telephone, lien, situation_pro, revenus_mensuels, ordre')
    .eq('user_id', user.id)
    .order('ordre', { ascending: true })
  if (garantsData) garants = garantsData as GarantWithId[]

  // Fetch documents (graceful fallback)
  let documents: DocEntry[] = []
  const { data: docsData } = await supabase
    .from('documents')
    .select('id, nom, categorie, fichier_path, taille_bytes, statut, created_at, garant_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (docsData) {
    documents = docsData.map(d => ({
      id: d.id,
      nom: d.nom,
      type_document: d.categorie,
      fichier_path: d.fichier_path,
      taille_bytes: d.taille_bytes,
      statut: d.statut,
      created_at: d.created_at,
    }))
  }

  return (
    <>
      <style>{`body { background: var(--bg-soft); }`}</style>
      <DossierClient
        userId={user.id}
        initialProfile={tenantProfile}
        initialGarants={garants}
        initialDocuments={documents}
        initialDossierValidated={(tenantProfile as { dossier_statut?: string } | null)?.dossier_statut === 'valide'}
      />
    </>
  )
}
