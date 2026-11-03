# Website integration review — 2 November 2026

Historical review: the permissions blocker below was subsequently resolved. See `LIVE_TRANSACTION_RESULTS.md` for the successful external ping, disposable transaction checks, direct Sheets verification, and remaining time-storage defect.

## Result

The existing website now has a real backend service path and builds successfully. Live integration is **not yet verified end to end**. Nothing was publicly deployed. No backend source, API contract, key, or Android artifact was changed during this website-integration pass. Earlier backend/AIA work remains as it was.

The supplied deployment endpoint is configured privately in the ignored `.env.local`. It contains the endpoint only; no key was added to configuration files or this report. The website continues to use its existing key configuration. No commits or GitHub uploads were made.

## Review findings and implementation

Previously, the backend configuration modal saved URL/key values but every page still called the local mock service. Its “live” badge did not mean transactions were reaching Sheets.

The website now uses a service that selects the live adapter by default. Demo mode requires an explicit choice and stays local. A failed live request never switches to mock data. Supported operations use the unchanged action/parameter contract: login, profile, search, publish, book, cancel, confirm, rate, mine, dashboard and report.

Successful login loads the returned profile, then fetches sessions and balance through mine and open slots through search. Successful transactions refresh these server values. The wallet derives reserved credits from booked learning sessions and never transfers credits in the browser. Inputs are disabled during operations and duplicate mutations are rejected. HTTP errors, invalid envelopes, wrong actions, network failures and timeouts produce errors. A saved action followed by a failed refresh is reported distinctly so the user knows to refresh before retrying.

The endpoint validator accepts both standard and university-domain Apps Script `/exec` formats, rejects lookalike hosts and credential-bearing query strings, encodes parameters, follows redirects, and checks that ping actually returns healthy. Backend settings are activated only after a successful authenticated ping. Fetch errors do not echo authenticated URLs. Login requires an explicit user action after reload; login is never called in the background because it can create an account.

The current API cannot read ledger history, other users' profiles, ratings/reviews, or reciprocal-match inputs. It also does not persist categories, descriptions, bios or rating comments. Live mode displays these limitations, disables unsupported write fields and demo reset controls, and avoids substituting demo history or ratings. Slot discovery uses skill text; category filtering is unavailable in live mode. Supported campus counts use dashboard instead of demo analytics. No history has been fabricated from confirmation responses.

## Validation

| Check | Result | Evidence / limit |
| --- | --- | --- |
| Production website build | PASS | TypeScript and Vite build completed |
| Existing website tests | PASS: 12/12 | Local demo-service tests only |
| New live-adapter tests | PASS: 12/12 | Isolated API/fetch responses; no live writes |
| Existing Code.gs tests | PASS: 18/18 | Local service adapter, not the deployed version |
| Authenticated live ping in signed-in university browser | PASS | Actual JSON: ping, healthy, University of Hyderabad |
| Same exact endpoint outside the Google browser session | FAIL for anonymous connectivity | HTTP 200 HTML; page title “Sign in - Google Accounts”, not API JSON |
| Direct spreadsheet access | PASS after user sign-in | Test database opened; visible Users rows contained headers and no records |
| Full local website browser smoke test | NOT COMPLETED | Available browser could not reach the local development server |
| Login and profile persistence | BLOCKED | Named existing test accounts were not supplied; no users created |
| Discovery and publication | BLOCKED | No authenticated website session / approved test records |
| Booking and cancellation | BLOCKED | No approved learner/tutor accounts or disposable slot |
| Both confirmations and credit transfer | BLOCKED | Same prerequisites; no balances changed |
| Ratings | BLOCKED | No approved completed test session |
| Google Sheets transaction/ledger verification | BLOCKED | No live transaction was performed |

The signed-in ping is proof of authenticated browser connectivity only. It does not prove that the website's cross-origin fetch can access the deployment. The anonymous sign-in response indicates a Google-session access prerequisite on the supplied endpoint. Deployment access and browser CORS must be resolved/verified before transaction testing.

An automatic approval review rejected sending the key to an inferred alternative endpoint because that destination had not been supplied. That alternative was not requested again or contacted; all completed authenticated checks used the exact supplied endpoint.

## Reproduce and continue

Run `npm test` and `npm run build`. Run `npm run dev -- --host 127.0.0.1` for local use. The endpoint is read from `.env.local` unless the browser has an overriding backend setting. Enter the matching existing key through the backend settings if needed; never paste an authenticated URL into source files or documentation. The endpoint is not itself an authentication secret, and Vite includes its configured value in the local build.

Before continuing, verify that the exact deployed endpoint returns authenticated ping JSON in a private browser window with no university Google session. If it requires sign-in, review the web app's access setting with its owner; the direct-fetch architecture expects API access without an interactive Google sign-in. No permissions have been changed by this work. Supply named authorized test users and a disposable session, or explicitly authorize creating test accounts, before database mutation tests.

Use `output/SkillSwap_Web_Build.zip` for the newly compiled website. The earlier `REVIEW_AND_BUILD.md` describes the previous phase; this report supersedes its website integration status. Android APK compilation is outside this website-only pass.
