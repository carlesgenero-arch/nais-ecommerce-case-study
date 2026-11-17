# NAIS — Full-Stack E-commerce Case Study

A production e-commerce application developed for **NAIS Drinks**, covering frontend development, serverless backend APIs, payments, order management and asynchronous processing.

The project combines a bilingual storefront, Stripe Checkout, an administration interface and newsletter functionality.

**Live website:** [naisdrinks.com](https://naisdrinks.com/)

**Project period:** September–November 2026  
**Role:** Sole Full-Stack Developer — Freelance Project

## Technology Stack

**Frontend:** Angular 21 · TypeScript · HTML · CSS · Angular Signals

**Backend:** Cloudflare Pages Functions · Cloudflare Workers · REST APIs

**Database & Storage:** Cloudflare D1 (SQLite) · Cloudflare R2

**Integrations:** Stripe Checkout · Stripe Webhooks · Resend

**Development:** Git · GitHub · Automated Testing · AI-Assisted Development

## My Role & Contributions

I was the sole software developer responsible for delivering the application, from implementation and technical integration to testing and production deployment.

My responsibilities included:

- **Frontend development:** Responsive Angular interfaces, reusable components, shopping-cart state management, accessibility and Catalan/Spanish localization.
- **Backend development:** Serverless APIs, business logic, input validation and database integration.
- **Payments:** Stripe Checkout integration, secure payment verification, webhooks and order persistence.
- **Administration:** Product catalogue management, order management and fulfillment workflows.
- **Background processing:** Newsletter verification, promotional-code issuance and scheduled email processing.
- **Testing and deployment:** Automated regression tests, debugging, UAT validation, Git workflows and production releases.

### AI-Assisted Development

ChatGPT and OpenAI Codex supported the development process through code generation, architectural exploration, debugging, testing and technical reviews.

I directed the implementation, coordinated integrations, evaluated technical decisions, reviewed validation results and managed releases.

This project reflects practical experience delivering and maintaining a production application using AI-assisted software engineering workflows.

## Engineering Challenges

Beyond implementing standard e-commerce functionality, the project involved solving several reliability and data-integrity challenges.

### 1. Shopping Cart Consistency

Preventing an old successful Checkout confirmation from accidentally clearing a newer shopping cart.

The implementation correlates verified Checkout Sessions with the corresponding cart state.

### 2. Secure Checkout and Order Persistence

Ensuring product availability and prices are validated on the server, rather than trusting browser-provided data.

Stripe webhooks provide verified payment information before orders are persisted in D1.

### 3. Reliable Background Processing

Handling asynchronous newsletter and promotional-code operations through scheduled Workers and durable database jobs.

Atomic job claims, ownership controls and retry strategies help manage concurrent execution and external-service failures.

### 4. Safe Administration Updates

Preventing outdated Admin forms from overwriting newer catalogue changes.

Revision checks and controlled operations help maintain consistency between D1 and Stripe.

## Architecture

NAIS uses Angular for the frontend and Cloudflare Pages Functions for backend APIs.

Cloudflare D1 stores application data, R2 stores product images, and scheduled Workers process background jobs. Stripe handles payments, while Resend provides email delivery.

**[Explore the architecture and diagrams](docs/architecture.md)**

## Technical Documentation

- [Architecture](docs/architecture.md) — Technology stack, components and application flows.
- [Engineering Decisions](docs/engineering-decisions.md) — Technical challenges, solutions and trade-offs.
- [Testing and Deployment](docs/testing-and-deployment.md) — Automated testing, UAT and production releases.
- [Security and Commercial Boundaries](docs/security-and-commercial-boundaries.md) — Privacy, security and project ownership.

## Educational Code Examples

The repository includes two standalone educational reconstructions of selected engineering patterns.

These examples are independent of the commercial application and use synthetic data.

**[Angular Cart Session](examples/angular-cart-session/README.md)**

An Angular and TypeScript example demonstrating cart state and Checkout Session correlation.

**[Checkout Integrity](examples/checkout-integrity/README.md)**

A TypeScript backend example demonstrating server-side product validation, authoritative pricing and Checkout request integrity.

Both examples include automated tests and instructions in their respective READMEs.

## Project Ownership

NAIS Drinks is a commercial project developed for a client.

The complete production application and its operational configuration remain private. This repository presents selected architectural decisions, technical documentation and independent educational examples.

---

**Portfolio author:** Carles Generó  
**Live project:** [NAIS Drinks](https://naisdrinks.com/)
