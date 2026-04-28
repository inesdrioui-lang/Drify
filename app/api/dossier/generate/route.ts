import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDossierPDF } from '@/lib/pdf/generate-pdf';
import { DossierTemplateData } from '@/lib/pdf/dossier-template';
import { randomBytes } from 'crypto';

export const maxDuration = 60; // Vercel function timeout

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Profil locataire
    const { data: profil, error: profilError } = await supabase
      .from('profils')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profilError || !profil) {
      return NextResponse.json(
        { error: 'Profil locataire introuvable. Complétez votre dossier.' },
        { status: 404 }
      );
    }

    // Documents du locataire
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('type', { ascending: true });

    // URLs signées (1h) pour les documents vérifiés
    const docsWithUrls = await Promise.all(
      (documents || []).map(async (doc) => {
        let signedUrl: string | undefined;
        if (doc.storage_path && doc.statut === 'verifie') {
          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.storage_path, 3600);
          signedUrl = data?.signedUrl;
        }
        return {
          type: doc.type as string,
          label: (doc.label ?? 'Document') as string,
          statut: doc.statut as 'verifie' | 'non_fourni' | 'en_attente',
          url: signedUrl,
          mime_type: doc.mime_type,
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
        email: profil.email ?? user.email ?? '',
        telephone: profil.telephone ?? '',
        adresse_actuelle: profil.adresse_actuelle ?? '',
        situation_professionnelle: profil.situation_professionnelle ?? '',
        revenus_mensuels_nets: profil.revenus_mensuels_nets ?? 0,
        nom_employeur: profil.nom_employeur,
      },
      dossier: {
        reference,
        date_generation: dateGeneration,
        taux_effort:
          profil.loyer_cible && profil.revenus_mensuels_nets
            ? Math.round((profil.loyer_cible / profil.revenus_mensuels_nets) * 100)
            : undefined,
        score_confiance: profil.score_confiance,
      },
      documents: docsWithUrls,
    };

    const pdfBuffer = await generateDossierPDF(templateData);

    // Sauvegarde dans Supabase Storage (optionnel — non bloquant)
    supabase.storage
      .from('dossiers-generes')
      .upload(`${user.id}/${reference}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })
      .catch((err) => console.error('[PDF Upload Error]', err));

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="dossier-drify-${reference}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF Generation Error]', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du dossier.' }, { status: 500 });
  }
}
