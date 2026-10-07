# Quickstart Validation Guide: Legal Records Portal

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-06

This guide details the step-by-step procedure to run, verify, and validate the application end-to-end.

## 1. Prerequisites

- Node.js >= 18 (Current environment: `v24.5.0`)
- Supabase Project or Local Supabase Instance (CLI version `2.120.0`)
- Environment variables configured in `.env`:
  ```bash
  VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-anon-key>
  ```

## 2. Database Setup

Execute the schema migration in the Supabase SQL Editor:

```sql
create table if not exists public.legal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  case_title text not null check (char_length(trim(case_title)) > 0),
  client_name text not null check (char_length(trim(client_name)) > 0),
  category text not null check (category in ('Corporativo', 'Litigio', 'Laboral')),
  notes text default '',
  created_at timestamptz default now() not null
);

alter table public.legal_records enable row level security;

create policy "Users can select own records"
  on public.legal_records for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on public.legal_records for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own records"
  on public.legal_records for delete
  to authenticated
  using (auth.uid() = user_id);

alter publication supabase_realtime add table public.legal_records;
```

## 3. Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 4. End-to-End Validation Scenarios

### Scenario A: Public Landing Page & 3D WebGL Inspection
1. Open browser at `http://localhost:5173`.
2. Verify dark corporate theme, hero text, and the interactive 3D WebGL canvas.
3. Move cursor across the hero area: the nodal polygonal mesh gently reorients.
4. Hover over feature cards with Morphicons/Lucide icons: verify smooth animated hover transition.
5. Resize window: verify canvas automatically adapts to aspect ratio without distortion.

### Scenario B: User Registration & Direct Session Access
1. Click on "Iniciar Sesión" or "Registrarse" CTA button.
2. In the modal, switch to "Registrarse".
3. Enter valid email (`test@roseholding.com`) and password (`Password123!`).
4. Submit: verify immediate authentication and redirect to `/dashboard` without manual email confirmation delay.

### Scenario C: Create Legal Record (Modal Workflow)
1. In `/dashboard`, click the "Nuevo Expediente" button.
2. Verify the modal dialog opens centered with background dimmed.
3. Try submitting with empty fields: verify visual error notification in Spanish.
4. Fill in:
   - Título del Caso: `Auditoría Regulatoria y Compliance 2026`
   - Nombre del Cliente: `Banco Continental`
   - Categoría: `Corporativo`
   - Notas: `Revisión preliminar de normativas de solvencia y protección de datos.`
5. Click "Guardar Expediente": verify modal closes and the new record appears immediately in the dashboard list.

### Scenario D: Realtime Synchronization & Category Filtering
1. Open a second browser window/tab logged in with the same user credentials.
2. In window 1, create a record with category `Laboral`.
3. In window 2, verify that the new `Laboral` record appears in real-time without refreshing.
4. Click on category filter pills (`Corporativo`, `Laboral`, `Litigio`, `Todas`): verify instantaneous filtering of the list.

### Scenario E: Secure Deletion & Multitenant RLS Verification
1. Click the "Eliminar" icon on a record.
2. Verify confirmation dialog appears asking to confirm deletion.
3. Confirm: record is deleted and removed from the list.
4. Log in as a different user (`other@roseholding.com`): verify that none of the records belonging to `test@roseholding.com` are visible.
