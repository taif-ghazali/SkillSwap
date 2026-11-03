# SkillSwap review and build results

Reviewed 2 November 2026. The original AIA remains unchanged. The prompt and project PDF were used as requirements context, not as independent authorization to deploy, create accounts or claim tests passed. The user's followup confirmed no deployed backend URL and requested preservation of the API contract.

## Deliverables

- `android/SkillSwap_MiniProject_Team_Reviewed.aia`: updated master copy, retaining all six page arrangements, component names, existing procedures, logo, project settings and navigation design.
- `SkillSwap_Backend_Deployment.zip`: backend sources, manifest, deployment instructions and local backend tests.
- `SkillSwap_Web_Build.zip`: compiled existing website. Configure the real backend after deployment; its demo mode remains separate.
- `../backend/DEPLOYMENT.md`: reproducible setup, API contract, checks and APK build steps.

No APK was produced. No local App Inventor compiler/build server or signed-in build session was configured. Source packaging and structural checks do not establish successful App Inventor compilation, Companion behavior or Android device execution.

## Audit and changes

All seven requested procedures (`callApi`, `handleReply`, `showPage`, `slotLine`, `sessionLine`, `updateWallet`, `clearSessionSelection`) and the six required page arrangements were present. Most login, search, publication, selection, booking dialog, cancellation, confirmation and rating handlers were already implemented; these were retained.

| Finding | Change |
| --- | --- |
| Both Android configuration globals were placeholders | Set apiKey to the existing Code.gs value `team-secret-123`; left apiUrl empty with the existing visible configuration error |
| No request gate; selection/navigation could change during a transaction | Added requestBusy and setBusy; disables form buttons/inputs while requesting, ignores list selection until response, releases on reply/error/timeout |
| Replies could dispatch an unrelated action | Check current request URL and returned action before dispatch |
| Profile fields came from local cached values | Load nickname, offers and wants from successful server login; preserve TinyDB identity restore and successful-login save |
| Picker captions were not consistently padded | Format captions as yyyy-MM-dd and HH:mm; retained existing strict transmitted format and future-date client check |
| Session selection could refer to pre-refresh data | Clear selection when mine refresh succeeds |
| Booking/login checks and other mutations could race | Serialize route execution with a script lock, preserving confirm's own lock |
| Expired slots could be booked directly | Validate future session time server-side |
| Publish accepted invalid dates/private or arbitrary venues | Strict calendar/time validation in IST and public-location/online rules |
| Cancellation excluded the exact two-hour boundary | Allow cancellation at least two hours before start |
| Confirmation used separate status/balance/ledger writes | Use one atomic Sheets API batch for the two balances, done status and ledger; reject future-session confirmation and invalid participant balances |
| Rating clamped invalid values and allowed duplicate submissions | Require integer 1-5, completed session, participant and one rating per participant |
| Existing initializer cleared real records | Add idempotent prepareDeployment(); disable setupDatabase(); leave explicit resetDemoDatabase() for disposable demo sheets |
| Website did not compile | Fixed the malformed React import |
| Existing tests combined UTC date with local time | Use consistent local calendar dates in the two relative-time tests |

The Android source uses real webApi requests only. Credit changes remain on the server. API action names, parameters and response envelopes remain unchanged. Some invalid operations that were previously accepted now return the existing `data.error` shape. Enable the Sheets v4 advanced service from the supplied manifest before deployment.

## Validation results

- Website production build: PASS (`npm run build`).
- Existing website mock-service tests: 12/12 PASS. These do not test the backend.
- Actual Code.gs local contract tests: 18/18 PASS using an isolated Apps Script/Sheets adapter, including safe preparation and atomic-service failure/retry behavior.
- AIA structural validator: PASS; 1,005 unique blocks, 22 event handlers, six pages, procedure argument counts, component references, preserved assets/project properties and ZIP integrity. Block names checked against the official MIT block definitions. This is not a compiler.

| Acceptance test | Actual backend source, local adapter | Live API / Android |
| --- | --- | --- |
| T1 new user receives 2 credits | PASS | Not run |
| T2 2 pending bookings exhaust 2 credits | PASS | Not run |
| T3 own-slot booking denied | PASS | Not run |
| T4 cancellation 3 hours before reopens slot | PASS | Not run |
| T5 cancellation 1 hour before rejected | PASS | Not run |
| T6 one confirmation causes no transfer | PASS | Not run |
| T7 both confirmations transfer 1 credit with one ledger entry | PASS | Not run |
| T8 another confirmation cannot transfer again | PASS | Not run |

Additional checks cover existing profile/search/mine/report/dashboard shapes, malformed input, invalid key, future confirmation, expired booking, completed-session ratings, exact cancellation boundary, GET/JSON POST/form POST wrappers, lock release, failed atomic batch retry, idempotent setup and header mismatch rejection. Local tests exercise serialized requests but do not simulate Google's real concurrent execution or quotas.

Live endpoints successfully tested: **none**. No deployment exists. Google Sheets persistence, website/Android shared live database, real service atomicity, redirect handling, offline behavior on device, and the complete six-page Android flow still require deployment and device testing.

## Remaining steps

1. Follow `backend/DEPLOYMENT.md` to copy the backend and manifest into the bound Apps Script project, enable the Sheets advanced service, run prepareDeployment(), and deploy after reviewing permissions.
2. Set the real /exec URL in the reviewed AIA and website; use the same configured key in all three places.
3. Import the reviewed AIA in MIT App Inventor, inspect block warnings, run Companion checks, then build the Android APK and test on two devices.
4. Repeat T1-T8 against a disposable real test deployment and verify all affected sheet rows before using real accounts.

Reproduce local artifacts with `npm test`, `npm run build`, `npm run build:android-source`, and `python tools/validate_android.py` from the project directory. The build script reads the original AIA and backend KEY; after editing configuration in App Inventor, export that configured master separately so regeneration does not replace it with the intentionally unconfigured local copy.

Sources for implementation compatibility: [MIT App Inventor block definitions](https://github.com/mit-cml/appinventor-sources/tree/master/appinventor/blocklyeditor/src/blocks), [Google atomic batch requests](https://developers.google.com/workspace/sheets/api/guides/batch), [Sheets advanced service](https://developers.google.com/apps-script/advanced/sheets), and [MIT APK packaging](https://appinventor.mit.edu/explore/save-your-app). The validator's block-name catalog records names only from the official source; it does not contain a compiler.
