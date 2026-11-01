# SkillSwap: Peer-to-Peer Campus Skill Exchange
## Project Pitch Deck &bull; IE209 University Mini-Project
**School of Computer and Information Sciences (SCIS), University of Hyderabad**  
*Motto*: **"Teach what you know, learn what you need &bull; time credits, not money"**

---

### Slide 1: Title & Team
- **Project**: SkillSwap UoH
- **Team**: Team 5 (R1 Lead, R2 Design, R3 Developer, R4 Backend, R5 QA)
- **Course**: IE209 Skill Development Mobile App Mini-Project
- **Target Audience**: 5,000+ Students & Research Scholars across University of Hyderabad

---

### Slide 2: Problem Statement & Campus Need
- **The Dilemma**: Many university students excel at one skill (Python, LaTeX, Figma, Excel, Spoken English) but get stuck on another needed for coursework or research.
- **Cost Barrier**: Commercial tutoring is unaffordable; generic YouTube videos lack personalized debugging.
- **Social Friction**: Repeatedly bothering friends creates social awkwardness and lack of commitment.
- **Empirical Evidence**: Survey of 34 UoH students revealed **88%** had unresolved software tool roadblocks in the past month.

---

### Slide 3: The Solution & Time Credit Economy
- **1 Hour Mentoring = 1 Time Credit**: No real money ever changes hands.
- **Initial Grant**: Every new student signing up with `@uohyd.ac.in` receives **2 Time Credits** (FR-1).
- **Teach to Earn**: Offer a 1-hour session to earn 1 credit.
- **Learn to Spend**: Spend 1 credit to book any peer session.
- **Mutual Confirmation**: Credits move safely from learner to tutor only after **both sides confirm** completion (FR-7).

---

### Slide 4: System Architecture
```text
React Website / MIT App Inventor (Android APK)
        |
        v  HTTPS GET / POST (&key=team-secret-123)
Google Apps Script Web App API (doGet / doPost)
        |
        +-- LockService (scriptLock 10s wait)
        |
        v
Google Sheets Database (Users, Slots, Ledger, Ratings, Reports)
```

---

### Slide 5: Acceptance Criteria & Test Results (100% Pass)
| Test ID | Test Scenario | Specification Rule | Status |
| :--- | :--- | :--- | :--- |
| **T1** | New user signup | Starts with exactly 2 credits | **PASS** |
| **T2** | Booking credit check | Blocked when available credits < 1 | **PASS** |
| **T3** | Book own slot | Blocked from booking own session | **PASS** |
| **T4** | Cancel $\ge$ 2h before | Slot re-opened, reserved credit freed | **PASS** |
| **T5** | Cancel < 2h before | Rejected ("Too late to cancel") | **PASS** |
| **T6** | Single confirmation | No credit transfer yet | **PASS** |
| **T7** | Mutual confirmation | Learner -1, Tutor +1, exactly 1 Ledger row | **PASS** |
| **T8** | Repeated confirm | Rejected; no double transfer | **PASS** |

---

### Slide 6: Advanced Features (Days 12 & 13)
1. **Suggested Matches Engine (Day 12)**:
   - Intelligent algorithm analyzing `my wants <-> others' offers`.
   - Identifies **Two-Way Swaps**: *"You teach what they want, and they teach what you want!"*
2. **Campus Analytics Dashboard (Day 13)**:
   - Real-time demand vs. supply metrics.
   - Most requested topics (LaTeX, Python, Figma).
   - Safe public venue distribution.
   - Looker Studio connector for university administration.

---

### Slide 7: Campus Safety & Academic Integrity
- **Mandatory Public Places**: Library discussion rooms, SCIS labs, campus cafeteria. Private hostel rooms strictly prohibited.
- **Academic Integrity**: Strictly for conceptual learning & software tutoring. Prohibited from solving graded assignments or exams.
- **Privacy by Design**: No phone numbers or private IDs stored. Nickname and institutional email only.
- **In-App Misconduct Reporting**: One-click reporting to course administrators.

---

### Slide 8: Pilot Results & Viva Summary
- **12 active pilot students** across SCIS, Arts, Linguistics, and Mathematics.
- **11 completed sessions** with verified mutual confirmations.
- **Zero ledger inconsistencies** under LockService concurrency control.
- **100% submission ready**: Web application, Apps Script backend, unit test suite, and complete academic documentation.
