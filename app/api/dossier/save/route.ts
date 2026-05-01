import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDossierPDF } from '@/lib/pdf/generate-pdf';
import { DossierTemplateData, DocumentType, DOCUMENT_LABELS } from '@/lib/pdf/dossier-template';
import { randomBytes } from 'crypto';

export const maxDuration = 60;

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profil, error: profilError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profilError || !profil) {
      return NextResponse.json(
        { error: 'Profil locataire introuvable. Complétez votre dossier.' },
        { status: 404 }
      );
    }

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('categorie', { ascending: true });

    const docsWithUrls = await Promise.all(
      (documents || []).map(async (doc) => {
        let signedUrl: string | undefined;
        if (doc.fichier_path) {
          const { data } = await supabase.storage
            .from('dossier-documents')
            .createSignedUrl(doc.fichier_path, 3600);
          signedUrl = data?.signedUrl;
        }
        return {
          type: (doc.categorie ?? 'autre') as DocumentType,
          label: DOCUMENT_LABELS[(doc.categorie ?? 'autre') as DocumentType] ?? (doc.nom ?? 'Document'),
          statut: (doc.statut ?? 'en_attente') as 'verifie' | 'non_fourni' | 'en_attente',
          url: signedUrl,
          mime_type: doc.mime_type as string | undefined,
        };
      })
    );

    const reference = `DRF-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const dateGeneration = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const templateData: DossierTemplateData = {
      candidat: {
        prenom: profil.prenom ?? '',
        nom: profil.nom ?? '',
        email: user.email ?? '',
        telephone: profil.telephone ?? '',
        adresse_actuelle: profil.adresse_actuelle ?? '',
        situation_professionnelle: profil.situation_pro ?? '',
        revenus_mensuels_nets: profil.revenus_mensuels ?? 0,
      },
      dossier: {
        reference,
        date_generation: dateGeneration,
        taux_effort:
          profil.loyer_cible && profil.revenus_mensuels
            ? Math.round((profil.loyer_cible / profil.revenus_mensuels) * 100)
            : undefined,
        score_confiance: profil.score_confiance ?? undefined,
      },
      documents: docsWithUrls,
    };

    const pdfBuffer = await generateDossierPDF(templateData);

    const storagePath = `${user.id}/dossier-valide.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('dossiers-generes')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[PDF Save Error]', uploadError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde du dossier.' }, { status: 500 });
    }

    const { data: signedData } = await supabase.storage
      .from('dossiers-generes')
      .createSignedUrl(storagePath, 60 * 60 * 24);

    return NextResponse.json({ url: signedData?.signedUrl ?? null, reference });
  } catch (error) {
    console.error('[PDF Save Error]', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde du dossier.' }, { status: 500 });
  }
}
