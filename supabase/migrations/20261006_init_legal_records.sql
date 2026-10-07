-- Migración: Tabla legal_records con Row Level Security (RLS) Estricto
-- Proyecto: PruebaTheRoseHolding

create table if not exists public.legal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  case_title text not null check (char_length(trim(case_title)) > 0),
  client_name text not null check (char_length(trim(client_name)) > 0),
  category text not null check (category in ('Corporativo', 'Litigio', 'Laboral')),
  notes text default '',
  created_at timestamptz default now() not null
);

-- Índices de consulta y rendimiento
create index if not exists idx_legal_records_user_id on public.legal_records (user_id);
create index if not exists idx_legal_records_user_category on public.legal_records (user_id, category);
create index if not exists idx_legal_records_user_created on public.legal_records (user_id, created_at desc);

-- 1. Habilitar Row Level Security (Principio I de la Constitución)
alter table public.legal_records enable row level security;

-- 2. Políticas de Seguridad Declarativas
drop policy if exists "Users can select own records" on public.legal_records;
create policy "Users can select own records"
  on public.legal_records for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own records" on public.legal_records;
create policy "Users can insert own records"
  on public.legal_records for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own records" on public.legal_records;
create policy "Users can delete own records"
  on public.legal_records for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Habilitar publicación para Supabase Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'legal_records'
  ) then
    alter publication supabase_realtime add table public.legal_records;
  end if;
end $$;
