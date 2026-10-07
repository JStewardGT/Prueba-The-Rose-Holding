# Research & Technical Decisions: Legal Records Portal & Public Landing Experience

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-06

## 1. Project Initialization & Frontend Tooling

- **Decision**: Initialize React with Vite (`vite@latest` with React template) and Tailwind CSS (`tailwindcss@^3.4`, `postcss`, `autoprefixer`).
- **Rationale**:
  - Vite delivers near-instant HMR and fast build times, perfectly suited for the 48-hour timeline.
  - Tailwind CSS provides utility-first rapid styling for corporate dark mode without overhead or external heavy UI libraries.
  - Matches Core Principle II and the Tech Stack in `.specify/memory/constitution.md`.
- **Alternatives Considered**:
  - Next.js: Unnecessary server runtime complexity; constitution explicitly mandates direct client BaaS consumption and no intermediate servers.
  - Create React App: Deprecated and sluggish build tooling.

## 2. 3D WebGL Hero Experience & Memory Lifecycle Management

- **Decision**: Three.js (`three`) directly managed via React's `useRef` and `useEffect` with explicit teardown.
- **Rationale**:
  - Direct Three.js avoids extra abstraction layers (like `@react-three/fiber` which adds dependency weight and potential React 19/18 version conflicts).
  - WebGL nodal polygon mesh: A dynamic 3D geometric network with vertices connecting lines and nodes that gently rotate and react to pointer movements (`mousemove`).
  - Strict lifecycle cleanup: In the cleanup callback of `useEffect`, explicitly invoke:
    1. `window.removeEventListener('resize', ...)` & `window.removeEventListener('mousemove', ...)`
    2. `cancelAnimationFrame(animationFrameId)`
    3. `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`
    4. Remove canvas element from DOM container.
- **Alternatives Considered**:
  - `@react-three/fiber`: Heavier bundle, unnecessary complexity for a single interactive hero component.
  - Pure CSS 3D: Insufficient visual fidelity for interactive nodal network mesh in dark mode.

## 3. Interactive Iconography: Morphicons / Animated SVG Icons

- **Decision**: Morphicons / Animated SVG Lucide iconography with interactive micro-animations on `:hover` (representing Security, Velocity, and Automation).
- **Rationale**:
  - `lucide-react` provides sleek corporate legal icons (ShieldCheck, Zap, Cog/Cpu) styled with Tailwind CSS transition classes (`group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`) and Morphicon SVG animations.
  - Lightweight, zero runtime overhead, 100% reliable across browsers.
- **Alternatives Considered**:
  - Heavy Lottie animations: High payload, external JSON files, potential performance bottleneck.

## 4. Supabase Client Integration & Realtime Architecture

- **Decision**: Use `@supabase/supabase-js` configured via single client instance in `/src/lib/supabase.js`. Realtime subscription via `supabase.channel('legal_records_changes').on('postgres_changes', ...)`.
- **Rationale**:
  - Satisfies Core Principle I (RLS) & Core Principle II (Direct BaaS consumption).
  - Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`.
  - Realtime subscription listens to `INSERT` and `DELETE` events for the active user (`filter: user_id=eq.${user.id}`), keeping multiple sessions/tabs synchronized while the local state is updated immediately for optimal perceived performance.
- **Alternatives Considered**:
  - Polling every N seconds: Inefficient, high latency, wastes quota.
  - Pure optimistic updates without Realtime: Fails multi-tab/device synchronization requirement.

## 5. Database Schema & RLS Policy Design (PostgreSQL)

- **Decision**: PostgreSQL table `public.legal_records` with strict RLS enabled:
  ```sql
  create table public.legal_records (
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
  ```
- **Rationale**:
  - Satisfies Core Principle I (Strict RLS) and Core Principle V (Structured categories).
  - Database check constraints enforce that `case_title` and `client_name` cannot be blank strings, complementing client-side validation.
  - `user_id default auth.uid()` guarantees that client tampering cannot assign records to other users.

## 6. Authentication Architecture & State Management

- **Decision**: React `AuthContext` (`/src/context/AuthContext.jsx`) wrapping the app tree.
  - Subscribes to `supabase.auth.onAuthStateChange((event, session) => ...)` to synchronize session.
  - Exposes `user`, `session`, `loading`, `signUp({ email, password })`, `signIn({ email, password })`, `signOut()`.
  - Private route guard (`ProtectedRoute.jsx`) redirects unauthenticated users to `/login` or opens the auth modal.
  - Non-technical error mapping: Translates errors such as `Invalid login credentials` to `"Credenciales incorrectas. Verifique su correo y contraseña."`.
