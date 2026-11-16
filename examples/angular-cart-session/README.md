# Angular Signals: Cart and Checkout Correlation

**Educational reconstruction — not the original production implementation.**

This small, executable TypeScript example uses real Angular Signals to explore a cart-state bug: a valid confirmation for an older purchase must not clear a newer shopping cart. Products and session identifiers are fictional. There is no storefront, backend, browser storage or provider integration.

## The Engineering Problem

A customer starts Checkout, then changes their cart or begins another purchase. A successful response for the earlier session can arrive later. Checking only that a payment succeeded—or comparing product contents—cannot establish that the current selection belongs to that purchase.

## The Solution

- A private writable signal owns an immutable cart snapshot; a computed signal exposes the total unit count.
- Every actual cart edit creates a new, frozen snapshot and invalidates pending checkout correlation.
- `beginCheckout()` captures the current snapshot before an asynchronous session request.
- `attachSession(attempt, sessionId)` binds the response to that exact attempt. Older attempts cannot overwrite newer ones.
- `applyPaymentResult(result)` clears only for a paid result whose session and pending snapshot match. Clearing consumes the correlation.

Revision and snapshot identity distinguish a new selection even when its product contents match an earlier cart. No-op updates preserve the existing selection.

## Run Locally

Use Node.js 24 LTS (or a version satisfying `package.json`) and npm.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm test
```

The install command downloads public dependencies when not already cached. Tests and type checks make no network requests. To require a cache-only installation, add `--offline`; it will fail rather than contact the registry if a package is missing.

`npm test` compiles the TypeScript through its `pretest` script, then uses Node's built-in test runner. No Angular CLI, DOM emulator or third-party testing framework is required.

## Regression Coverage

Tests cover state updates, runtime snapshot immutability, legitimate clearing, stale confirmations, identical re-created carts, late session responses, superseded attempts, unpaid/mismatched confirmations and invalid quantities.

## Design Trade-Offs

This store uses Angular primitives without dependency injection so the state transitions can run directly in Node. An Angular component can read its public signals; UI rendering is outside this example.

It deliberately keeps correlation in memory. Reloads lose the record and therefore preserve the cart. Cross-tab coordination, persistence failures, expiry, server-side pricing and stock validation are not implemented.

A `paid` value supplied by this API is **not proof of payment**. A real application must obtain that result from an authoritative backend. The client must never decide financial truth from a redirect, URL parameter or local storage. Repeated handling is safe only within this in-memory model; no durable exactly-once guarantee is claimed.

## Dependencies and Publication Boundary

Runtime dependencies are `@angular/core`, its RxJS peer and `tslib`; TypeScript is the only development dependency. Versions are pinned to locally available tooling. They are not asserted to be the newest releases; no online dependency audit was performed for this example.

The implementation is newly written for education. It contains no production source excerpts, client artwork, infrastructure configuration, credentials or customer data. No distribution license is granted here; portfolio publication permissions and third-party licenses still require review. Do not publish `node_modules` or generated `dist` output.
