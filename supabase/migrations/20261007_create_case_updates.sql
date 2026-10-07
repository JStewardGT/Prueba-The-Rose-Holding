-- Migración: Tabla case_updates con Row Level Security (RLS) Estricto
-- Proyecto: PruebaTheRoseHolding (Seguimiento Procesal y Novedades por Caso)

create table if not exists public.case_updates (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.legal_records(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null check (char_length(trim(title)) > 0),
  event_date date not null default current_date,
  description text not null check (char_length(trim(description)) > 0),
  response_days integer check (response_days is null or response_days >= 0),
  created_at timestamptz default now() not null
);

-- Índices de consulta y rendimiento
create index if not exists idx_case_updates_case_id on public.case_updates (case_id);
create index if not exists idx_case_updates_user_id on public.case_updates (user_id);
create index if not exists idx_case_updates_event_date on public.case_updates (case_id, event_date desc);

-- 1. Habilitar Row Level Security (Principio I de la Constitución)
alter table public.case_updates enable row level security;

-- 2. Políticas de Seguridad Declarativas
drop policy if exists "Users can select own case updates" on public.case_updates;
create policy "Users can select own case updates"
  on public.case_updates for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own case updates" on public.case_updates;
create policy "Users can insert own case updates"
  on public.case_updates for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own case updates" on public.case_updates;
create policy "Users can delete own case updates"
  on public.case_updates for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Habilitar publicación para Supabase Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'case_updates'
  ) then
    alter publication supabase_realtime add table public.case_updates;
  end if;
end $$;
