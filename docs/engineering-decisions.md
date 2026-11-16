# Engineering Decisions

These cases describe implemented behavior and existing regression tests, not proposed architecture. Source paths identify private evidence; no source code is reproduced.

## 1. An Old Confirmation Must Not Clear a New Cart

**Failure scenario.** A customer revisits a valid paid-order confirmation after starting another cart. Clearing on payment status alone can remove the unrelated selection.

**Constraints.** Payment verification must remain server-authoritative. Identical cart contents do not prove that two purchases are the same. Browser storage can be unavailable, corrupt or changed by another tab.

**Implemented solution.** Before redirecting, the frontend records the server-created Checkout Session with the submitted cart snapshot and creation time. Clearing requires a verified paid order, matching session correlation, a valid pending record, matching current and persisted carts, and a durable acknowledgment. Consuming the correlation prevents repeated confirmation visits from clearing a later cart. Missing or inconsistent correlation preserves the cart.

**Trade-off.** Conservative preservation may leave a purchased cart visible when storage fails; this is preferable to deleting an unrelated selection. Local correlation is not a payment-security control or a distributed transaction.

**Test evidence.** `checkout-result.spec.ts` covers old confirmations, different sessions with identical contents, changed carts and acknowledgment failures. `checkout-cart-hydration.spec.ts` covers fresh application instances, cancelled Checkout and another tab changing persisted state. Implementation: `src/app/services/verified-order-cart.service.ts`.

## 2. Concurrent Scheduled Executions Must Not Own the Same Job

**Failure scenario.** Overlapping scheduled executions can both observe pending work. A crash or uncertain provider response can also leave a job partially processed.

**Constraints.** D1 and external providers cannot commit atomically. Retrying an email or promotion issuance can duplicate an external effect; refusing all retries can strand legitimate work.

**Implemented solution.** Processors use conditional atomic claims with ownership tokens and leases. Follow-up writes check ownership. Persisted attempts and backoff govern retries, while stable provider idempotency parameters and reconciliation reduce duplicate external effects. Expired leases and ambiguous outcomes follow processor-specific recovery rules.

**Trade-off.** Recovery may defer work or require review. These controls do not provide an unconditional exactly-once delivery guarantee.

**Test evidence.** `server/newsletter-outbox.test.mjs` exercises separate concurrent database connections, expired leases, stale owners, retryable provider failures and idempotency-payload consistency. `server/promo-issuance-outbox.test.mjs` covers concurrent issuance and a timeout after provider acceptance followed by reconciliation. Implementation: the newsletter outbox and promotional issuance processors.

**Acceptance is not delivery.** A successful email-provider response records acceptance of the request. It does not prove inbox delivery. Transactional shipping email handling also retains ambiguous or failed state rather than blindly resending.

## 3. Stale Admin Forms Must Not Overwrite Newer Product Changes

**Failure scenario.** An operator saves an old form after another edit or archive operation. Without concurrency checks, the old form could overwrite newer values or reactivate a product.

**Constraints.** An edit can affect D1 and Stripe. Rejecting a conflict only after an external mutation is too late. Operators also need a safe way to resolve interrupted operations.

**Implemented solution.** Expected revisions and operation identities are checked when reserving catalogue work, before Stripe mutation. Durable reservations, execution ownership and conditional finalization protect the write. Repeated operation requests can return the stored result; partial external outcomes use reconciliation.

**Trade-off.** Conflicting forms must reload rather than silently overwrite. This adds recovery state, but avoids pretending that Stripe and D1 share a transaction.

**Test evidence.** `server/catalogue-integrity.test.mjs` covers stale forms and stale reactivation before Stripe calls, concurrent editors, idempotent replay, lost provider responses and zero-row revision conflicts. Implementation: `server/catalogue/product-write.service.ts` and its operation repositories.

## Supporting Boundaries

The browser supplies product identifiers and quantities; the backend owns price and availability validation. Purchased names and amounts are persisted as snapshots, so later catalogue edits do not rewrite order history.

I coordinated implementation, integration, validation and releases as the sole developer, using ChatGPT and OpenAI Codex throughout. These cases do not claim measured business outcomes or independent authorship of every generated line.
