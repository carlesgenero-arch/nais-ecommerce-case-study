# Checkout Integrity: Server-Authoritative Validation

**Generic educational reconstruction — not production NAIS code.**

This independently executable TypeScript backend example uses a fictional stationery catalogue and a fake session creator. It has no runtime package dependencies, HTTP server, payment integration or network calls.

## Threat and Trust Boundary

A client can change its cart request, including prices, quantities, currency and availability flags. Browser validation cannot establish what should be charged.

The entry point accepts `unknown` decoded JSON. The only allowed shape is:

```json
{
  "items": [
    { "productId": "orbit-notebook", "quantity": 2 },
    { "productId": "cedar-pencil-set", "quantity": 1 }
  ]
}
```

The server resolves that request to USD 20.15 (2015 minor units). Product names, prices, currency and availability all come from the server-owned fictional catalogue. Client-supplied pricing fields are rejected, not trusted or silently accepted.

## Implementation Decisions

- `src/catalog.ts`: private catalogue map with frozen product records and one supported currency.
- `src/checkout.ts`: exact payload validation, product/availability resolution and integer arithmetic before session creation.
- `src/fake-session.ts`: records resolved quotes and returns synthetic session identifiers; it never takes payment.
- `tests/checkout.test.mjs`: Node's built-in test runner; no third-party test framework.

The demo allows up to eight lines and twelve units per product. Duplicate products are rejected explicitly rather than merged or clamped. These are educational limits, not production business rules.

All money uses non-negative safe integers in the currency's minor unit. Multiplication and accumulation are checked; no floating-point currency parsing or client-total comparison is needed. The complete quote and its lines are frozen before being passed to the fake creator.

## Run

Use Node.js 24 LTS (minimum declared version: Node.js 22) and npm.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm test
```

A normal install contacts the public package registry unless its cache is sufficient. Add `--offline` to require cache-only installation. TypeScript is the sole development dependency and is pinned in the lockfile; there are no runtime dependencies.

`npm run check` performs strict TypeScript validation. `npm test` first compiles through `pretest`, then executes every example test. Tests make no external requests.

## Tests and Deliberate Limitations

Tests cover valid totals, maximum quantity, malformed payloads, invalid quantities, unavailable and unknown products, duplicate lines, price/currency manipulation, immutable quotes and session-creation failure.

This is a validation example, not a complete secure checkout service. HTTP body limits, authentication, rate limiting, inventory reservations, shipping, taxes, discounts, persistent idempotency and payment webhooks are deliberately excluded. Catalogue availability is a check, not a stock reservation. The fake session ID is not evidence of payment.

No production source, assets, credentials, operational identifiers or customer data are included. No online dependency audit or production-readiness claim is made. Publication permissions and third-party licenses still require review; no distribution license is added.
