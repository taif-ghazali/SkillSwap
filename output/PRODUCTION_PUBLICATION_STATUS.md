# Production publication status — 3 November 2026

**Superseded by MANUAL_PUBLICATION_STATUS.md. University policy blocked CLI OAuth; do not follow the login instructions below.**

Local-first workflow; no browser automation used for this pass.

- Existing production spreadsheet: `190vT9WqEuo-JC7qY1ojLSlKZsNnsjs9zoJ8dfEG8afY` (reused, not recreated).
- QA spreadsheet and records: untouched.
- Google Apps Script CLI: 3.4.1 available through npm exec on the host.
- `clasp show-authorized-user`: **Not logged in.** No saved default clasp or application-default credentials were found.
- Backend prepared by `node tools/prepare_production.mjs` in ignored `.production.local/`.
- Preparation retains the tested implementation, substitutes a fresh production key, and uses the explicit production spreadsheet ID. It excludes InitSheet/demo seeding code. The preparation routine is non-destructive and inserts headers only when run against Google.
- Credential and generated backend are Git-ignored. The preparation script never prints the credential and preserves it on subsequent runs.
- Website build: PASS. This build still uses existing local configuration; it is **not** a production-connected release and was not published.
- Production script creation, schema initialization, permission verification, Web App deployment and hosting publication: pending authorization.
- Deferred rating and ledger display issues: unchanged.

## Required user authorization

From a normal PowerShell terminal, run:

```powershell
npm exec --yes --package=@google/clasp -- clasp login
```

Sign in with the university Google account that owns SkillSwap_Production. Keep OAuth tokens and authorization codes out of chat. If the Apps Script API is disabled, enable it at https://script.google.com/home/usersettings.

After login, verify the authorized identity and reconcile existing Apps Script projects before creating a new one: the earlier browser flow may have created a bound project. Reuse an existing production project if present. Push only the isolated production files, initialize the empty schema, obtain required execution authorization, and deploy the Web App. Record the actual script ID, version and /exec endpoint; do not infer them.

The frontend currently sends a shared API key from the browser. Keep the new credential out of the published JavaScript bundle by using a server-side hosting proxy before publication. Do not publish the existing QA-configured dist directory. Public mailbox ownership verification is not supplied by the existing email-suffix login contract.

Publish only after the production backend is reachable, and verify the actual public URL against that backend. No public URL or production endpoint exists from this pass.
