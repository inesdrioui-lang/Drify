import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { DossierPDF } from '@/lib/pdf/DossierPDF';
import { DossierTemplateData, DocumentType, DOCUMENT_SORT_ORDER, getHumanDocTitle } from '@/lib/pdf/dossier-template';
import { randomBytes } from 'crypto';

export const maxDuration = 60;

const SITUATION_PRO_LABELS: Record<string, string> = {
  salarie_cdi: 'Salarié CDI',
  salarie_cdd: 'Salarié CDD',
  fonctionnaire: 'Fonctionnaire',
  independant: 'Indépendant / Freelance',
  etudiant: 'Étudiant',
  sans_emploi: 'Sans emploi',
  retraite: 'Retraité',
}

function mapSituationPro(raw: string | null | undefined): string {
  if (!raw) return ''
  return SITUATION_PRO_LABELS[raw] ?? raw
}

function normalizeName(s: string | null | undefined): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

interface ClientProfileOverride {
  prenom?: string
  nom?: string
  situation_pro?: string
  revenus_mensuels?: number | null
  loyer_cible?: number | null
  telephone?: string
  adresse_actuelle?: string
}

export async function POST(request: Request) {
  try {
    let clientProfile: ClientProfileOverride = {}
    try {
      const body = await request.json()
      if (body?.profile && typeof body.profile === 'object') {
        clientProfile = body.profile
      }
    } catch { /* body absent — on continue avec la DB */ }

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

    const mergedProfil = {
      ...profil,
      prenom:           clientProfile.prenom           ?? profil.prenom,
      nom:              clientProfile.nom               ?? profil.nom,
      situation_pro:    clientProfile.situation_pro     ?? profil.situation_pro,
      revenus_mensuels: clientProfile.revenus_mensuels  ?? profil.revenus_mensuels,
      loyer_cible:      clientProfile.loyer_cible       ?? profil.loyer_cible,
      telephone:        clientProfile.telephone         ?? profil.telephone,
      adresse_actuelle: clientProfile.adresse_actuelle  ?? profil.adresse_actuelle,
    }

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id);

    const { data: garantsData } = await supabase
      .from('garants')
      .select('id')
      .eq('user_id', user.id);
    const garantCount = garantsData?.length ?? 0;
    const garantLabel = garantCount === 0 ? 'Aucun' : garantCount === 1 ? '1 garant' : `${garantCount} garants`;

    const sortedDocuments = (documents || []).sort((a, b) => {
      const orderA = DOCUMENT_SORT_ORDER[a.categorie ?? 'autre'] ?? 9;
      const orderB = DOCUMENT_SORT_ORDER[b.categorie ?? 'autre'] ?? 9;
      return orderA - orderB;
    });

    const prenom = normalizeName(mergedProfil.prenom);

    const typeCountMap: Record<string, number> = {};
    for (const doc of sortedDocuments) {
      const t = doc.categorie ?? 'autre';
      typeCountMap[t] = (typeCountMap[t] ?? 0) + 1;
    }
    const typeSeqMap: Record<string, number> = {};

    const docsWithUrls = await Promise.all(
      sortedDocuments.map(async (doc) => {
        let signedUrl: string | undefined;
        if (doc.fichier_path) {
          const { data } = await supabase.storage
            .from('dossier-documents')
            .createSignedUrl(doc.fichier_path, 3600);
          signedUrl = data?.signedUrl;
        }
        const statut: 'verifie' | 'non_fourni' = signedUrl ? 'verifie' : 'non_fourni';
        const docType = (doc.categorie ?? 'autre') as DocumentType;
        typeSeqMap[docType] = (typeSeqMap[docType] ?? 0) + 1;
        const idx = typeCountMap[docType] > 1 ? typeSeqMap[docType] : undefined;
        return {
          type: docType,
          label: getHumanDocTitle(docType, prenom, idx),
          statut,
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
        prenom,
        nom: mergedProfil.nom ?? '',
        email: user.email ?? '',
        telephone: mergedProfil.telephone ?? '',
        adresse_actuelle: mergedProfil.adresse_actuelle ?? '',
        situation_professionnelle: mapSituationPro(mergedProfil.situation_pro),
        revenus_mensuels_nets: mergedProfil.revenus_mensuels ?? 0,
        garant_label: garantLabel,
      },
      dossier: {
        reference,
        date_generation: dateGeneration,
        taux_effort:
          mergedProfil.loyer_cible && mergedProfil.revenus_mensuels
            ? Math.round((mergedProfil.loyer_cible / mergedProfil.revenus_mensuels) * 100)
            : undefined,
        score_confiance: profil.score_confiance ?? undefined,
      },
      documents: docsWithUrls,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(DossierPDF, { data: templateData }) as Parameters<typeof renderToBuffer>[0]
    );

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
