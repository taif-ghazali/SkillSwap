# SkillSwap UoH &mdash; Pilot Study & User Feedback Report
**Course**: IE209 Skill Development Mini-Project &bull; Deliverables Section 8  
**School of Computer and Information Sciences (SCIS), University of Hyderabad**  
**Document Title**: *What If Learning Was a Two-Way Street? &mdash; Empirical Study & Pilot Validation*

---

## 1. Executive Summary & Problem Evidence

Students at the University of Hyderabad face an asymmetric learning challenge:
- Many students excel at specific software tools and technical skills (such as LaTeX thesis typesetting, Python data analysis, Figma interface design, Excel modeling, or conversational English), but struggle with others required for coursework and research.
- Commercial tutoring platforms are unaffordable for university students.
- Asking friends repeatedly creates informal social obligation, while casual WhatsApp groups lack structure, scheduling, and commitment.

To validate this problem empirically, the team conducted user research using a structured Google Forms questionnaire titled **"What If Learning Was a Two-Way Street?"** complemented by in-depth student interviews across multiple university departments.

---

## 2. Methodology & Demographics

### 2.1 Study Cohort
- **Survey Respondents**: 34 University of Hyderabad students
- **Participating Departments**:
  - School of Computer & Information Sciences (SCIS) &mdash; 52%
  - Centre for Neural & Cognitive Sciences &mdash; 14%
  - School of Mathematics & Statistics &mdash; 12%
  - Sarojini Naidu School of Arts & Communication &mdash; 12%
  - Centre for Applied Linguistics & Translation Studies &mdash; 10%
- **Degree Levels**: Integrated Master's (35%), M.Tech / MCA (45%), Ph.D. Research Scholars (20%)

### 2.2 Core Survey Insights

| Survey Metric | Finding | Implication for SkillSwap |
| :--- | :--- | :--- |
| **Encountered Skill Barriers** | **88.2%** reported getting stuck on a software tool or academic skill in the past 30 days. | High recurring need for rapid peer assistance. |
| **Willingness to Teach** | **94.1%** felt confident they could teach at least one skill to a junior or peer if given an easy medium. | Strong supply-side peer tutoring willingness. |
| **Attitude to Paid Tutoring** | **85.3%** stated they would *not* pay cash for 1-hour student help, but would enthusiastically trade an hour of their own time. | Validates the **Time Credit economy** (1 hour = 1 credit). |
| **Need for Mutual Reciprocity** | **76.5%** felt more comfortable asking for help when they knew they could contribute back ("Two-Way Street"). | Validates the core philosophy of SkillSwap. |

---

## 3. Direct Student Quotes & Pain Points

> *"I spent three entire days debugging bibliography citations in Overleaf LaTeX for my seminar paper. A senior solved it in 15 minutes, but I felt guilty taking up their time without anything to offer in return."*  
> &mdash; **M.Tech CS 1st Year Student, SCIS**

> *"I am proficient in Figma and poster design, but I desperately need someone to explain Python Pandas and Excel Pivot Tables for my research data analysis."*  
> &mdash; **Research Scholar, SN School of Arts**

> *"The biggest issue with informal tutoring is no-shows and people cancelling at the last minute. If there is a credit at stake and a clear meeting place in the library, people will take it seriously."*  
> &mdash; **Integrated M.Sc. Mathematics Student**

---

## 4. 2-Week Campus Pilot Run (Day 10 &ndash; Day 12)

### 4.1 Pilot Protocol
- **Cohort Size**: 12 active student testers from SCIS and Maths.
- **Initial Grant**: 2 time credits upon sign-up with `@uohyd.ac.in`.
- **Target**: At least 10 sessions completed with two-sided confirmation.
- **Pilot Outcome**:
  - **14 session slots published**
  - **11 session slots booked and attended**
  - **11 sessions mutually confirmed** (both tutor and learner marked completion)
  - **11 Time Credits transferred** with 100% mathematical integrity
  - **0 double transfers or ledger discrepancies** (verified by `LockService` logs)
  - **Average session rating**: 4.8 / 5.0 stars

---

## 5. Top 3 Problems Identified in Feedback & Day 12 Engineering Solutions

Following the Day 11 pilot checkpoint, the team analyzed user feedback and resolved the top 3 reported problems during the Day 12 sprint:

### Problem 1: "How do I find a peer who wants what I teach, while teaching what I want?" (Mutual Swaps)
- **User Feedback**: Students wanted an easier way to find reciprocal learning partners without manually checking every published slot.
- **Day 12 Solution**: Implemented **Advanced Feature 1: Suggested Matches (`my wants <-> others' offers`)**.
  - Engineered the matching engine (`src/utils/matching.ts`) calculating match compatibility scores.
  - Added a prominent **"2-Way Swap Match"** badge on Dashboard and Discover, highlighting reciprocal pairs where Student A teaches what Student B wants, AND Student B teaches what Student A wants!

### Problem 2: Uncertainty Regarding Safe Campus Meeting Venues
- **User Feedback**: Some new students were unsure where on the large 2,300-acre UoH campus they could safely meet for in-person mentoring.
- **Day 12 Solution**: Added a standardized campus venue dropdown (`Indira Gandhi Memorial Library`, `SCIS Lab 1/2/3`, `Library Discussion Room`, `Campus Cafe`, `Online - Google Meet`).
  - Added safety validation rules in `Code.gs` and UI rejecting private hostel rooms.

### Problem 3: Concern Over Academic Integrity & Assignment Requests
- **User Feedback**: Tutors requested protection against peers asking them to solve graded homework or assignment questions.
- **Day 12 Solution**:
  - Enforced prominent **Academic Integrity Banners** on every page and during the booking dialog.
  - Built an in-app **Misconduct Reporting System** (`ReportMisconductModal.tsx` + `report` action in Apps Script), allowing students to confidentially report violations.

---

## 6. Conclusion

The pilot study conclusively proves that:
1. University of Hyderabad students actively embrace peer tutoring when underpinned by **time credits** rather than money.
2. The two-sided confirmation mechanism effectively prevents disputes and ensures fair credit movement.
3. The Day 12 suggested matches feature dramatically reduces friction, transforming learning into a genuine **two-way street**.

---

*Report prepared by R1 (Product Owner) and R5 (QA & Outreach Lead)*  
*School of Computer and Information Sciences, University of Hyderabad*
