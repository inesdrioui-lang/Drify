# Drify — CLAUDE.md

Plateforme immobilière tout-en-un (site web, future app mobile).
Permet la recherche de biens, la gestion de dossiers locataires, la publication d'annonces,
la messagerie, les paiements de loyer, et intègre une IA pour certaines fonctionnalités.

---

## Stack technique

- **HTML / CSS / JavaScript vanilla** (pas de framework)
- **Déploiement** : Vercel — https://drify.vercel.app
- **Pas de backend ni de base de données pour l'instant** (tout est en statique / données fictives)
- **Pas de gestionnaire de paquets** (pas de npm/node)

---

## Structure des fichiers

```
/
├── index.html          → Page d'accueil
├── recherche.html      → Recherche de biens (location / vente)
├── annonce.html        → Page détail d'un bien
├── publier.html        → Publication d'annonce (propriétaire)
├── profil.html         → Profil locataire + dossier + candidatures
├── dashboard.html      → Tableau de bord propriétaire
├── messages.html       → Messagerie
├── style.css           → Feuille de style principale (à vérifier)
└── ...
```

---

## Design system & identité visuelle

- **Couleur principale** : Marron Foncé (#4A3222) Drify et Crème Très Clair pour le fond (#FBF5EB)(à confirmer avec le fichier CSS)
- **Police** : Sans-Serif et Display
- **Composants récurrents** : navbar, cards de biens, badges de statut, score /100, avatars initiales colorés
- **Style général** : propre, moderne, minimaliste, orienté confiance et clarté
- **Toujours** respecter le style visuel existant lors d'ajouts de pages ou composants

---

## Pages existantes — État actuel

| Page | Fichier | État |
|------|---------|------|
| Accueil | index.html | ✅ Faite — à améliorer |
| Recherche | recherche.html | ✅ Faite — à améliorer |
| Détail annonce | annonce.html | ✅ Faite — à améliorer |
| Publier annonce | publier.html | ✅ Faite — à améliorer |
| Profil locataire | profil.html | ✅ Faite — à améliorer |
| Dashboard proprio | dashboard.html | ✅ Faite — à améliorer |
| Messagerie | messages.html | ✅ Faite — à améliorer |
| Connexion | — | ❌ À créer |
| Inscription | — | ❌ À créer |
| Favoris | — | ❌ À créer |
| À propos | — | ❌ À créer |
| Tarifs | — | ❌ À créer |
| Blog | — | ❌ À créer |
| Contact | — | ❌ À créer |
| CGU / Mentions légales | — | ❌ À créer |

---

## Fonctionnalités prévues (roadmap globale)

### 🔍 Recherche & Annonces
- [ ] Recherche avancée avec filtres (type, budget, surface, pièces, meublé, DPE)
- [ ] Carte interactive des biens
- [ ] Alertes de recherche personnalisées
- [ ] Page détail annonce complète (galerie photos, DPE visuel, carte)
- [ ] Vente et location dans la recherche

### 👤 Profil & Dossier locataire
- [ ] Dossier Locataire (identité locative numérique et portable)
- [ ] Score de confiance /100 (basé sur documents, historique, avis)
- [ ] Upload de documents sur espace privé (pièce d'identité, bulletins de salaire, contrat, avis d'imposition...)
- [ ] Candidature aux annonces en envoyant le dossier 
- [ ] Suivi des candidatures (en cours, acceptée, refusée)

### 🏠 Espace propriétaire
- [ ] Publication d'annonces (formulaire complet)
- [ ] IA : aide à la rédaction d'annonce
- [ ] Dashboard propriétaire (biens, candidatures, loyers, statistiques)
- [ ] Gestion des candidatures reçues
- [ ] Profil propriétaire avec score de fiabilité et avis
- [ ] Génération de baux

### 💬 Communication
- [ ] Messagerie directe locataire ↔ propriétaire
- [ ] Notifications (candidatures, messages, loyers)

### 💳 Paiements
- [ ] Paiement de loyer en ligne sécurisé
- [ ] Quittances automatiques mensuelles
- [ ] Historique des paiements

### 🤖 IA intégrée
- [ ] (Fonctionnalités à définir — ex: estimation de loyer, aide à la rédaction d'annonce...)

### 📁 Documents locatifs
- [ ] Espace de sauvegarde des documents (contrats, quittances, courriers...)

### ⭐ Autres
- [ ] Favoris (biens sauvegardés)
- [ ] Avis vérifiés mutuels (locataire ↔ propriétaire après location) à voir comment mettre en place pour éviter les vices humains 
- [ ] Pages institutionnelles (À propos, Blog, Contact, Tarifs, CGU, Mentions légales)
- [ ] Planification de visites via un calendrier indiquant les créneaux disponibles définis par le propriétaire sur l'annonce. Le locataire pourra réserver un créneau en partageant son dossier au propriétaire.( à étudier et améliorer )

---

## Règles importantes — À toujours respecter

- **Ne jamais casser le design existant** lors d'ajouts ou modifications
- **Toujours garder la navbar et le footer** identiques sur toutes les pages
- **Données fictives** : tout le contenu (noms, biens, prix) est fictif pour l'instant — c'est normal
- **Pas de backend** : les formulaires et interactions sont visuels uniquement pour l'instant
- **Nommer les fichiers** en minuscules avec tirets (ex: `connexion.html`, `mentions-legales.html`)
- **Mobile-first** : toujours vérifier le rendu sur mobile
- **Accessibilité** : utiliser des balises sémantiques HTML (nav, main, section, article...)
- **Commentaires** : commenter les sections importantes du HTML/CSS pour s'y retrouver

---

## Ce que Claude NE doit PAS faire

- Ne pas introduire de framework (React, Vue...) sans demande explicite
- Ne pas ajouter de dépendances npm sans demande explicite
- Ne pas modifier la navbar ou le footer sans le dire explicitement
- Ne pas supprimer du contenu existant sans confirmation
- Ne pas créer de backend ou de base de données sans demande explicite

---

## Référence docs complémentaires

- `@docs/roadmap.md` → Détail des tâches à faire avec cases à cocher
- `@docs/design.md` → Charte graphique détaillée (à créer)
- `@docs/composants.md` → Inventaire des composants réutilisables (à créer)
