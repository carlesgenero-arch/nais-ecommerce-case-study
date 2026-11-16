# NAIS — Production E-commerce Engineering Case Study

A production drinks e-commerce application built around practical reliability problems: keeping browser carts consistent with verified purchases, protecting catalogue edits from stale Admin forms, and recovering asynchronous work across database and provider failures.

**Stack:** Angular 21 · TypeScript · Cloudflare · Stripe · Resend

NAIS combines a bilingual storefront, hosted Checkout, an operational backoffice and verification-based newsletter promotions. This case study focuses on the implementation decisions and regression tests behind those workflows.

## My Role & Contributions

**Role:** Sole Developer — Full-Stack E-commerce Project
**Development approach:** AI-assisted software engineering (ChatGPT & OpenAI Codex)

I was the sole developer responsible for delivering NAIS. No other software developers participated. I coordinated the technical implementation, integration, testing and production deployments.

My responsibilities covered:

- **Frontend:** Angular components, reactive state, responsive layouts, accessibility and Catalan/Spanish interfaces.
- **Backend:** Pages Functions, server-side business logic, database integration and API validation.
- **Payments:** Stripe Checkout, payment verification, webhooks and order persistence.
- **Administration:** Product management, fulfillment workflows and operational controls.
- **Asynchronous processing:** Newsletter verification, promotional-code issuance and scheduled email delivery.
- **Delivery:** Automated tests, debugging, UAT validation, Git workflows and production releases.

### AI-Assisted Development

I used ChatGPT and OpenAI Codex throughout development for architectural exploration, code generation, debugging, testing and technical reviews. I directed the implementation, evaluated approaches, coordinated integrations, reviewed validation results and managed deployments.

Sole-developer responsibility does not mean that I manually wrote every line of code. Visual design, photography and brand artwork are not presented as my engineering work.

## Representative Engineering Work

- Correlating cart clearing with the actual Checkout Session while retaining server-side payment verification.
- Resolving prices and availability on the server and persisting purchased order snapshots.
- Using atomic job claims, ownership leases and bounded retries for scheduled processing.
- Rejecting stale catalogue edits before external mutations, with durable operations for recovery.

## Read the Case Study

- [Architecture](docs/architecture.md)
- [Engineering decisions](docs/engineering-decisions.md)
- [Testing and deployment](docs/testing-and-deployment.md)
- [Security and commercial boundaries](docs/security-and-commercial-boundaries.md)
- [Educational checkout integrity example](examples/checkout-integrity/README.md)

## Project Details and Publication Status

- **Portfolio author:** [CONFIRM: preferred professional name.]
- **Project period:** [CONFIRM: development period and commercial launch date.]

This case study includes a standalone [educational cart example](examples/angular-cart-session/README.md), not a runnable storefront. The production repository remains private. Code excerpts and visual material require permission before public distribution; publication conditions are consolidated in [Security and commercial boundaries](docs/security-and-commercial-boundaries.md).
