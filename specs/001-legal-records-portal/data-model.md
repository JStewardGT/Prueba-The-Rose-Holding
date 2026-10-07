# Data Model & Storage Design: Legal Records & Process Tracking

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-07

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

---

### Table: `public.case_updates` (New)

Represents individual process milestones, judicial responses, or chronological updates for a specific legal case.

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY` | `gen_random_uuid()` | Unique identifier for the update |
| `case_id` | `uuid` | `NOT NULL`, `REFERENCES public.legal_records(id) ON DELETE CASCADE` | None | Reference to parent case |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | `auth.uid()` | Record owner (RLS verification) |
| `title` | `text` | `NOT NULL`, `CHECK (char_length(trim(title)) > 0)` | None | Title/milestone of the update |
| `event_date` | `date` | `NOT NULL`, `CHECK (event_date <= CURRENT_DATE)` | `CURRENT_DATE` | Date when the milestone occurred (max today) |
| `description` | `text` | `NOT NULL`, `CHECK (char_length(trim(description)) > 0)` | None | Detailed context and notes |
| `response_days` | `integer` | `CHECK (response_days IS NULL OR response_days > 0)` | `NULL` | Optional days allowed to respond (strictly > 0) |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Creation timestamp |

### Indexes

```sql
-- Indexes on legal_records
create index if not exists idx_legal_records_user_id on public.legal_records (user_id);
create index if not exists idx_legal_records_user_category on public.legal_records (user_id, category);
create index if not exists idx_legal_records_user_created on public.legal_records (user_id, created_at desc);

-- Indexes on case_updates
create index if not exists idx_case_updates_case_id on public.case_updates (case_id);
create index if not exists idx_case_updates_user_id on public.case_updates (user_id);
create index if not exists idx_case_updates_event_date on public.case_updates (case_id, event_date desc);
```

## 2. Row Level Security (RLS) Policies

Both tables strictly enforce RLS (Constitution Principle I).

```sql
-- RLS on case_updates
alter table public.case_updates enable row level security;

create policy "Users can select own case updates"
  on public.case_updates for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own case updates"
  on public.case_updates for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own case updates"
  on public.case_updates for delete
  to authenticated
  using (auth.uid() = user_id);

-- Publication for Realtime
alter publication supabase_realtime add table public.case_updates;
```

## 3. Entity Relationships & State Transitions

```
[ Usuario (auth.users) ]
      │
      ├─────── 1:N ────────► [ Legal Record (public.legal_records) ]
      │                                    │
      │                                    └─────── 1:N ────────► [ Case Update (public.case_updates) ]
      │                                                                  │
      └─────────────────────────────────── 1:N ──────────────────────────┘
```

## 4. Frontend Data Types & Interfaces

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

export interface CaseUpdate {
  id: string;
  case_id: string;
  user_id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  description: string;
  response_days: number | null;
  created_at: string;
}

export interface NewCaseUpdateInput {
  case_id: string;
  title: string;
  event_date: string;
  description: string;
  response_days?: number | null;
}
```
