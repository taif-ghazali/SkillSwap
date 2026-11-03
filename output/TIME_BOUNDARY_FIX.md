# Slot time boundary fix — deployed and live verified

2 November 2026. Updated the existing Apps Script deployment to **version 2** at 10:26 PM IST. The supplied endpoint, key, execution identity, Anyone access, action names, request parameters and response envelopes remain unchanged. The website was not publicly deployed and Android artifacts were not modified.

## Complete publishing path and root cause

1. `src/pages/TeachPage.tsx` binds an HTML `type="time"` input to string state and passes that string to `AppService.createSlot`.
2. `src/services/appService.ts` forwards `params.time` unchanged with the existing publish parameters. `src/services/apiClient.ts` puts it in `URLSearchParams`; for example, the value is encoded as `time=02%3A45`, not converted into a JavaScript Date or number.
3. Apps Script's GET handler receives that string through `e.parameter`; JSON/form POST handlers forward the same parameter. The publish route validates the existing strict `HH:mm` contract and campus date/time before writing.
4. The previous write used `Spreadsheet.appendRow` with a clock-looking string. In the actual test sheet this became a native Sheets time, and formatted reads returned `2:45` rather than `02:45`. Setting a column to plain text alone did not reliably prevent new API writes from being coerced.
5. The previous common row reader, booking/cancellation updater and confirmation procedure used `getDisplayValues`. Discovery's strict time parser then rejected those display strings. This was a storage/read-boundary failure, not a website encoding failure.

## Actual boundary changes

`backend/Code.gs` now publishes with Sheets v4 `appendCells`, explicitly supplying `userEnteredValue.stringValue` for slot fields and TEXT number-format metadata. This does not invoke automatic input parsing, unlike a user-entered clock string. Validated `02:45` is stored as the five-character text `02:45`. The existing advanced Sheets service is reused; no new dependency or permission was added.

`readSlotTable` reads raw values with `getValues`. It returns canonical dates and times from text, native Apps Script Date values and Sheets numeric serial values, without depending on locale-specific display formatting. Legacy `2:45` normalizes to `02:45`; invalid clock values remain invalid and cannot be discovered or booked. Native Date values use the spreadsheet timezone; numeric time fractions normalize to minutes with floating-point tolerance.

The common Slots reader, mine/search routes, booking/cancellation updater and confirmation procedure all use this same normalized slot-table path. Otherwise their credit checks, locking, statuses, role checks and atomic transfer implementation remain intact. The read normalization does not rewrite old records. No fixture edits were used to make these fresh-publication tests pass.

The remote source was patched surgically from the existing editor content, with match-count checks on every replacement and a check that its key line stayed identical. Saved remote content was read back and compared with the intended patch before updating the existing deployment.

## Fresh live tests

Run `20261102222723`, with four new slots dated **4 November 2026** and one new, explicitly disposable time-test learner. The prior disposable tutor was reused. Every request used the exact supplied endpoint. No automatic mutation retries were performed.

| Submitted | Raw cell is text | Exact stored value / length | Discovery | Booking | Cancellation |
| --- | --- | --- | --- | --- | --- |
| 02:45 | TRUE | 02:45 / 5 | PASS | PASS | PASS |
| 09:05 | TRUE | 09:05 / 5 | PASS | PASS | PASS |
| 12:30 | TRUE | 12:30 / 5 | PASS | PASS | PASS |
| 18:45 | TRUE | 18:45 / 5 | PASS | PASS | PASS |

The independent `QA_TimeBoundary` sheet uses `ISTEXT`, `EXACT` and `LEN` against the real Slots cells, located by each fresh slot ID. All four cells returned TRUE, TRUE and 5, respectively. This checks the stored values rather than trusting API normalization or the displayed caption. Proof sheet: [QA_TimeBoundary](https://docs.google.com/spreadsheets/d/1tPyrqNtc091YJiQe8bzSWlsM86yawK4_y2DjMA9_9U8/edit?gid=1710757183#gid=1710757183).

A deliberate UI challenge applied Sheets' native Time format to just the four fresh test cells. In Google Sheets that action also reparsed the text into native times; it was not merely a caption change. Even under that conversion, a separate live discovery read returned all four exact canonical `HH:mm` values. The formatting challenge was then undone, and the proof sheet again showed that the original typed-string writes were present. Old application records were not modified for this check.

All **35 live checks passed**. These include the four publication/read/discovery/book/cancel flows, preserved times in booked-session reads, premature-confirmation rejection, all four slots discoverable together, unchanged final learner balance of 2 with no reservations, rejection of another confirmation on the prior completed session, and preservation of the prior tutor/learner balances at 3 and 1. The four new slots were left open after their bookings were cancelled. No new credit transfer was forced or backdated.

The live request/response evidence is in `live-time-boundary-results.json`, without the API key or authenticated URLs. These are API and storage tests, not a claim of a new full browser UI or Android acceptance run.

## Local validation

- Website tests: **28/28 PASS**, including four transport checks proving the frontend sends each requested string unchanged and URL-encoded.
- Actual Code.gs tests in the local service adapter: **24/24 PASS**. New cases cover typed storage, discovery, booking and cancellation for all four times; legacy text/native Date/numeric serial reads; and invalid time rejection. Existing T1-T8, rating rules and atomic-transfer failure/retry checks remain passing.
- `npm run build`: **PASS**. Website runtime code was not changed by this fix.
- `git diff --check`: **PASS**.

## Exact files changed in this fix

1. `backend/Code.gs` — typed publish writes and common normalized raw reads, also applied to confirmation and slot updates.
2. `backend/tests/backend.test.cjs` — Sheets adapter support and six new backend regression cases.
3. `src/__tests__/liveIntegration.test.ts` — four frontend transport tests.
4. `tools/live_time_boundary_check.py` — fresh live regression runner, no hardcoded key or endpoint.
5. `output/live-time-boundary-results.json` — sanitized live request/response and storage-verification evidence.
6. `output/TIME_BOUNDARY_FIX.md` — this trace and results report.

Cloud changes: the bound project's Code.gs, version 2 of the existing deployment, four fresh disposable Slots rows and one disposable Users row, plus the separate `QA_TimeBoundary` proof sheet. Existing schemas and other source files were preserved. Earlier deployment ZIPs predate this fix; the current deployed source and `backend/Code.gs` are authoritative. No GitHub commit or upload was made.

Reference semantics: [Sheets typed ExtendedValue](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/other#ExtendedValue), [appendCells request](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#AppendCellsRequest), and [Apps Script raw range values](https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()).
