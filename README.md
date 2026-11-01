# SkillSwap &mdash; University of Hyderabad (IE209 Phase 1)

> **"Teach what you know, learn what you need &bull; time credits, not money"**  
> School of Computer and Information Sciences (SCIS), University of Hyderabad

SkillSwap is a student skill-exchange platform where students trade peer mentoring sessions using **Time Credits** (1 hour = 1 credit). This Phase 1 build establishes the application shell, design tokens, shared UI components, routes, and domain data models based on the IE209 Mini-Project specification.

---

## 🚀 Quick Start

### Prerequisites
Node.js (v20+ recommended) and npm.

### Running the App Locally
```bash
npm install
npm run dev
```

The Vite dev server will start at:
```
http://127.0.0.1:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎨 Design System & Theme

- **Distinctive Accent Palette**: Indigo brand (`brand-600`: `#4f46e5`) paired with amber time-credit badges (`credit-500`: `#f59e0b`, `⏱ 1 credit`).
- **Typography**: Clean, geometric sans (`Plus Jakarta Sans` / `Inter`) with hierarchy for campus readability.
- **Elevation & Borders**: Subtle borders (`border-slate-200/80`), understated shadows (`shadow-card`, `shadow-subtle`), and high contrast for accessibility.
- **Safety & Campus Integrity**: Prominent Academic Integrity banners enforcing the rule: *"Peer learning only &mdash; no doing assignments or exams for others."*

---

## 🧭 Routes & Application Structure

| Route | Purpose | Components & Features |
| :--- | :--- | :--- |
| `/dashboard` | Campus hub & overview | Time credit overview, upcoming sessions, quick skill chips, open slots |
| `/discover` | Search open future slots | Real-time search by skill, category filters, booking with credit checks |
| `/teach` | Publish a teaching slot | Form with skill, date/time, public campus location / online link |
| `/sessions` | My active & completed sessions | Tabs for learning, teaching, completed history, confirmation, ratings |
| `/wallet` | Time credit wallet & ledger | Total credits, available vs escrow reservations, transaction ledger table |
| `/profile` | Student skills & bio | Comma-separated/chip offers & wants (FR-2), UoH verification badge, reviews |
| `/login` | University authentication | University email validation (`@uohyd.ac.in`), initial 2-credit grant |

---

## 🧱 Reusable Component Library

### Layout (`src/components/layout/`)
- `AppShell.tsx`: Responsive container with sidebar, header, main content, and mobile navigation
- `DesktopSidebar.tsx`: Brand navigation, wallet badge, campus honor badge, user quick info
- `MobileNavigation.tsx`: Fixed bottom bar (Home, Search, Teach, Sessions, Profile)
- `Header.tsx`: Top bar with global time wallet indicator (`⏱ 2 credits`) and search shortcut
- `PageHeader.tsx`: Breadcrumbs, page title, subtitle, and contextual action buttons

### UI Primitives (`src/components/ui/`)
- `Button.tsx`: Multiple variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `credit`), sizes, and loading state
- `Input.tsx`: Form inputs with labels, icons, helper text, and validation error messages
- `Badge.tsx`: Status and category chips (`brand`, `success`, `warning`, `danger`, `credit`)
- `Tabs.tsx`: Tab switcher with pills or underline variants and badges
- `SkillTag.tsx`: Offered (`offer`), wanted (`want`), and interactive selectable skill tags
- `Avatar.tsx`: Image avatar with automatic initials and hashed fallback colors
- `Card.tsx`: Reusable container with subtle borders and shadows
- `SessionCard.tsx`: Complete session slot card with tutor details, date/time, venue, status, and action buttons
- `LoadingState.tsx`: Spinner and skeleton placeholder loading variants
- `EmptyState.tsx`: Empty state placeholder with icons and call-to-action buttons
- `ErrorState.tsx`: Error alert box with retry button

### Shared (`src/components/shared/`)
- `WalletIndicator.tsx`: Prominent ⏱ time credit display across every page
- `AcademicIntegrityBanner.tsx`: University honor code adherence notice

---

## 📦 Data Architecture & Models

- `src/types/index.ts`: TypeScript contracts for `UserProfile`, `SessionSlot`, `LedgerTransaction`, `RatingReview`.
- `src/data/mockData.ts`: Realistic campus seed data based on real UoH departments (SCIS, Maths, Linguistics, Arts).
- `src/services/mockService.ts`: Local state service enforcing business rules (2 initial credits, credit check `credits - pending >= 1`, 2-hour cancellation rule, both-sides confirmation to transfer credits).
