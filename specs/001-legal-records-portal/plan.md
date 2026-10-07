# Implementation Plan: Legal Records Portal & Process Tracking

**Branch**: `001-legal-records-portal` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-legal-records-portal/spec.md`

## Summary

Expand the legal portal with **Procedural Tracking and Case Updates (Novedades por Caso)**:
1. Allow users to click any case card in the dashboard to open a dedicated `CaseDetailPage`.
2. Provide a chronological timeline of process updates with dates, descriptions, and visual highlight of response deadlines (`response_days`).
3. Provide a centered modal `CreateUpdateModal` to record new novedades with client-side and database check constraints.
4. Secure the new table `public.case_updates` with strict PostgreSQL Row Level Security (`auth.uid() = user_id`) and Realtime synchronization.
5. Apply strict input filtering and validation in `CreateUpdateModal`: intercept disallowed keystrokes in numeric fields (`-`, `+`, `e`, `E`, `.`), validate `response_days > 0` when provided, and limit `event_date` to current or past dates (`max={today}`).

## Technical Context

**Language/Version**: JavaScript ES6+ (JSX) / Node.js v24

**Primary Dependencies**: React 18, Vite, Tailwind CSS, Three.js, `@supabase/supabase-js`, `lucide-react`

**Storage**: PostgreSQL on Supabase (`public.legal_records` and `public.case_updates` with strict RLS and Realtime publication)

**Testing**: Manual E2E validation against scenarios in `quickstart.md`, Vite build checks

**Target Platform**: Modern Web Browsers with WebGL support

**Project Type**: Single-Page Web Application (SPA) with Direct BaaS Integration

**Performance Goals**: <300ms transition to case detail, <500ms Realtime event propagation

**Constraints**: Dark mode corporate aesthetics, strict multitenant RLS (`auth.uid() = user_id`), 0 WebGL leaks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Status | Justification / Implementation Evidence |
|---|---|---|
| **I. RLS Estricto (NO NEGOCIABLE)** | **PASS** | RLS enabled on `case_updates` with `auth.uid() = user_id` for select, insert, delete. Described in `data-model.md`. |
| **II. Consumo BaaS Directo (Cero APIs)** | **PASS** | React frontend connects directly to Supabase via `@supabase/supabase-js`. |
| **III. Ciclo de Vida 3D** | **PASS** | `Hero3D` disposes renderer, geometry, materials, and listeners in `useEffect` cleanup. |
| **IV. Sesión para CRUD** | **PASS** | `AuthContext` + `ProtectedRoute` shields `/dashboard` and `CaseDetailPage`. |
| **V. Categorización Estructurada** | **PASS** | Categories restricted to `Corporativo`, `Litigio`, `Laboral`. |
| **VI. Cero Código Sombra & SDD** | **PASS** | Strictly following `spec.md` with explicit Non-Goals respected. |

## Project Structure

### Documentation (this feature)

```text
specs/001-legal-records-portal/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical decisions & library research
├── data-model.md        # PostgreSQL schema, RLS policies, indexes
├── quickstart.md        # End-to-end validation guide
├── contracts/           # Client-Supabase interfaces & contracts
│   └── supabase-api.md
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Tasks output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── supabase.js            # Initialized Supabase client
│   └── utils.js               # Error message formatter, category badge & deadline helpers
├── context/
│   └── AuthContext.jsx        # Auth state provider and session listeners
├── components/
│   ├── Navbar.jsx             # Public & private navigation header
│   ├── Hero3D.jsx             # Three.js interactive WebGL canvas
│   ├── FeatureCards.jsx       # Value prop cards with animated icons
│   ├── AuthModal.jsx          # Login & Signup modal with eye toggle
│   ├── CreateRecordModal.jsx  # Modal dialog to register legal records
│   ├── CreateUpdateModal.jsx  # Modal dialog to register case novedades (NEW)
│   ├── RecordCard.jsx         # Card component for individual legal record (clickable)
│   ├── CategoryFilter.jsx     # Filter pills (Todas, Corporativo, Litigio, Laboral)
│   ├── DeleteConfirmModal.jsx # Safety confirmation dialog before deletion
│   └── ProtectedRoute.jsx     # Route wrapper restricting access to authenticated users
└── pages/
    ├── LandingPage.jsx        # Public home page
    ├── DashboardPage.jsx      # Private legal records list dashboard
    └── CaseDetailPage.jsx     # Dedicated case view with timeline of novedades (NEW)
```

## Complexity Tracking

> No constitution violations detected. Standard direct BaaS SPA architecture.
