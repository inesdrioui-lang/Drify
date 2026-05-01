# DossierPreview — Composant de prévisualisation de dossier locataire

Composant React/Next.js qui génère une prévisualisation PDF-like d'un dossier de location,
aux couleurs de Drify, inspiré du format DossierFacile.

---

## Structure des fichiers

```
types/
  dossier.ts                     → Type DossierLocataire + helpers

components/dossier/
  DossierPreview.tsx             → Composant principal (orchestre toutes les pages)
  DossierPage.tsx                → Wrapper A4 (794px × 1123px)
  DossierHeader.tsx              → Header récurrent avec logo Drify + nom
  DossierCover.tsx               → Page de couverture (illustration + récap + TDM)
  DossierSummaryTable.tsx        → Tableau 3 colonnes (dossier / revenus / garant)
  DossierSection.tsx             → Wrapper de section avec titre
  DossierDocumentView.tsx        → Affichage document (image ou placeholder)
  DossierFooter.tsx              → Footer avec numéro de page

app/dossier/preview/
  page.tsx                       → Page démo avec données fictives
```

---

## Utilisation dans le flow locataire

```tsx
import DossierPreview from '@/components/dossier/DossierPreview'
import type { DossierLocataire } from '@/types/dossier'

// Dans une Server Component — récupérer les données depuis Supabase
async function DossierPreviewPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('tenant_profiles')
    .select('*')
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('type, storage_url')
    .eq('user_id', profile.user_id)

  // Mapper les données Supabase vers DossierLocataire
  const dossier: DossierLocataire = {
    prenom: profile.prenom,
    nom: profile.nom,
    email: profile.email,
    dateNaissance: profile.date_naissance,
    lieuNaissance: profile.lieu_naissance,
    nationalite: profile.nationalite,
    typeDossier: profile.type_dossier ?? 'seul',
    motDuLocataire: profile.mot_locataire,
    revenusMensuelsNets: profile.revenus_mensuels ?? 0,
    typeContrat: profile.type_contrat ?? 'CDI',
    employeur: profile.employeur,
    typeGarant: profile.type_garant ?? 'aucun',
    nomOrganismeGarant: profile.nom_organisme_garant,
    // Récupérer les URLs depuis Supabase Storage
    pieceIdentiteUrl: documents?.find(d => d.type === 'identite')?.storage_url,
    justificatifActiviteUrl: documents?.find(d => d.type === 'activite')?.storage_url,
    avisImpositionUrl: documents?.find(d => d.type === 'imposition')?.storage_url,
    justificatifRessourcesUrls: documents
      ?.filter(d => d.type === 'revenus')
      .map(d => d.storage_url),
    justificatifHebergementUrls: documents
      ?.filter(d => d.type === 'hebergement')
      .map(d => d.storage_url),
    attestationGarantUrl: documents?.find(d => d.type === 'garant')?.storage_url,
  }

  return (
    <main style={{ background: '#F0EBE3', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <DossierPreview dossier={dossier} />
      </div>
    </main>
  )
}
```

---

## Fonctionnalités

### Export PDF
Le bouton "Imprimer / Exporter PDF" déclenche `window.print()`.
Le CSS `@media print` dans `globals.css` :
- Masque la navbar, le footer et le bouton d'impression
- Ajoute un saut de page après chaque `.dossier-page`
- Supprime les ombres et marges superflues

Pour générer un PDF propre via le navigateur :
1. Cliquer "Imprimer / Exporter PDF"
2. Choisir "Enregistrer en PDF" comme destination
3. Format A4, marges : Aucune

### Pages générées
| Page | Contenu | Condition |
|------|---------|-----------|
| 1 | Couverture + tableau récap + table des matières | Toujours |
| 2 | Mot du locataire | Si `motDuLocataire` renseigné |
| N | Pièce d'identité | Toujours |
| N+1 | Justificatif d'activité | Toujours |
| N+2 | Justificatifs de revenus | Toujours |
| N+3 | Avis d'imposition | Toujours |
| N+4 | Justificatif d'hébergement | Toujours |
| N+5 | Attestation garant | Si `typeGarant !== 'aucun'` |

### Documents manquants
Si une URL de document est absente, `DossierDocumentView` affiche un placeholder stylé
(cadre en pointillés beige avec icône) — le dossier reste cohérent visuellement.

### État de chargement
Passer `loading={true}` à `DossierPreview` pour afficher des skeletons animés
pendant le chargement des URLs depuis Supabase Storage.

---

## Intégration avec le flow existant

Le composant `DossierPreview` est séparé du composant `DossierClient` (formulaire de saisie).
Pour connecter les deux :

```tsx
// Dans /app/locataire/dossier/page.tsx
// Ajouter un bouton "Prévisualiser mon dossier" qui navigue vers /dossier/preview
// en passant les données via searchParams ou en les récupérant depuis Supabase dans la page preview
```

---

## Démo

La page `/dossier/preview` affiche un dossier fictif complet (Marie Dupont)
avec tous les placeholders visuels — utilisable pour présenter le rendu à des prospects.
