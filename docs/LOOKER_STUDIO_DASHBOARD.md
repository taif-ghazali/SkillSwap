# SkillSwap UoH &mdash; Looker Studio Dashboard Specification
**Course**: IE209 Skill Development Mini-Project &bull; Deliverables Section 4A & Day 13 Checkpoint  
**School of Computer and Information Sciences (SCIS), University of Hyderabad**  
**Role R4**: Backend & Data Engineer

---

## 1. Overview & Purpose
Per the IE209 specification (Section 4A & Day 13), the SkillSwap system connects the Google Sheets database to **Google Looker Studio** to provide university administrators, faculty, and students with real-time visibility into campus skills demand, peer tutoring activity, and credit velocity.

---

## 2. Connected Data Sources

The Looker Studio dashboard connects directly to the Google Sheets database tabs via the native **Google Sheets Connector**:

| Sheet Tab | Connector Range | Refresh Frequency | Primary Metrics & Dimensions |
| :--- | :--- | :--- | :--- |
| **`Users`** | `Users!A1:E` | 15 minutes | Active student tutors, offers count, wants count, total credits distributed. |
| **`Slots`** | `Slots!A1:J` | 15 minutes | Published slots, booking conversion rate, popular venues, cancellation rate. |
| **`Ledger`** | `Ledger!A1:E` | 15 minutes | Peer hours exchanged, credit velocity, cumulative peer transactions. |
| **`Ratings`** | `Ratings!A1:D` | 15 minutes | Average tutor rating, satisfaction distribution, review volume. |

---

## 3. Dashboard Pages & Chart Layout

### Page 1: Executive Campus Exchange Overview
1. **Scorecards (Top KPI Header)**:
   - **Total Verified Students**: `COUNT_DISTINCT(email)` from `Users`
   - **Total Peer Mentoring Hours**: `SUM(credits)` from `Ledger`
   - **Active Open Slots Available**: `COUNTIF(status, "open")` from `Slots`
   - **Average Tutor Rating**: `AVG(stars)` from `Ratings` (Target: $\ge 4.5$)
2. **Time Series Chart**:
   - **Weekly Session Velocity**: Sessions completed per week over the semester (X-axis: `time` date, Y-axis: `COUNT(slotId)`).
3. **Pie Chart**:
   - **Session Status Distribution**: Breakdown of `open`, `booked`, `done`, and `cancelled` slots.

### Page 2: Campus Skills Supply vs. Demand
1. **Horizontal Bar Chart &mdash; Most-Wanted Skills (Demand)**:
   - Aggregation of student `wants` from the `Users` tab.
   - Shows top topics where students need peer assistance (e.g. LaTeX Typesetting, Python Data Analysis, Figma Auto-Layout, Spoken English).
2. **Horizontal Bar Chart &mdash; Top Offered Skills (Supply)**:
   - Aggregation of student `offers` from the `Users` tab.
   - Demonstrates department strengths (e.g. SCIS excels at C++ and Algorithms; Arts excels at UI/UX and Graphic Design).
3. **Scatter Plot &mdash; Skill Opportunity Matrix**:
   - X-axis: Number of tutors offering skill.
   - Y-axis: Number of learners seeking skill.
   - Identifies high-demand, low-supply skills requiring tutor recruitment campaigns by R1.

### Page 3: Campus Safety & Venue Distribution
1. **Column Chart &mdash; Popular Public Campus Venues**:
   - Breakdown of mentoring sessions across verified campus locations:
     - Indira Gandhi Memorial (IGM) Library (Ground floor discussion halls)
     - SCIS Laboratories (Lab 1, Lab 2, Lab 3)
     - University Cafeteria / Open Amphitheatre
     - Online Google Meet (`@uohyd.ac.in`)
2. **Audit Table &mdash; Cancellation Window Compliance**:
   - Monitors cancellations occurring $\ge 2$ hours before start versus system-rejected cancellations.

---

## 4. Setup & Deployment Instructions

1. Open [Google Looker Studio](https://lookerstudio.google.com/).
2. Click **Create** &rarr; **Data Source** &rarr; Select **Google Sheets**.
3. Choose the spreadsheet **`SkillSwap_UoH_Database`** and select the **`Ledger`** tab. Check *"Use first row as headers"*. Click **Connect**.
4. Repeat to add **`Users`**, **`Slots`**, and **`Ratings`** as additional data sources.
5. Create a new Blank Report and add the charts specified above.
6. Share configuration: Set to *"Anyone with the link at University of Hyderabad can view"*.

