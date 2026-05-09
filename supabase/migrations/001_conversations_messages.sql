-- ============================================================
-- Drify — Messagerie : tables conversations + messages
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- ============================================================

-- Supprimer les tables existantes si elles sont vides / en développement
drop table if exists messages cascade;
drop table if exists conversations cascade;

-- ── Table conversations ─────────────────────────────────────
-- Une conversation est initiée par un locataire vers un propriétaire
-- pour un bien donné. landlord_id est null pour l'instant (MVP).
create table conversations (
  id                    uuid        primary key default gen_random_uuid(),
  tenant_id             uuid        references auth.users(id) on delete cascade not null,
  other_user_name       text        not null default 'Propriétaire',
  other_user_initials   text        not null default 'P',
  property_title        text,
  property_info         text,
  last_message_preview  text,
  last_message_at       timestamptz default now(),
  created_at            timestamptz default now()
);

-- RLS conversations : le locataire voit et gère ses propres conversations
alter table conversations enable row level security;

create policy "tenant_own" on conversations
  for all
  using     (auth.uid() = tenant_id)
  with check(auth.uid() = tenant_id);

-- ── Table messages ──────────────────────────────────────────
create table messages (
  id               uuid        primary key default gen_random_uuid(),
  conversation_id  uuid        references conversations(id) on delete cascade not null,
  sender_id        uuid        references auth.users(id) not null,
  content          text        not null,
  created_at       timestamptz default now()
);

-- RLS messages : accessible uniquement via les conversations du locataire
alter table messages enable row level security;

create policy "conversation_participant" on messages
  for all
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and c.tenant_id = auth.uid()
    )
  )
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and c.tenant_id = auth.uid()
    )
  );

-- ── Realtime ────────────────────────────────────────────────
-- Permet les abonnements temps réel sur les nouveaux messages
alter publication supabase_realtime add table messages;
