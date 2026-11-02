# SkillSwap Backend & Database (Google Apps Script + Google Sheets)

> **Course**: IE209 Skill Development Mini-Project &bull; School of Computer and Information Sciences (SCIS), University of Hyderabad  
> **Role R4**: Backend & Data Engineer

This directory contains the production-ready Google Apps Script backend implementing the architectural requirements from the official IE209 Mini-Project specification.

---

## 🏗 System Architecture

```text
React Web App / MIT App Inventor (Android APK)
                     │
                     ▼ HTTPS GET / POST (&key=team-secret-123)
      Google Apps Script Web App API (doGet / doPost)
                     │
                     ├─ LockService (scriptLock 10s wait)
                     │    └─ Prevents race conditions & double credit transfers
                     │
                     ▼ Read / Append / Update
      Google Sheets Database (Users, Slots, Ledger, Ratings, Reports)
```

---

## 📁 Source Files

1. **`Code.gs`**: Complete Web App API handler:
   - Request dispatcher for `doGet(e)` and `doPost(e)`
   - Authentication via `KEY = 'team-secret-123'`
   - Route handling: `login`, `search`, `profile`, `publish`, `book`, `cancel`, `confirm`, `mine`, `rate`, `dashboard`, `report`
   - Atomic two-sided confirmation with `LockService`
   - Strict 2-hour cancellation check
   - Credit escrow calculation (`credits - pending >= 1`)
2. **`InitSheet.gs`**: Database initialization script:
   - Creates the 4 required sheets (`Users`, `Slots`, `Ledger`, `Ratings`) plus `Reports`
   - Enforces Plain Text `@` formatting on Slots Date and Time columns (Section 5B)
   - Seeds **20 real campus tutors' skills** across UoH departments
   - Seeds **15 session slots** spread over 2 weeks (Day 4 checkpoint)
   - Seeds verified ledger transactions and star reviews
3. **`appsscript.json`**: Manifest configuration for Google V8 runtime and timezone (`Asia/Kolkata`).

---

## 🚀 Quick Deployment Guide

### Step 1: Create Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the spreadsheet: **`SkillSwap_UoH_Database`**.

### Step 2: Open Apps Script Editor
1. In the Google Sheet menu, click **Extensions** &rarr; **Apps Script**.
2. Rename the project to **`SkillSwap_Backend_API`**.

### Step 3: Paste Code
1. Replace the contents of `Code.gs` with `backend/Code.gs`.
2. Click the `+` icon &rarr; **Script** to add a new file named **`InitSheet.gs`**.
3. Paste the contents of `backend/InitSheet.gs` into `InitSheet.gs`.

### Step 4: Run Initializer & Seed Database
1. In the Apps Script toolbar, click the function dropdown (currently says `myFunction` or `doGet`).
2. Select **`setupDatabase`**.
3. Click **Run**.
4. Grant the requested Google permissions (Review Permissions &rarr; Choose Account &rarr; Advanced &rarr; Go to SkillSwap_Backend_API (unsafe) &rarr; Allow).
5. Switch back to your Google Sheet: All 5 tabs will now be created and populated with 20 tutors and 15 slots!

### Step 5: Deploy as Web App
1. In the top right corner of Apps Script, click **Deploy** &rarr; **New deployment**.
2. Click the gear icon next to "Select type" &rarr; select **Web app**.
3. Set configuration:
   - **Description**: `SkillSwap API v1.0`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(Crucial so the frontend and App Inventor app can call it)*
4. Click **Deploy**.
5. Copy the generated **Web app URL** (`https://script.google.com/macros/s/.../exec`).

---

## 🧪 Testing API Actions in Browser / Postman

Replace `{EXEC_URL}` with your copied Web App URL:

```bash
# 1. Health check
{EXEC_URL}?key=team-secret-123&action=ping

# 2. Login as existing tutor
{EXEC_URL}?key=team-secret-123&action=login&email=ravi.23mcse01@uohyd.ac.in&nick=Ravi

# 3. Search open future slots
{EXEC_URL}?key=team-secret-123&action=search&email=ravi.23mcse01@uohyd.ac.in&skill=Figma

# 4. View user's sessions & credit balance
{EXEC_URL}?key=team-secret-123&action=mine&email=ravi.23mcse01@uohyd.ac.in

# 5. Book a slot
{EXEC_URL}?key=team-secret-123&action=book&email=ravi.23mcse01@uohyd.ac.in&slot=SL101

# 6. Mutual confirmation (Tutor side)
{EXEC_URL}?key=team-secret-123&action=confirm&email=sneha.des@uohyd.ac.in&slot=SL101

# 7. Mutual confirmation (Learner side -> triggers 1 credit move & ledger row)
{EXEC_URL}?key=team-secret-123&action=confirm&email=ravi.23mcse01@uohyd.ac.in&slot=SL101

# 8. Rate the completed session
{EXEC_URL}?key=team-secret-123&action=rate&email=ravi.23mcse01@uohyd.ac.in&slot=SL101&stars=5
```

---

## 🔒 Security & Data Integrity Guarantees

- **University Email Domain**: Rejects any registration not ending with `@uohyd.ac.in`.
- **LockService Isolation**: `confirm` acquires a script lock for up to 10,000 ms to prevent double credit transfers when two participants click confirm simultaneously.
- **Credit Check**: Validates that available credits (`credits - pending bookings`) is at least 1 before permitting booking.
- **2-Hour Cancellation Rule**: Blocks any cancellation attempt made less than 2 hours before the scheduled session start.
- **Campus Safety Rule**: Blocks slots from being published in private hostel rooms. Sessions must be in public campus areas or online.

