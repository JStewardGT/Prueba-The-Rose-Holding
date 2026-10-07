# Tasks: Legal Records Portal & Process Tracking

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

## Phase 7: User Story 5 - Seguimiento Procesal, Cronología y Novedades por Caso (Priority: P2) 🚀 NUEVA FASE

**Goal**: Allow users to click on any case card in the dashboard to open a dedicated case detail page with its procedural context, timeline of novedades (milestones), a centered creation modal for novedades (title, date, description, response days), and secure deletion.

**Independent Test**: In dashboard, click any case card; verify navigation to `CaseDetailPage`; verify case summary header; open "Nueva Novedad" modal; enter date (e.g. 2026-10-05), title ("Demanda radicada"), description, and response days (e.g. 3); verify immediate creation in timeline; verify badge shows response time; delete novelty with confirmation; and return to dashboard with back button.

### Implementation for User Story 5

- [x] T029 [P] [US5] Create PostgreSQL database migration for `public.case_updates` with check constraints (`title`, `description`, `response_days >= 0`), strict RLS policies (`auth.uid() = user_id`), indexes, and realtime publication in `./supabase/migrations/20261007_create_case_updates.sql`.
- [x] T030 [P] [US5] Add deadline helper formatting and urgent badge styling for `response_days` in `./src/lib/utils.js`.
- [x] T031 [US5] Create centered modal dialog component `CreateUpdateModal` with form fields (Título, Fecha del Suceso, Descripción, Días para responder) and Supabase insertion handler (`case_id`, `auth.uid() = user_id`) in `./src/components/CreateUpdateModal.jsx`.
- [x] T032 [P] [US5] Make `RecordCard` clickable to navigate to case detail while keeping the delete button independent and stopPropagation-isolated in `./src/components/RecordCard.jsx`.
- [x] T033 [US5] Implement dedicated view `CaseDetailPage` displaying case header, back button, timeline of novedades in chronological order, response days badges, Realtime channel subscription (`public:case_updates`), and delete confirmation in `./src/pages/CaseDetailPage.jsx`.
- [x] T034 [US5] Update application routing and state in `./src/App.jsx` to support navigation to `case-detail` with selected case context and return to `dashboard`.

**Checkpoint**: User Story 5 is fully functional with complete case chronological tracking, deadline badges, and RLS isolation.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, build verification, responsive design checks, and end-to-end validation.

- [x] T025 Run end-to-end validation test scenarios according to `./specs/001-legal-records-portal/quickstart.md`.
- [x] T026 [P] Verify responsive layout across mobile and desktop breakpoints in `./src/pages/LandingPage.jsx` and `./src/pages/DashboardPage.jsx`.
- [x] T027 Execute production build verification via `npm run build` and resolve any bundling or syntax issues.
- [x] T028 Update project documentation and setup instructions in `./README.md`.
- [x] T035 Apply database migration `20261007_create_case_updates.sql` via `supabase db push` to remote Supabase project.
- [x] T036 Execute production build verification via `npm run build` and test responsive layout on `CaseDetailPage.jsx`.

---

## Phase 9: Form Field Validation & Input Restrictions (Priority: P2) 🚀 NUEVA FASE

**Goal**: Implement strict input filtering, calendar date constraints, and semantic range validations in `CreateUpdateModal` to prevent typing non-digit characters (`-`, `+`, `e`, `E`, `.`), enforce `response_days > 0` when specified, and restrict `event_date <= today`.

**Independent Test**: Open "Nueva Novedad" modal; attempt to type `-`, `+`, `e`, `.` in "Días para responder" (verify characters are blocked and rejected); attempt to enter `0` days and submit (verify rejection with message "Los días para responder deben ser mayores a 0 días"); check calendar picker for "Fecha del suceso" (verify dates after today are disabled via `max={today}`); and attempt manual submission with future date (verify rejection with message "La fecha del suceso no puede ser futura").

### Implementation for User Story 5 Refinements

- [x] T037 [US5] Implement strict numeric keystroke interception (blocking '-', '+', 'e', 'E', '.', ',') onKeyDown and regex digit sanitization onChange in `response_days` input in `./src/components/CreateUpdateModal.jsx`.
- [x] T038 [US5] Implement `max={today}` calendar constraint and future date rejection validation for `event_date` in `./src/components/CreateUpdateModal.jsx`.
- [x] T039 [US5] Implement pre-submission range validation enforcing `response_days > 0` when provided, displaying Spanish error message "Los días para responder deben ser mayores a 0 días" in `./src/components/CreateUpdateModal.jsx`.
- [x] T040 [P] [US5] Add date formatting and validation helper functions in `./src/lib/utils.js`.
- [x] T041 Execute production build verification via `npm run build` and validate Scenario D in `./specs/001-legal-records-portal/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phases 1 - 6 (Completadas)
       │
       ▼
Phase 7: US5 - Seguimiento Procesal y Novedades (T029 - T034) [Completada]
       │
       ▼
Phase 8: Polish & Verificación Previa (T035 - T036) [Completada]
       │
       ▼
Phase 9: Validaciones Estrictas de Formulario (T037 - T041) [En curso]
```

### Parallel Opportunities for User Story 5 Refinements

- T040 (helpers en utils.js) y T037/T038/T039 en `CreateUpdateModal.jsx` pueden desarrollarse de forma conjunta.
- T041 valida la compilación y prueba el Escenario D de `quickstart.md`.
