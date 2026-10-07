# Quickstart Validation Guide: Legal Records & Process Tracking

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-07

## 1. Prerequisites & Environment

- Environment configured in `.env`:
  ```bash
  VITE_SUPABASE_URL=https://coqsoipmvnzdjwqgxbyc.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  ```
- Dev server running:
  ```bash
  npm run dev
  ```

## 2. Database Migration Setup (Case Updates)

Apply migration in Supabase SQL editor or CLI:

```sql
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

create index if not exists idx_case_updates_case_id on public.case_updates (case_id);
create index if not exists idx_case_updates_user_id on public.case_updates (user_id);
create index if not exists idx_case_updates_event_date on public.case_updates (case_id, event_date desc);

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

alter publication supabase_realtime add table public.case_updates;
```

---

## 3. End-to-End Validation Scenarios

### Scenario A: Open Case Detail from Dashboard
1. Log into `/dashboard`.
2. Click on a case card (e.g., "Demanda Laboral").
3. Verify navigation to the dedicated case view with case title, client name, and category badge visible in the header.
4. Verify a "Volver al Dashboard" button returns cleanly to the main list.

### Scenario B: Add Case Update (Novedad Procesal)
1. In the case detail view, click "Nueva Novedad".
2. In the modal, fill in:
   - Título: `Respuesta de la Rama Judicial recibida`
   - Fecha del Suceso: `2026-10-05`
   - Descripción: `El juzgado emitió auto de admisión. Se corre traslado.`
   - Días para responder: `3`
3. Click "Guardar Novedad": verify modal closes and the timeline updates immediately.
4. Verify visual badge highlights "3 días para responder" prominently.

### Scenario C: Delete Case Update with Confirmation
1. In the timeline, click the trash icon on an update.
2. Verify confirmation dialog appears.
3. Confirm: verify the update is removed from the timeline.

### Scenario D: Form Input Restrictions & Validation Checks (New)
1. Open "Nueva Novedad" modal.
2. In the "Días para responder" input, try typing `-`, `+`, `e`, `E`, `.`:
   - Verify keystrokes are blocked and no characters appear.
3. Enter `0` in "Días para responder" and attempt to submit:
   - Verify form stops and displays inline error *"Los días para responder deben ser mayores a 0 días"*.
4. In "Fecha del suceso", check the calendar:
   - Verify future dates are disabled/not selectable (`max={today}`).
5. If a future date is manually forced, attempt to submit:
   - Verify form stops and displays inline error *"La fecha del suceso no puede ser futura"*.
