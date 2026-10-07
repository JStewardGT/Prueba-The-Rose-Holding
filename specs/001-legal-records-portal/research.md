# Research & Technical Decisions: Legal Records Portal & Process Tracking

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-07

## 1. Project Initialization & Frontend Tooling

- **Decision**: React with Vite (`vite@^6.2`, React 18) and Tailwind CSS (`tailwindcss@^3.4`, `postcss`, `autoprefixer`).
- **Rationale**: Vite delivers instant HMR and minimal bundle footprint. Corporate dark mode is implemented via clean Tailwind utility classes.
- **Alternatives Considered**: Next.js (unnecessary server runtime complexity; prohibited by Constitution Principle II).

## 2. 3D WebGL Hero Experience & Memory Lifecycle Management

- **Decision**: Three.js (`three`) managed directly via `useRef` and `useEffect` with comprehensive teardown.
- **Rationale**: Direct Three.js provides maximum performance for the interactive nodal mesh without additional abstraction libraries. Cleanup removes event listeners, cancels animation frames, disposes geometries, materials, and renderer context.
- **Alternatives Considered**: `@react-three/fiber` (unnecessary package overhead for a single hero canvas).

## 3. Interactive Iconography & Micro-Animations

- **Decision**: Lucide React + custom SVG Morphicons with animated transitions (e.g., `MorphiconEyeToggle` for password reveal/hide).
- **Rationale**: Zero external CSS or JSON runtime dependencies. Native SVG micro-interactions feel snappy and modern.

## 4. Supabase Client Integration & Realtime Architecture

- **Decision**: Direct client `@supabase/supabase-js` without intermediate APIs.
- **Channels**:
  - `public:legal_records` for case mutations (INSERT, UPDATE, DELETE).
  - `public:case_updates` for real-time process novedades (INSERT, UPDATE, DELETE).
- **Rationale**: Satisfies Constitution Principle I (RLS) & Principle II (Direct BaaS). Keeps multi-tab sessions in sync immediately.

## 5. Process Tracking & Case Updates Architecture (New)

- **Decision**: Table `public.case_updates` with foreign key to `public.legal_records(id)` ON DELETE CASCADE, and `user_id` referencing `auth.users(id)` with `default auth.uid()`.
- **Fields**:
  - `id`: UUID primary key.
  - `case_id`: UUID foreign key to `legal_records(id)`.
  - `user_id`: UUID foreign key to `auth.users(id)`.
  - `title`: String non-blank (e.g. "Demanda radicada en Rama Judicial").
  - `event_date`: Date (date of occurrence).
  - `description`: Text (full procedural context and notes).
  - `response_days`: Integer nullable (business or calendar days allowed to respond).
  - `created_at`: Timestamp.
- **UI Navigation**:
  - Clicking on any `RecordCard` navigates to `CaseDetailPage` passing the selected case (or loads by ID).
  - Chronological timeline displaying cards for each update.
  - Visual badges for response deadlines: shows days allowed and urgency indicators.
  - Dedicated modal `CreateUpdateModal` to register new novedades with immediate update in timeline.
  - Safe deletion modal for individual case updates.
- **Rationale**: Satisfies User Story 5 and user requirements for procedural tracking while preserving strict multitenant RLS.

## 6. Form Field Validation & Numeric Keystroke Interception (New)

- **Decision**: Multi-tier client-side validation combining active keystroke filtering (`onKeyDown`), value sanitization (`onChange`), declarative HTML5 constraints (`max={today}`), and pre-submission semantic checks with inline Spanish error messaging.
- **Implementation Strategy**:
  - **Numeric Fields (`response_days`)**:
    - `onKeyDown`: Intercept and `e.preventDefault()` for disallowed characters (`-`, `+`, `e`, `E`, `.`, `,`). Allow control keys (`Backspace`, `Delete`, `Tab`, `ArrowLeft`, `ArrowRight`, `Enter`).
    - `onChange`: Sanitize string to strictly allow digits only (`val.replace(/[^0-9]/g, '')`).
    - Pre-submit validation: If provided (`value !== ''`), parse as integer and verify `Number(value) > 0`. If `0`, reject with message *"Los días para responder deben ser mayores a 0 días"*.
  - **Date Field (`event_date`)**:
    - HTML5 attribute `max={getTodayDateString()}` to restrict native date picker selection to the current date or earlier.
    - Pre-submit validation: Compare selected `event_date` against `today` string (`YYYY-MM-DD`). If `event_date > today`, reject with message *"La fecha del suceso no puede ser futura"*.
- **Rationale**: Prevents common input errors, avoids malformed numbers in PostgreSQL `integer` columns, and guarantees realistic chronological reporting.
