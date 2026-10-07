# Implementation Plan: Legal Records Portal & Public Landing Experience

**Branch**: `001-legal-records-portal` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-legal-records-portal/spec.md`

## Summary

Build a high-impact corporate web application for The Rose Holding consisting of:
1. An immersive public landing page in corporate dark mode featuring an interactive 3D WebGL hero scene (Three.js) with strict resource disposal on unmount, and interactive feature cards with animated Morphicon iconography.
2. A secure private dashboard backed directly by Supabase (PostgreSQL + Supabase Auth) with zero intermediate backend APIs.
3. Multitenant isolation strictly enforced via Row Level Security (RLS) on `public.legal_records`.
4. Fast case creation via a centered modal dialog, strict categorization (*Corporativo*, *Litigio*, *Laboral*), instant category filtering, and real-time synchronization using Supabase Realtime channels.

## Technical Context

**Language/Version**: JavaScript ES6+ (JSX) / Node.js v24

**Primary Dependencies**: React 18/19, Vite, Tailwind CSS, Three.js (`three`), `@supabase/supabase-js`, `lucide-react`

**Storage**: PostgreSQL on Supabase (`public.legal_records` with strict RLS and Realtime publication)

**Testing**: Manual E2E validation against scenarios in `quickstart.md`, Vite build checks, ESLint verification

**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari) with WebGL support

**Project Type**: Single-Page Web Application (SPA) with Direct BaaS Integration

**Performance Goals**: 60 FPS Three.js rendering, <200ms category filtering, <500ms Realtime event propagation

**Constraints**: Dark mode corporate aesthetics, 0 WebGL memory leaks on unmount, strict multitenant RLS (`auth.uid() = user_id`)

**Scale/Scope**: Designed for 48-hour interview evaluation timeframe, 3 primary categories, focused and robust scope (Zero shadow code)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Status | Justification / Implementation Evidence |
|---|---|---|
| **I. RLS Estricto (NO NEGOCIABLE)** | **PASS** | RLS enabled on `legal_records` with `auth.uid() = user_id` for select, insert, delete. Described in `data-model.md`. |
| **II. Consumo BaaS Directo (Cero APIs)** | **PASS** | React frontend connects directly to Supabase via `@supabase/supabase-js`. No Express/Node backend servers. |
| **III. Ciclo de Vida 3D** | **PASS** | Three.js canvas in Hero component explicitly disposes renderer, geometry, materials, and listeners in `useEffect` cleanup. |
| **IV. Sesión para CRUD** | **PASS** | `AuthContext` + `ProtectedRoute` shields `/dashboard` and data operations. Landing page remains public. |
| **V. Categorización Estructurada** | **PASS** | Categories restricted to `Corporativo`, `Litigio`, `Laboral` both in client UI and DB check constraints. |
| **VI. Cero Código Sombra & SDD** | **PASS** | Strictly following `spec.md` with explicit Non-Goals respected (no payments, no storage, no LLMs). |

## Project Structure

### Documentation (this feature)

```text
specs/001-legal-records-portal/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0: Technical decisions & library research
├── data-model.md        # Phase 1: PostgreSQL schema, RLS policies, indexes
├── quickstart.md        # Phase 1: End-to-end validation guide
├── contracts/           # Phase 1: Client-Supabase interfaces & contracts
│   └── supabase-api.md
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .env
├── public/
│   └── favicon.ico
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── supabase.js            # Initialized Supabase client
    │   └── utils.js               # Error message formatter, category badge helpers
    ├── context/
    │   └── AuthContext.jsx        # Auth state provider and session listeners
    ├── components/
    │   ├── Navbar.jsx             # Public & private navigation header
    │   ├── Hero3D.jsx             # Three.js interactive WebGL canvas with strict cleanup
    │   ├── FeatureCards.jsx       # Value prop cards with animated Morphicon/Lucide icons
    │   ├── AuthModal.jsx          # Login & Signup modal with error translation
    │   ├── CreateRecordModal.jsx  # Centered modal dialog to register legal records
    │   ├── RecordCard.jsx         # Card component for individual legal record
    │   ├── CategoryFilter.jsx     # Filter pills (Todas, Corporativo, Litigio, Laboral)
    │   ├── DeleteConfirmModal.jsx # Safety confirmation dialog before deletion
    │   └── ProtectedRoute.jsx     # Route wrapper restricting access to authenticated users
    └── pages/
        ├── LandingPage.jsx        # Public home page
        └── DashboardPage.jsx      # Private legal records management dashboard
```

**Structure Decision**: Clean, modular flat architecture adhering strictly to Section 4 of the Constitution. Zero unnecessary abstraction layers.

## Complexity Tracking

> No constitution violations detected. Standard direct BaaS SPA architecture.
