import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { DossierPDF } from '@/lib/pdf/DossierPDF';
import { DossierTemplateData, GarantPDFData, DocumentType, DOCUMENT_SORT_ORDER, getHumanDocTitle, getExpectedDocTypes } from '@/lib/pdf/dossier-template';
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

// Champs du profil transmis par le client pour garantir la fraîcheur des données
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
    // Lire les données de profil envoyées par le client (état courant du formulaire)
    let clientProfile: ClientProfileOverride = {}
    try {
      const body = await request.json()
      if (body?.profile && typeof body.profile === 'object') {
        clientProfile = body.profile
      }
    } catch { /* body absent ou non-JSON — on continue avec la DB */ }

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

    // Fusionner : les données client (fraîches, ce que l'utilisateur voit)
    // priment sur la DB pour éviter tout décalage lié au cache ou à la réplication
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

    // Documents du locataire uniquement (exclure docs de garants)
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .is('garant_id', null);

    // Garants complets + leurs documents
    const { data: garantsRaw } = await supabase
      .from('garants')
      .select('id, prenom, nom, lien, situation_pro, revenus_mensuels')
      .eq('user_id', user.id)
      .order('ordre', { ascending: true });

    const garantCount = garantsRaw?.length ?? 0;
    const garantLabel = garantCount === 0 ? 'Aucun' : garantCount === 1 ? '1 garant' : `${garantCount} garants`;

    const prenom = normalizeName(mergedProfil.prenom);

    // Types attendus selon le statut actuel — écarte les docs d'un statut précédent
    const expectedTypes = getExpectedDocTypes(mergedProfil.situation_pro);

    const sortedDocuments = (documents || [])
      .filter(doc => !!doc.fichier_path && expectedTypes.includes(doc.categorie ?? ''))
      .sort((a, b) => {
        const orderA = DOCUMENT_SORT_ORDER[a.categorie ?? 'autre'] ?? 9;
        const orderB = DOCUMENT_SORT_ORDER[b.categorie ?? 'autre'] ?? 9;
        return orderA - orderB;
      });

    // Compter les occurrences par type pour numéroter (ex : bulletin n°1, n°2)
    const typeCountMap: Record<string, number> = {};
    for (const doc of sortedDocuments) {
      const t = doc.categorie ?? 'autre';
      typeCountMap[t] = (typeCountMap[t] ?? 0) + 1;
    }

    const typeSeqMap: Record<string, number> = {};
    const allDocsWithData = await Promise.all(
      sortedDocuments.map(async (doc) => {
        const docType = (doc.categorie ?? 'autre') as DocumentType;
        typeSeqMap[docType] = (typeSeqMap[docType] ?? 0) + 1;
        const idx = typeCountMap[docType] > 1 ? typeSeqMap[docType] : undefined;

        const b64 = await getBase64FromStorage(supabase, doc.fichier_path);
        const dataUrl = b64 || undefined;
        const statut: 'verifie' | 'non_fourni' = dataUrl ? 'verifie' : 'non_fourni';

        return {
          type: docType,
          label: getHumanDocTitle(docType, prenom, idx),
          statut,
          data_url: dataUrl,
          mime_type: doc.mime_type as string | undefined,
        };
      })
    );

    // Ne conserver que les documents réellement chargés — aucune page "non fourni"
    const docsWithUrls = allDocsWithData.filter(d => d.statut === 'verifie');

    // ── Documents et données des garants ──────────────────────────────────────
    const garantsPDF: GarantPDFData[] = await Promise.all(
      (garantsRaw ?? []).map(async (garant) => {
        const garantPrenom = normalizeName(garant.prenom);

        const { data: garantDocs } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .eq('garant_id', garant.id);

        const expectedGarantTypes = getExpectedDocTypes(garant.situation_pro);

        const sortedGarantDocs = (garantDocs || [])
          .filter(doc => !!doc.fichier_path && expectedGarantTypes.includes(doc.categorie ?? ''))
          .sort((a, b) => {
            const orderA = DOCUMENT_SORT_ORDER[a.categorie ?? 'autre'] ?? 9;
            const orderB = DOCUMENT_SORT_ORDER[b.categorie ?? 'autre'] ?? 9;
            return orderA - orderB;
          });

        const gTypeCountMap: Record<string, number> = {};
        for (const doc of sortedGarantDocs) {
          const t = doc.categorie ?? 'autre';
          gTypeCountMap[t] = (gTypeCountMap[t] ?? 0) + 1;
        }

        const gTypeSeqMap: Record<string, number> = {};
        const garantDocsWithData = await Promise.all(
          sortedGarantDocs.map(async (doc) => {
            const docType = (doc.categorie ?? 'autre') as DocumentType;
            gTypeSeqMap[docType] = (gTypeSeqMap[docType] ?? 0) + 1;
            const idx = gTypeCountMap[docType] > 1 ? gTypeSeqMap[docType] : undefined;

            const b64 = await getBase64FromStorage(supabase, doc.fichier_path);
            const dataUrl = b64 || undefined;
            const statut: 'verifie' | 'non_fourni' = dataUrl ? 'verifie' : 'non_fourni';

            return {
              type: docType,
              label: getHumanDocTitle(docType, garantPrenom, idx),
              statut,
              data_url: dataUrl,
              mime_type: doc.mime_type as string | undefined,
            };
          })
        );

        return {
          prenom: garantPrenom,
          nom: garant.nom ?? '',
          lien: garant.lien ?? undefined,
          situation_professionnelle: mapSituationPro(garant.situation_pro),
          revenus_mensuels_nets: garant.revenus_mensuels ?? 0,
          documents: garantDocsWithData.filter(d => d.statut === 'verifie'),
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
      garants: garantsPDF.length > 0 ? garantsPDF : undefined,
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
