-- ============================================================
-- TherianMatchConnect — Sistema legal: verificación de edad +
-- log de consentimientos versionados (Ley 25.326, GDPR Art. 7)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Columnas legales en profiles
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists age_verified_at timestamptz,
  add column if not exists age_verification_method text
    check (age_verification_method in ('self_declared', 'id_document', 'face_match', null)),
  add column if not exists terms_version_accepted text,
  add column if not exists privacy_version_accepted text,
  add column if not exists community_version_accepted text,
  add column if not exists deletion_requested_at timestamptz;

-- check de mayoría de edad a nivel DB (defensa adicional al check del cliente)
do $$
begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'profiles_birth_date_adult_check'
  ) then
    alter table public.profiles
      add constraint profiles_birth_date_adult_check
      check (
        birth_date is null
        or birth_date <= (current_date - interval '18 years')::date
      );
  end if;
end$$;

-- 2. consent_log: registro inmutable de cada aceptación
create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- versiones aceptadas (snapshot en el momento del consentimiento)
  terms_version text not null,
  privacy_version text not null,
  community_version text not null,
  -- consentimientos opcionales (GDPR Art. 7 los exige separados)
  analytics_consent boolean not null default false,
  marketing_consent boolean not null default false,
  -- contexto de la aceptación (probatorio en juicio)
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  app_version text,
  platform text,
  -- método: 'signup', 'reaccept_after_version_change', 'reaccept_voluntary'
  acceptance_context text not null default 'signup'
);

create index if not exists consent_log_user_idx on public.consent_log(user_id, accepted_at desc);

-- 3. RLS consent_log
alter table public.consent_log enable row level security;

drop policy if exists "consent_insert_own" on public.consent_log;
create policy "consent_insert_own" on public.consent_log
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "consent_select_own" on public.consent_log;
create policy "consent_select_own" on public.consent_log
  for select
  using (auth.uid() = user_id);

-- inmutable: nadie puede modificar ni borrar un consentimiento registrado
-- (no creamos policy de UPDATE/DELETE)

-- 4. helper: ¿el usuario aceptó las versiones vigentes?
create or replace function public.has_accepted_current_legal(
  p_user_id uuid,
  p_terms_version text,
  p_privacy_version text,
  p_community_version text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.consent_log
    where user_id = p_user_id
      and terms_version = p_terms_version
      and privacy_version = p_privacy_version
      and community_version = p_community_version
  );
end;
$$;
