# External connectivity and disposable transaction tests

Verified 2 November 2026, using the exact supplied deployment endpoint. This report supersedes the connectivity blockers in the previous website review.

## Connectivity

- Authenticated ping without Google-session cookies: **PASS**, HTTP 200, JSON action ping, status healthy, University of Hyderabad.
- Read-only ping with local website Origin header: **PASS**, healthy JSON and `Access-Control-Allow-Origin: *`.
- Website's actual application service against the deployment: **PASS** for live learner login, session retrieval and wallet reservations. Before completion it read total 2, reserved 2, available 0, two learning sessions, and no service error.
- A full browser UI end-to-end run is still separate from these HTTP/application-service checks. No public website deployment was performed.

## Disposable setup and verification

Created two clearly labelled disposable QA users and six slots in total: four initial fixtures, a replacement for the completion fixture that expired while investigating formatting, and one early-morning regression fixture. Only the QA tutor profile was edited.

Run identifier: `20261102221239`. Exact account identifiers, slot IDs, non-secret request parameters and API responses are recorded in `live-test-results.json`. Neither the API key nor an authenticated URL is recorded there.

| Check | Live result |
| --- | --- |
| T1 new accounts start with 2 credits | PASS, both tutor and learner |
| Profile save and independent login retrieval | PASS |
| Publication and discovery | PASS on corrected fixtures; initial discovery failed because time values lost leading zeros |
| Exclude own slots in discovery | PASS |
| T2 two pending bookings block another booking | PASS |
| T3 book own slot | Correctly rejected |
| T4 cancel more than two hours before start | PASS; separate mine read confirmed open status and cleared learner |
| T5 cancel within two hours of start | Correctly rejected |
| Booking changes reservations without transferring credits | PASS |
| T6 one confirmation | PASS; transferred false and both balances stayed 2 |
| T7 both confirmations | PASS; session done, learner 1, tutor 3 |
| T8 repeated confirmation | Correctly rejected; no second ledger row observed |
| Rate completed session | PASS, 5 stars |
| Repeated rating by same participant | Correctly rejected; no second rating row observed |

Direct Google Sheets inspection verified the saved tutor profile, published/selected booking states, final balances in Users, one transfer in Ledger for the completed test slot, and one 5-star entry in Ratings. These are actual sheet rows, not frontend success messages.

## Unresolved defect: early-morning times

The first discovery request returned only two of the four future slots. Direct sheet inspection showed submitted `02:12` and `03:13` values as `2:12` and `3:13`. Those fail the backend's strict `HH:mm` parsing.

For the QA fixture recovery, Slots columns D:E were set to plain text and only the four QA date/time pairs were restored to their originally submitted strings. Discovery then returned all four applicable future test slots. No business states or credits were changed manually. The completion fixture was replaced through the existing publish action after it expired; no session was backdated.

**Regression still fails:** a new slot submitted through publish with `02:45` read back through mine as `2:45` and was absent from search, even after the column format was set. The publish action reported success. Therefore the formatting change and fixture repair do not establish a fix for new early-morning API writes. Deployment needs a focused storage/normalization fix, preserving the API contract, before claiming all publication times work reliably. No backend code or deployment version was changed during these tests.

## Retained state

- Disposable tutor: 3 credits; disposable learner: 1 credit.
- One completed session, one near-start booking that cannot be cancelled under the two-hour rule, and four open fixtures (including an expired fixture and the malformed-time regression fixture).
- One ledger entry and one rating entry.
- QA records are deliberately retained as audit evidence. No database reset, deletion, manual credit transfer, or automatic mutation retry was performed.
- No backend API contract, key or Android artifact was changed. No website was deployed publicly, and no GitHub commit/upload was made.

The live test runner is `tools/live_backend_check.py`. Its setup command creates new disposable records and must not be rerun merely to inspect results. The existing logs are sufficient for reviewing this run. A network failure during a mutation should be investigated by reading current state before retrying.
