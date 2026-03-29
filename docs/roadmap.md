# Drify — Roadmap & Tâches

Utilise ce fichier pour suivre l'avancement du projet.
Dans Claude Code, référence-le avec `@docs/roadmap.md`.

---

## 🔴 Priorité 1 — Pages manquantes essentielles

### Connexion & Inscription
- [ ] Créer `connexion.html` (formulaire email + mot de passe, lien "mot de passe oublié")
- [ ] Créer `inscription.html` (choix du profil : locataire ou propriétaire)

### Favoris
- [ ] Créer `favoris.html` (liste des biens sauvegardés)
- [ ] Ajouter le lien actif dans la navbar

---

## 🟠 Priorité 2 — Amélioration des pages existantes

### index.html (Accueil)
- [ ] Vérifier la cohérence mobile
- [ ] Améliorer la section hero
- [ ] Ajouter une section "Comment ça marche ?"

### recherche.html
- [ ] Améliorer les filtres (UX)
- [ ] Afficher les cartes de biens (données fictives)
- [ ] Ajouter une vue carte interactive (placeholder)
- [ ] Pagination ou "Charger plus"

### annonce.html
- [ ] Ajouter une galerie photos (avec navigation)
- [ ] Afficher le DPE visuellement (graphique couleurs)
- [ ] Améliorer la section propriétaire (score, avis)
- [ ] Rendre le bouton "Postuler" plus visible

### profil.html (Locataire)
- [ ] Améliorer l'affichage du score /100 (visuel)
- [ ] Améliorer la section "Mes candidatures"
- [ ] Ajouter l'espace de stockage documents locatifs

### dashboard.html (Propriétaire)
- [ ] Améliorer les statistiques (graphiques)
- [ ] Améliorer la gestion des candidatures reçues
- [ ] Ajouter la section quittances

### publier.html
- [ ] Vérifier et améliorer le formulaire complet
- [ ] Ajouter upload de photos
- [ ] Ajouter prévisualisation de l'annonce

### messages.html
- [ ] Améliorer l'interface de conversation
- [ ] Ajouter l'envoi de documents dans la messagerie

---

## 🟡 Priorité 3 — Pages institutionnelles

- [ ] Créer `a-propos.html`
- [ ] Créer `tarifs.html`
- [ ] Créer `contact.html`
- [ ] Créer `blog.html` (liste d'articles fictifs)
- [ ] Créer `cgu.html`
- [ ] Créer `mentions-legales.html`
- [ ] Créer `confidentialite.html`

---

## 🟢 Priorité 4 — Fonctionnalités avancées (futur)

- [ ] Intégration DossierFacile (API gouvernementale)
- [ ] Paiement de loyer en ligne (Stripe ou équivalent)
- [ ] Génération automatique de quittances (PDF)
- [ ] Génération de baux
- [ ] Alertes de recherche personnalisées
- [ ] Avis vérifiés mutuels
- [ ] IA : estimation de loyer / prix de vente
- [ ] Notifications en temps réel

---

## ✅ Déjà fait

- [x] index.html — Page d'accueil (v1)
- [x] recherche.html — Page de recherche (v1)
- [x] annonce.html — Page détail annonce (v1)
- [x] publier.html — Publication d'annonce (v1)
- [x] profil.html — Profil locataire (v1)
- [x] dashboard.html — Dashboard propriétaire (v1)
- [x] messages.html — Messagerie (v1)
- [x] Déploiement sur Vercel
