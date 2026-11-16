# Testing and Deployment

## Local Automated Evidence

The private application uses Angular component/service tests with Vitest and backend suites with the Node.js test runner, local SQLite fixtures and injected or mocked provider clients.

Representative scenarios include:

- Old paid confirmations, missing correlation, storage failures and cross-tab cart changes.
- Invalid Checkout inputs, unavailable products and mismatched provider pricing.
- Invalid webhook signatures, unpaid sessions and duplicate order persistence.
- Competing job claims, expired leases, stale owners and ambiguous provider responses.
- Stale catalogue revisions, concurrent edits, idempotent replay and recovery after partial failure.
- Customer-provided content escaping in rendered email templates.

Tests demonstrate behavior under their controlled inputs. Mocked clients do not establish that deployed service bindings, credentials, sender settings or provider accounts are correct. Tests using local database fixtures are not evidence of a Production restore drill.

## Three Validation Levels

**Local automated validation:** focused regression suites, strict TypeScript checks, Angular template compilation and a production build. Local runtime integration tests, where used, validate that runtime setup only.

**UAT validation:** a separately configured environment for browser checks and environment-dependent integrations. A UAT pass does not establish Production binding or credential correctness.

**Production verification:** release-specific confirmation of the active artifact and effective configuration, followed by authorized checks of live behavior. The project owner coordinated UAT validation and production deployments; this document does not assert that every failure scenario was exercised live.

Release date: November 10th 2026

## Private Application Commands

These commands belong to the original application and cannot run from the portfolio root. The two standalone educational code examples have their own automated tests and execution instructions in their respective READMEs.

```sh
npm ci
npm test -- --watch=false
npm run check:server
npm run test:checkout
npm run test:webhook
npm run test:orders
npm run test:promo
npm run build
```

Additional Node.js suites cover newsletter delivery, promotional issuance and catalogue operations. The commands above are not an exhaustive backend validation list. No test count, coverage percentage or performance metric is claimed.

## Deployment and Release Responsibilities

Pages serves the Angular build and Functions. Scheduled Workers are deployed separately. Database migrations, secrets, bindings and environment variables are explicit dependencies; rebuilding the frontend does not validate or update all of them.

I coordinated technical integration, test review, Git release workflows and production deployments. Release work included selective changes, checking configuration drift and keeping UAT and Production separate. This describes human-managed engineering work, not an automated release guarantee.

No versioned GitHub Actions workflows were found at the reviewed baseline. This case study does not claim an automated test pipeline, automated promotion or end-to-end CI/CD.

Code rollback, database recovery and external payment/email reconciliation are distinct operations. Restoring an application version does not undo external side effects or restore database state.
