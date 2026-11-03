# SkillSwap Android: Figma-Driven Design & Complete Application Build

**Course**: IE209 Skill Development Mini-Project  
**School of Computer and Information Sciences (SCIS), University of Hyderabad**  
**Figma Prototype Reference**: [SkillSwap Prototype (Node 9-2016)](https://www.figma.com/proto/8tnGWaLD2Z6p4rjjpdV10F/Skillswap?node-id=9-2016)

---

## 1. Executive Summary & Design Transformation

The SkillSwap MIT App Inventor Android application has been transformed from its early prototype appearance (which suffered from harsh, unstyled saturated primaries like `&HFF0000FF` pure blue and `&HFF00FF00` neon green) into a **polished, cohesive, production-grade mobile application** directly reflecting the official team Figma design system.

### Core Visual Language & Design Tokens

| Token | Hex Value | ARGB App Inventor Hex | Purpose & Usage in Figma Design |
| :--- | :--- | :--- | :--- |
| **Primary Forest Green** | `#1B4332` | `&HFF1B4332` | Primary brand accent, primary CTA buttons (`btnLogin`, `btnBook`, `btnPublish`, `btnConfirm`, `btnSave`), active tab indicator, top wallet card banner |
| **Dark Forest Green** | `#143728` | `&HFF143728` | Android status bar (`color.primary.dark`), card headers |
| **Warm Cream / Sage BG** | `#F8F9F5` | `&HFFF8F9F5` | Screen background (`BackgroundColor`), clean card framing |
| **Card Surface White** | `#FFFFFF` | `&HFFFFFFFF` | Content surfaces, clean input textboxes, list view items |
| **Soft Sage Input / Pill** | `#F0F4EF` | `&HFFF0F4EF` | Date/time picker buttons, navigation bar container (`haNav`) |
| **Deep Forest Charcoal** | `#1C2A24` | `&HFF1C2A24` | Primary page headings, session titles, prominent labels |
| **Body Slate** | `#2D3748` | `&HFF2D3748` | Field labels, tutor names, timestamps, venue details |
| **Muted Slate** | `#64748B` | `&HFF64748B` | Subtitles, helper text, venue guidelines |
| **Input Placeholder** | `#94A3B8` | `&HFF94A3B8` | Clear, unobtrusive input hint text |
| **Amber Gold** | `#D97706` | `&HFFD97706` | Credit badge (`lblSlotCredits`), star rating button (`btnRate`) |
| **Danger / Honor Code** | `#DC2626` | `&HFFDC2626` | Academic integrity alerts, cancel booking actions |
| **Soft Gray Button** | `#F1F5F9` | `&HFFF1F5F9` | Secondary outline actions (`btnCancel`) |

---

## 2. Screen-by-Screen Implementation & Improvements

### Screen 1: Login & University Onboarding (`vaLogin`)
- **Figma Design Intent**: Welcoming campus gateway encouraging students to sign in with their `@uohyd.ac.in` email to claim their initial 2 time credits.
- **Visual Changes**:
  - Replaced garish neon green label backgrounds with clean, transparent styling.
  - Centered brand title `SkillSwap` in Forest Green (`#1B4332`), eliminating the hardcoded space padding.
  - Styled `lblTagline` into an elegant subtitle ("Teach what you know, learn what you need").
  - Form fields (`txtEmail`, `txtNick`) feature crisp white backgrounds, subtle slate placeholders, and high-contrast input text.
  - Full-width primary CTA button: `Sign In / Get Started` in `#1B4332` with white bold text.

### Screen 2: Discovery & Search (`vaSearch`)
- **Figma Design Intent**: Rapid search of available peer tutoring sessions by topic (Python, LaTeX, Figma, Excel).
- **Visual Changes**:
  - `lblSearchTitle` ("Find a Tutor 🔍") in bold brand green.
  - `txtSkill` formatted with clean white background and helpful placeholder (`Enter skill (e.g. Python, LaTeX, Figma)`).
  - `lvSlots` transformed from harsh solid blue into a clean white card list with dark charcoal titles and slate metadata details.
  - Formatted using `slotLine` procedure: `[Skill] • [Date Time] • [Location]`.

### Screen 3: Slot Details & Academic Integrity (`vaSlot`)
- **Figma Design Intent**: Detailed overview of the selected peer session before committing a time credit, featuring the campus honor code.
- **Visual Changes**:
  - Dark forest green header banner for `lblSlotTitle`.
  - Prominent `lblSkill` title, followed by clean tutor name, scheduled date/time, and campus venue.
  - `lblSlotCredits` highlighted in Amber Gold (`🪙 Cost: 1 Time Credit`).
  - Full-width `btnBook` button: `"Book This Session (1 Credit)"`.
  - `lblIntegrity` highlighted in warning red: `"⚠️ Campus Honor Code: Learning and peer mentoring only. No graded assignment or exam help."`

### Screen 4: Publish Teaching Slot (`vaTeach`)
- **Figma Design Intent**: Low-friction form for students to offer a skill, choose a future date/time, and designate a safe campus venue.
- **Visual Changes**:
  - Clean header and subtitle: `"Publish a Teaching Slot"` &bull; `"Share your knowledge with peers and earn time credits"`.
  - Date and time pickers (`dpDate`, `tpTime`) styled in soft sage buttons with calendar (`📅`) and clock (`⏰`) visual cues.
  - Campus venue input (`txtPlace`) guides students towards public campus locations (Library, SCIS labs, campus canteen) or online links.
  - Full-width primary publish CTA: `"Publish Session Slot"`.

### Screen 5: My Sessions & Bookings (`vaSessions`)
- **Figma Design Intent**: Unified dashboard managing active bookings, attending vs. hosting roles, mutual confirmations, and star reviews.
- **Visual Changes**:
  - `lblSessionsTitle` in bold forest green.
  - `lvSessions` styled with clean white background and dark text, displaying session status, role, date/time, and venue.
  - Distinct action hierarchy:
    - **Confirm (Primary)**: Bold Forest Green (`btnConfirm`), `"Confirm Session (Transfer Credit) ✔"`.
    - **Cancel (Secondary / Warning)**: Soft subtle gray background with red text (`btnCancel`), `"Cancel Session (≥ 2h before) ✕"`.
    - **Rate (Accent)**: Amber Gold (`btnRate`), `"Rate Session (1-5 Stars) ★"`.

### Screen 6: Profile & Time Wallet (`vaProfile`)
- **Figma Design Intent**: Student identity hub displaying the authoritative time credit balance and enabling quick edits of offered and wanted skills.
- **Visual Changes**:
  - Premium dark forest green banner for `lblCredits`: `"🪙 Time Wallet: 2 credits"`.
  - Section headers for `"Skills I Can Teach (Offers)"` and `"Skills I Want to Learn (Wants)"`.
  - Clean comma-separated skill textboxes (`txtOffers`, `txtWants`).
  - Primary save button: `"Save Profile ✔"`.

### Global Navigation & Header
- **Top Wallet Banner (`lblWallet`)**: High-contrast forest green banner displaying current wallet balance whenever signed in.
- **Bottom Navigation Bar (`haNav`)**: Soft sage background (`#F0F4EF`) housing 4 equal-width tabs: `🔍 Search`, `➕ Teach`, `📅 Sessions`, `👤 Profile`.

---

## 3. Production Backend Integration

The application communicates directly with the live, deployed Google Apps Script backend and production Google Sheets database:

- **Endpoint**: `https://script.google.com/a/macros/uohyd.ac.in/s/AKfycbzdpObmzA4TaFSd71km09NjHXgOAnrXsZZdlnuIEpkntH0c02zYD3IGz_uFkfA1Uy1I/exec`
- **Secret Key**: `team-secret-123`
- **Concurrency & Atomicity**: Server-side `LockService` serialization and Google Sheets v4 atomic batch operations ensure:
  - Zero credit inflation.
  - No double-spending or duplicate confirmations.
  - Guaranteed single ledger row per completed exchange.

---

## 4. Verification & Validation Summary

| Test Suite | Scope | Result |
| :--- | :--- | :---: |
| **Frontend Unit & Component Tests** | Vitest suite (`src/__tests__`) | **28 / 28 PASS** |
| **Backend API Contract Tests** | Node test runner (`backend/tests/backend.test.cjs`) | **24 / 24 PASS** |
| **Android AIA Structural Validation** | Structure, forward slashes, procedures, events, globals | **PASS** |
| **Live Backend Connectivity** | Live `/exec?action=ping` against production Apps Script | **HTTP 200 (healthy)** |
| **Web Production Build** | Vite compilation (`npm run build`) | **PASS (`dist/`)** |

---

## 5. Artifacts & Deliverables

1. **Updated & Polished Android AIA**:  
   📁 `output/android/SkillSwap_MiniProject_Team_Reviewed.aia` (100,251 bytes)  
   *Pre-configured with live API endpoint, secret key, request gating, and Figma design tokens.*
2. **Original Project Backup**:  
   📁 `SkillSwap_MiniProject_Team.aia` (Workspace root) &amp; `output/android/SkillSwap_MiniProject_Team_Reviewed.backup.aia`
3. **Build Script & Automation**:  
   📁 `tools/build_figma_android.mjs` (One-click rebuild tool)
4. **Validation Tool**:  
   📁 `tools/validate_android.mjs` (`npm run validate:android`)

---

## 6. Instructions for Importing to MIT App Inventor & Generating APK

1. Navigate to [MIT App Inventor](http://ai2.appinventor.mit.edu/) and sign in.
2. Go to **Projects &rarr; Import project (.aia) from my computer**.
3. Select the file:  
   `D:\Skill_dev\Project\output\android\SkillSwap_MiniProject_Team_Reviewed.aia`
4. Review the project:
   - **Designer View**: Observe the clean Forest Green and Sage Cream color palette, properly formatted labels, and intuitive button layout.
   - **Blocks View**: Verify `global apiUrl` and `global apiKey` are initialized to the live backend.
5. In the top menu, click:  
   **Build &rarr; Android App (.apk)**
6. Scan the generated QR code or download the `.apk` file directly to your Android device for installation and live testing.

