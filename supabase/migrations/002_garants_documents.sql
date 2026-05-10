-- Migration 002 : table garants + colonne garant_id sur documents
-- À exécuter dans Supabase > SQL Editor

-- ============================================================
-- TABLE : garants
-- ============================================================
create table if not exists public.garants (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  prenom           text not null,
  nom              text not null,
  email            text,
  telephone        text,
  date_naissance   date,
  adresse          text,
  lien             text not null default 'parent',
  situation_pro    text not null default 'salarie_cdi',
  revenus_mensuels numeric not null default 0,
  ordre            smallint not null check (ordre in (1, 2)),
  created_at       timestamptz not null default now()
);

-- Index pour les requêtes par user_id
create index if not exists garants_user_id_idx on public.garants(user_id);

-- RLS obligatoire
alter table public.garants enable row level security;

-- Politique : chaque locataire gère ses propres garants uniquement
create policy "Locataires gèrent leurs propres garants"
  on public.garants
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLE : documents — ajout colonne garant_id (si table existe)
-- ============================================================
alter table public.documents
  add column if not exists garant_id uuid references public.garants(id) on delete set null;

-- ============================================================
-- TABLE : documents — création complète (si elle n'existe pas)
-- ============================================================
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  garant_id     uuid references public.garants(id) on delete set null,
  nom           text not null,
  categorie     text not null,
  fichier_path  text not null,
  taille_bytes  bigint not null default 0,
  statut        text not null default 'en_attente'
                  check (statut in ('en_attente', 'valide', 'refuse')),
  created_at    timestamptz not null default now()
);

create index if not exists documents_user_id_idx  on public.documents(user_id);
create index if not exists documents_garant_id_idx on public.documents(garant_id);

alter table public.documents enable row level security;

create policy "Locataires gèrent leurs propres documents"
  on public.documents
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
