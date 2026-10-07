# Tasks: Legal Records Portal & Public Landing Experience

**Feature**: `001-legal-records-portal` | **Branch**: `001-legal-records-portal`
**Input Documents**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [research.md](./research.md), [contracts/supabase-api.md](./contracts/supabase-api.md), [quickstart.md](./quickstart.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build configuration, Tailwind styling and Supabase client setup.

- [x] T001 Initialize React project with Vite in `./package.json` and `./vite.config.js` with ES6+ JSX support.
- [x] T002 Install core runtime and dev dependencies: `three`, `@supabase/supabase-js`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer` in `./package.json`.
- [x] T003 [P] Configure Tailwind CSS with corporate dark theme colors and PostCSS in `./tailwind.config.js` and `./postcss.config.js`.
- [x] T004 [P] Create HTML template and root entry point in `./index.html` and `./src/main.jsx`.
- [x] T005 [P] Setup global dark mode styling and base CSS utility layers in `./src/index.css`.
- [x] T006 [P] Create environment templates and client variables in `./.env.example` and `./.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core client initialization, database migration schema with strict RLS, error translation utilities, and authentication state context.

**⚠️ CRITICAL**: Must complete before any user story can be executed.

- [x] T007 Initialize and export Supabase client with environment variables in `./src/lib/supabase.js`.
- [x] T008 [P] Implement error translation and formatting utilities (Spanish messages for auth/DB errors) in `./src/lib/utils.js`.
- [x] T009 [P] Create database migration script with table `public.legal_records` (`case_title` non-blank, `client_name` non-blank, `category IN ('Corporativo', 'Litigio', 'Laboral')`), strict RLS policies (`auth.uid() = user_id`), indexes, and realtime publication in `./supabase/migrations/20261006_init_legal_records.sql`.
- [x] T010 Implement global `AuthContext` and custom hook `useAuth` managing session lifecycle (`onAuthStateChange`), login, signup (auto-confirmation), and logout in `./src/context/AuthContext.jsx`.
- [x] T011 [P] Implement route guard component `ProtectedRoute` checking session state and redirecting unauthenticated users to home in `./src/components/ProtectedRoute.jsx`.

**Checkpoint**: Core foundation ready - user stories can now be implemented.

---

## Phase 3: User Story 1 - Exploración Pública de Servicios y Propuesta Legal (Priority: P1) 🎯 MVP

**Goal**: Deliver a high-impact corporate dark mode landing page with an interactive 3D WebGL hero scene (Three.js with strict lifecycle cleanup) and animated Morphicon/Lucide feature cards.

**Independent Test**: Access the root URL (`/`) without an active session. Verify the 3D nodal polygon mesh renders, responds to mouse movement, feature cards animate on hover, CTA buttons trigger auth modal, and leaving or resizing the page cleans up WebGL resources without memory leaks.

### Implementation for User Story 1

- [x] T012 [P] [US1] Create navigation bar `Navbar` with brand logo, dark styling, and CTA buttons ("Iniciar Sesión" / "Dashboard") in `./src/components/Navbar.jsx`.
- [x] T013 [US1] Implement interactive 3D WebGL nodal polygonal network component `Hero3D` with Three.js, mouse pointer reactivity, and strict cleanup (`renderer.dispose()`, geometries, materials, event listeners) in `./src/components/Hero3D.jsx`.
- [x] T014 [P] [US1] Implement feature cards component `FeatureCards` with animated Morphicon/Lucide icons (Security, Velocity, Automation) and hover micro-animations in `./src/components/FeatureCards.jsx`.
- [x] T015 [US1] Assemble public landing page `LandingPage` combining `Navbar`, `Hero3D`, `FeatureCards`, and footer in `./src/pages/LandingPage.jsx`.

**Checkpoint**: User Story 1 (Landing Page MVP) is fully functional and visually interactive.

---

## Phase 4: User Story 2 - Autenticación Segura y Control de Acceso (Priority: P1)

**Goal**: Enable lawyers and users to register and sign in with email and password (with auto-confirmation) or sign out, showing friendly Spanish error feedback and protecting private dashboard routes.

**Independent Test**: Register a new account via the auth modal, confirm direct login into the dashboard, log out, attempt to navigate directly to `/dashboard` while logged out (verify redirect), and test invalid login credentials to confirm friendly error messages.

### Implementation for User Story 2

- [x] T016 [US2] Create authentication modal component `AuthModal` supporting tab switching between "Iniciar Sesión" and "Registrarse", form validation, and translated error alerts in `./src/components/AuthModal.jsx`.
- [x] T017 [US2] Wire `AuthModal` opening triggers into `Navbar` and hero CTA buttons within `./src/components/Navbar.jsx` and `./src/pages/LandingPage.jsx`.
- [x] T018 [US2] Configure main routing and state integration connecting `AuthContext`, `ProtectedRoute`, `LandingPage`, and `DashboardPage` in `./src/App.jsx`.

**Checkpoint**: User Stories 1 and 2 deliver complete landing page, modal authentication, and protected routing.

---

## Phase 5: User Story 3 - Creación y Clasificación Estructurada de Expedientes (Priority: P2)

**Goal**: Allow authenticated users to open a centered modal dialog to register new legal records with mandatory non-blank case title and client name, and restricted categorization (*Corporativo*, *Litigio*, *Laboral*).

**Independent Test**: From the dashboard, click "Nuevo Expediente", verify empty submission is blocked with validation warnings, submit a valid record, verify database insertion with `auth.uid() = user_id`, and verify the modal closes with the record added.

### Implementation for User Story 3

- [x] T019 [US3] Create centered modal dialog component `CreateRecordModal` with form fields: Título del Caso (required, non-blank), Nombre del Cliente (required, non-blank), Categoría (`Corporativo`, `Litigio`, `Laboral`), and Notas in `./src/components/CreateRecordModal.jsx`.
- [x] T020 [US3] Implement Supabase insert mutation handler attaching `auth.uid() = user_id`, client-side validations, and error handling in `./src/components/CreateRecordModal.jsx`.

**Checkpoint**: User Story 3 allows creating validated, strictly classified legal records linked to the authenticated user.

---

## Phase 6: User Story 4 - Consulta, Filtrado y Eliminación Segura en Tiempo Real (Priority: P2)

**Goal**: Display exclusively the user's own legal records in the private dashboard, provide quick category filtering, enable deletion with safety confirmation, and maintain multi-tab real-time synchronization via Supabase Realtime (`postgres_changes`).

**Independent Test**: Create records across different categories, test filtering pills (*Todas*, *Corporativo*, *Litigio*, *Laboral*), open two browser tabs to verify Realtime updates on insert/delete, delete a record with confirmation, and verify a second user cannot see nor delete the first user's records (RLS).

### Implementation for User Story 4

- [x] T021 [P] [US4] Create legal record card component `RecordCard` displaying case title, client name, category badge with distinct corporate color coding, formatted creation date, and notes in `./src/components/RecordCard.jsx`.
- [x] T022 [P] [US4] Create category filter component `CategoryFilter` with filter pills (*Todas*, *Corporativo*, *Litigio*, *Laboral*) in `./src/components/CategoryFilter.jsx`.
- [x] T023 [P] [US4] Create safety confirmation modal `DeleteConfirmModal` before deleting a case in `./src/components/DeleteConfirmModal.jsx`.
- [x] T024 [US4] Implement private dashboard page `DashboardPage` integrating record listing, category filtering, Supabase Realtime channel subscription (`postgres_changes` on `public:legal_records`), create modal trigger, and delete action in `./src/pages/DashboardPage.jsx`.

**Checkpoint**: All user stories functional with full CRUD, real-time sync, category filtering, and strict multitenant RLS isolation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, build verification, responsive design checks, and end-to-end validation.

- [x] T025 Run end-to-end validation test scenarios according to `./specs/001-legal-records-portal/quickstart.md`.
- [x] T026 [P] Verify responsive layout across mobile and desktop breakpoints in `./src/pages/LandingPage.jsx` and `./src/pages/DashboardPage.jsx`.
- [x] T027 Execute production build verification via `npm run build` and resolve any bundling or syntax issues.
- [x] T028 Update project documentation and setup instructions in `./README.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001-T006)
       │
       ▼
Phase 2: Foundational (T007-T011)  [CRITICAL GATE]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
Phase 3: US1 - Landing & 3D (T012-T015) Phase 4: US2 - Auth & Routes (T016-T018)
       │                                 │
       └────────────────┬────────────────┘
                        ▼
       Phase 5: US3 - Creación Expedientes (T019-T020)
                        │
                        ▼
       Phase 6: US4 - Listado, Filtros, Realtime & Borrado (T021-T024)
                        │
                        ▼
       Phase 7: Polish & Validation (T025-T028)
```

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006 can run in parallel.
- **Phase 2**: T008, T009, T011 can run in parallel once T007 is initialized.
- **Phase 3 & 4**: T012, T014 can be developed in parallel with T016.
- **Phase 6**: T021, T022, T023 can be built concurrently before integration into `DashboardPage` (T024).
- **Phase 7**: T026 can run in parallel with T028.

---

## Implementation Strategy

### MVP First (Phases 1, 2 & 3)
1. Complete Setup and Foundational infrastructure.
2. Complete User Story 1 (Landing Page + Three.js 3D Hero + Feature Cards).
3. Validate independent landing experience.

### Incremental Delivery
1. Add User Story 2 (AuthModal + Protected Routes + Session Context).
2. Add User Story 3 (Create Record Modal + Validations).
3. Add User Story 4 (Dashboard + Realtime Subscription + Category Filtering + Secure Deletion).
4. Run validation against `quickstart.md`.
