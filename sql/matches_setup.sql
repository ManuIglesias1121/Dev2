-- ============================================================
-- TherianMatchConnect — Sistema de Matches Mutuos (tipo Tinder)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 0. LIMPIAR versiones previas incompletas (seguro: tablas nuevas, sin datos reales)
drop table if exists public.matches cascade;
drop table if exists public.likes cascade;
drop function if exists public.handle_new_like() cascade;

-- 1. TABLA likes: cada vez que un usuario le da like a otro
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid not null references public.profiles(id) on delete cascade,
  liked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (liker_id, liked_id),
  check (liker_id <> liked_id)
);

create index if not exists likes_liker_idx on public.likes(liker_id);
create index if not exists likes_liked_idx on public.likes(liked_id);

-- 2. TABLA matches: se crea cuando hay like mutuo
-- user_a_id < user_b_id siempre (orden alfabético) para evitar duplicados
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a_id, user_b_id),
  check (user_a_id < user_b_id)
);

create index if not exists matches_user_a_idx on public.matches(user_a_id);
create index if not exists matches_user_b_idx on public.matches(user_b_id);

-- 3. TRIGGER: cuando se inserta un like, si existe el like recíproco crea un match
create or replace function public.handle_new_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reciprocal_exists boolean;
  ua uuid;
  ub uuid;
begin
  select exists(
    select 1 from public.likes
    where liker_id = new.liked_id and liked_id = new.liker_id
  ) into reciprocal_exists;

  if reciprocal_exists then
    if new.liker_id < new.liked_id then
      ua := new.liker_id;
      ub := new.liked_id;
    else
      ua := new.liked_id;
      ub := new.liker_id;
    end if;

    insert into public.matches (user_a_id, user_b_id)
    values (ua, ub)
    on conflict (user_a_id, user_b_id) do nothing;
  end if;

  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists on_like_check_match on public.likes;
create trigger on_like_check_match
  after insert on public.likes
  for each row
  execute function public.handle_new_like();

-- 4. RLS likes
alter table public.likes enable row level security;

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert
  with check (auth.uid() = liker_id);

drop policy if exists "likes_select_own" on public.likes;
create policy "likes_select_own" on public.likes
  for select
  using (auth.uid() = liker_id or auth.uid() = liked_id);

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete
  using (auth.uid() = liker_id);

-- 5. RLS matches
alter table public.matches enable row level security;

drop policy if exists "matches_select_own" on public.matches;
create policy "matches_select_own" on public.matches
  for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "matches_delete_own" on public.matches;
create policy "matches_delete_own" on public.matches
  for delete
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- 6. Realtime
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.likes;
