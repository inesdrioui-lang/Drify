import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { DossierPDF } from '@/lib/pdf/DossierPDF';
import { DossierTemplateData, DocumentType, DOCUMENT_LABELS, DOCUMENT_SORT_ORDER, getHumanDocTitle } from '@/lib/pdf/dossier-template';
import { randomBytes } from 'crypto';

function normalizeName(s: string | null | undefined): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

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

export const maxDuration = 60;

function detectMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const mimes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }
  return mimes[ext ?? ''] ?? 'image/jpeg'
}

async function getBase64FromStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('dossier-documents')
      .download(path)
    if (error || !data) {
      console.error(`[PDF] download error for ${path}:`, error)
      return ''
    }
    const arrayBuffer = await data.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = data.type || detectMimeType(path)
    return `data:${mimeType};base64,${base64}`
  } catch (err) {
    console.error(`[PDF] base64 conversion error for ${path}:`, err)
    return ''
  }
}

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

    const prenom = normalizeName(profil.prenom);

    // Pré-compter les types pour numéroter les doublons (ex : bulletin n°1, n°2)
    const typeCountMap: Record<string, number> = {};
    for (const doc of sortedDocuments) {
      const t = doc.categorie ?? 'autre';
      typeCountMap[t] = (typeCountMap[t] ?? 0) + 1;
    }
    const typeSeqMap: Record<string, number> = {};
    const docLabels = sortedDocuments.map((doc) => {
      const docType = (doc.categorie ?? 'autre') as DocumentType;
      typeSeqMap[docType] = (typeSeqMap[docType] ?? 0) + 1;
      const idx = typeCountMap[docType] > 1 ? typeSeqMap[docType] : undefined;
      return getHumanDocTitle(docType, prenom, idx);
    });

    const docsWithUrls = await Promise.all(
      sortedDocuments.map(async (doc, i) => {
        let dataUrl: string | undefined;
        if (doc.fichier_path) {
          const b64 = await getBase64FromStorage(supabase, doc.fichier_path);
          if (b64) dataUrl = b64;
        }
        const statut: 'verifie' | 'non_fourni' = dataUrl ? 'verifie' : 'non_fourni';
        const docType = (doc.categorie ?? 'autre') as DocumentType;
        return {
          type: docType,
          label: docLabels[i],
          statut,
          data_url: dataUrl,
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
        nom: profil.nom ?? '',
        email: user.email ?? '',
        telephone: profil.telephone ?? '',
        adresse_actuelle: profil.adresse_actuelle ?? '',
        situation_professionnelle: mapSituationPro(profil.situation_pro),
        revenus_mensuels_nets: profil.revenus_mensuels ?? 0,
        garant_label: garantLabel,
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

    const pdfBuffer = await renderToBuffer(
      React.createElement(DossierPDF, { data: templateData }) as Parameters<typeof renderToBuffer>[0]
    );

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
