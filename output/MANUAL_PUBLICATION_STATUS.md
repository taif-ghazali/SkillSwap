# Manual production publication status

**Published and verified on 3 November 2026.** [Public SkillSwap website](https://skillswap-uoh-campus.spicy-gnome-6144.chatgpt.site). Hosting version 1, deployment `appgdep_6aea07c5b17c8191836469c97f82bb6d`, succeeded with runtime configuration revision 1. Anonymous `/login` and its JavaScript returned HTTP 200; the bundle contains the marketplace entry point. A public same-origin API ping returned `healthy` from the production backend. No login or registration was submitted and no production test data was created.

Production Apps Script Version 1: https://script.google.com/macros/s/AKfycbwtRFTbUZZrLX73aj39NUMU42B9I5ObUWGMrn91Wq3RWN5rvmgulMHwdTT7CJpX-3y2YA/exec. Deployment version confirmed by the user's editor screenshot. The distinct production spreadsheet ID below is embedded in the prepared backend. Neither spreadsheet's sharing settings were changed by this publication.

The preparation history below records the state before deployment.

Prepared on 3 November 2026. No further clasp/OAuth attempts. No browser automation used for this pass.

- Existing production spreadsheet: `190vT9WqEuo-JC7qY1ojLSlKZsNnsjs9zoJ8dfEG8afY`; not recreated.
- Private package: `.production.local/SkillSwap_Production_Backend.zip`.
- Editor files: `Code.gs`, `PrepareDeployment.gs`, `appsscript.json`.
- Steps: `.production.local/MANUAL_DEPLOYMENT.md`.
- Validation: backend differs from tested V2 source only in fresh credential and explicit production spreadsheet binding. No QA ID; no demo/reset source included.
- Separate website: `production-site/`. TypeScript/Vite production build PASS.
- Hosting artifact: `production-site/dist/server/index.js`, embedded frontend plus same-origin API proxy.
- Local verification PASS: SPA routing, missing-asset 404, missing-backend 503, stubbed ping transport, server-key override protection, cross-origin rejection, absence of production key and QA endpoint from deployable output. No live requests made.
- Registered Sites project: `appgprj_6ae9f800768c81919f237a5e2fac5e36`, persisted in `production-site/.openai/hosting.json`. No version deployed; no public URL yet.
- Server runtime settings required: `APPS_SCRIPT_URL`, `APPS_SCRIPT_KEY`. The key is retained locally, not included in frontend or Worker source. No local-storage QA override or demo-mode fallback in production.
- QA backend/deployment/data and Android untouched. Rating and ledger display issues deferred unchanged.

Required user action: follow the private manual instructions and return the production /exec URL and actual deployment version. Do not send the key. If Google blocks editor authorization or Anyone access, report the exact error.

Then configure server runtime values, synchronize the sanitized source using the Sites helper, save and publish publicly, and verify the actual public URL and production ping. Do not publish with the QA endpoint or missing production configuration.

Known identity limitation: existing login restricts email suffix but does not verify mailbox ownership. Hiding the shared credential does not add university SSO.
