# Corrections dossier locataire — 2026-05-12

## Bugs identifiés lors de l'audit

### BUG 1 — CRITIQUE : Filtre `expectedTypes` trop restrictif → documents exclus du PDF
**Fichiers** : `app/api/dossier/generate/route.ts` et `app/api/dossier/save/route.ts`

Le filtre `getExpectedDocTypes(situation_pro)` excluait silencieusement tout document dont
la catégorie ne correspond pas exactement au statut pro actuel. Exemples :
- Un `quittance_loyer` uploadé par un salarié CDI → absent du PDF
- Un document uploadé avant un changement de statut pro → absent du PDF
- Si `situation_pro` est null → seulement 4 types passaient, bulletins de salaire exclus

Idem pour les documents des garants.

### BUG 2 — CRITIQUE : `/api/dossier/save` ne générait PAS les garants dans le PDF validé
La route ne récupérait que le nombre de garants (pour le label). Le `templateData`
ne contenait pas de `garants`. Le PDF envoyé aux propriétaires était incomplet.

### BUG 3 — CRITIQUE : `/api/dossier/save` utilisait `createSignedUrl` → images invisibles
`DossierPDF` ne lit que `doc.data_url` (base64 inline). La route passait `doc.url`
(URL signée Supabase). Résultat : tous les documents apparaissaient en placeholder
"Format non supporté" dans le PDF validé.

### BUG 4 — MODÉRÉ : Route ancienne dupliquée `/api/generate-dossier`
Utilise `pdf-lib` au lieu de react-pdf, format visuel entièrement différent.
Non corrigée ici (non appelée par l'UI) — à supprimer ultérieurement.

---

## Fichiers modifiés

### `app/api/dossier/generate/route.ts`
- Supprimé le filtre `expectedTypes` pour les documents du locataire
- Supprimé le filtre `expectedTypes` pour les documents des garants
- Supprimé l'import inutilisé `getExpectedDocTypes`
- Tous les documents avec `fichier_path` sont maintenant inclus dans le PDF

### `app/api/dossier/save/route.ts`
- Réécrit pour être identique à `generate/route.ts` dans sa logique de données
- Remplacé `createSignedUrl` par `getBase64FromStorage` (download + base64)
- Ajouté la récupération complète des garants avec leurs documents
- Supprimé le filtre `expectedTypes` pour locataire et garants
- Le PDF validé contient maintenant les images réelles ET les sections garants

---

## Points à tester manuellement

- [ ] Uploader 5 documents de catégories différentes → tous doivent apparaître dans le PDF
- [ ] Changer de situation_pro → les documents de l'ancien statut doivent rester dans le PDF
- [ ] Ajouter un garant avec 3 documents → section garant présente dans Prévisualiser ET Valider
- [ ] Modifier des infos profil → Prévisualiser doit refléter les nouvelles infos immédiatement
- [ ] Valider le dossier → PDF téléchargeable doit contenir les vraies images de documents

## Anomalies détectées mais non corrigées

- Route `/api/generate-dossier` (ancienne, `pdf-lib`) : doublon à supprimer
- `DossierPreview` compte `totalPages` sans les pages garants (page démo uniquement)
- `DocEntry` interface n'inclut pas `garant_id` (n'affecte pas la génération PDF)
