-- ============================================================
-- IMPARO A LEGGERE — schema Supabase (OPZIONALE)
-- ------------------------------------------------------------
-- ATTENZIONE: la sincronizzazione online NON è attiva di default.
-- Questo file è pronto per chi vuole attivarla; istruzioni complete
-- nel README.md, sezione "Sincronizzazione online (Supabase)".
-- Fino all'attivazione l'app funziona interamente in locale.
-- ============================================================

-- Ogni famiglia ha un utente genitore (autenticazione Supabase Auth).
-- I profili figli non hanno credenziali: accede solo il genitore.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 14),
  avatar text not null default '🐻',
  created_at timestamptz not null default now()
);

create table if not exists public.child_settings (
  child_id uuid primary key references public.children (id) on delete cascade,
  -- Percorso didattico personalizzato per ogni bambino
  enabled_vowels text[] not null default '{A,E,I,O,U}',
  enabled_consonants text[] not null default '{}',
  studied_syllables jsonb not null default '{}',   -- { "P": ["PA","PE"], ... }
  studied_flags jsonb not null default '{}',       -- { "doppie": true, ... }
  word_type text not null default 'mixed' check (word_type in ('real','invented','mixed')),
  lengths integer[] not null default '{2,3,4,5,6}',
  categories jsonb not null default '{"letters":true,"syllables":true,"words":true}',
  level integer not null default 3 check (level between 1 and 6),
  daily_goal integer not null default 10
);

create table if not exists public.activity (
  id bigserial primary key,
  child_id uuid not null references public.children (id) on delete cascade,
  day date not null default current_date,
  exercise_text text not null,          -- es. "PA", "MAMMA"
  exercise_kind text not null,          -- letter|syllable|word|match
  is_invented boolean not null default false,
  correct boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_child_day_idx on public.activity (child_id, day);

create table if not exists public.child_stats (
  child_id uuid primary key references public.children (id) on delete cascade,
  stars integer not null default 0,
  correct integer not null default 0,
  retried integer not null default 0,
  total integer not null default 0,
  stickers text[] not null default '{}',
  by_letter jsonb not null default '{}',
  by_date jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------- Row Level Security: ogni famiglia vede SOLO i suoi dati ----------
alter table public.children enable row level security;
alter table public.child_settings enable row level security;
alter table public.activity enable row level security;
alter table public.child_stats enable row level security;

create policy "genitore gestisce i propri figli"
  on public.children for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

create policy "impostazioni del proprio figlio"
  on public.child_settings for all
  using (exists (
    select 1 from public.children c
    where c.id = child_settings.child_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.children c
    where c.id = child_settings.child_id and c.parent_id = auth.uid()
  ));

create policy "attività del proprio figlio"
  on public.activity for all
  using (exists (
    select 1 from public.children c
    where c.id = activity.child_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.children c
    where c.id = activity.child_id and c.parent_id = auth.uid()
  ));

create policy "statistiche del proprio figlio"
  on public.child_stats for all
  using (exists (
    select 1 from public.children c
    where c.id = child_stats.child_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.children c
    where c.id = child_stats.child_id and c.parent_id = auth.uid()
  ));

-- Note GDPR:
-- - vengono memorizzati solo nome (max 14 caratteri) e progressi di lettura;
-- - nessun dato di contatto dei minori, nessuna foto, nessun tracciamento;
-- - l'eliminazione del profilo cancella a cascata tutti i dati del bambino.
