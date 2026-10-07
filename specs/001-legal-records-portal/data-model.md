# Data Model & Storage Design: Legal Records Portal

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-06

## 1. Database Schema (PostgreSQL on Supabase)

### Table: `public.legal_records`

Represents an individual legal case/file managed by an authenticated legal practitioner.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY` | `gen_random_uuid()` | Unique identifier for the legal record |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | `auth.uid()` | Owner of the record (strictly enforced via Supabase Auth) |
| `case_title` | `text` | `NOT NULL`, `CHECK (char_length(trim(case_title)) > 0)` | None | Case title or legal subject |
| `client_name` | `text` | `NOT NULL`, `CHECK (char_length(trim(client_name)) > 0)` | None | Client / Represented entity name |
| `category` | `text` | `NOT NULL`, `CHECK (category IN ('Corporativo', 'Litigio', 'Laboral'))` | None | Strict legal categorization |
| `notes` | `text` | `NULLABLE` | `''` | Summary, procedural notes, or case comments |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Timestamp of record creation |

### Indexes

```sql
-- Index on user_id to optimize RLS evaluation and user-scoped list queries
create index idx_legal_records_user_id on public.legal_records (user_id);

-- Composite index on user_id and category for rapid category filtering
create index idx_legal_records_user_category on public.legal_records (user_id, category);

-- Composite index on user_id and created_at for reverse chronological ordering
create index idx_legal_records_user_created on public.legal_records (user_id, created_at desc);
```

## 2. Row Level Security (RLS) Policies

RLS is strictly mandatory (Core Principle I).

```sql
-- 1. Enable RLS
alter table public.legal_records enable row level security;

-- 2. Select policy: authenticated user can only read their own records
create policy "Users can select own records"
  on public.legal_records for select
  to authenticated
  using (auth.uid() = user_id);

-- 3. Insert policy: authenticated user can only insert records with their own user_id
create policy "Users can insert own records"
  on public.legal_records for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Delete policy: authenticated user can only delete their own records
create policy "Users can delete own records"
  on public.legal_records for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Enable Realtime for legal_records table
alter publication supabase_realtime add table public.legal_records;
```

## 3. Entity State Transitions & Lifecycle

```
[ Formulario Modal ]
        │
        ▼ (Validación cliente: case_title != '', client_name != '', category válida)
[ Inserción Supabase ]
        │
        ├─► [ RLS Check: auth.uid() == user_id ]
        │         │
        │         ├─► [ Rechazo / Error: RLS Violation o DB Constraint ]
        │         │
        │         └─► [ Éxito: Registro persistido en PostgreSQL ]
        │                   │
        │                   ├─► Evento Supabase Realtime (INSERT)
        │                   └─► Actualización estado React
        │
[ Dashboard List ] ───► [ Filtro en memoria: 'Todas' | 'Corporativo' | 'Litigio' | 'Laboral' ]
        │
        ▼ (Acción de Eliminar con Confirmación)
[ Eliminación Supabase ]
        │
        ├─► [ RLS Check: auth.uid() == user_id ]
        │         │
        │         └─► [ Éxito: Registro eliminado ]
        │                   │
        │                   ├─► Evento Supabase Realtime (DELETE)
        │                   └─► Actualización estado React
        ▼
[ Registro Removido ]
```

## 4. Frontend Data Contracts & Types

```typescript
export type LegalCategory = 'Corporativo' | 'Litigio' | 'Laboral';

export interface LegalRecord {
  id: string;
  user_id: string;
  case_title: string;
  client_name: string;
  category: LegalCategory;
  notes: string;
  created_at: string;
}

export interface NewLegalRecordInput {
  case_title: string;
  client_name: string;
  category: LegalCategory;
  notes?: string;
}
```
