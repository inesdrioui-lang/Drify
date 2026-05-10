-- Migration 003 : ajout type_garant, nationalite, type_revenus sur la table garants
-- À exécuter dans Supabase > SQL Editor

alter table public.garants
  add column if not exists type_garant text not null default 'physique'
    check (type_garant in ('physique', 'organisme')),
  add column if not exists nationalite text,
  add column if not exists type_revenus text;
