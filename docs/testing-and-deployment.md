# Testing and Deployment

## Testing Strategy

NAIS Drinks was developed using automated tests, TypeScript validation and manual verification of critical user flows.

The application includes Angular component and service tests with Vitest, alongside backend tests using the Node.js test runner, local SQLite fixtures and mocked external services.

Key scenarios covered by automated tests include:

- **Shopping cart:** quantity limits, state persistence and protection against outdated Checkout confirmations.
- **Checkout and payments:** invalid requests, product availability, server-side pricing and Stripe webhook validation.
- **Order management:** payment verification, duplicate event handling and order persistence.
- **Asynchronous processing:** concurrent jobs, retries and recovery after interrupted operations.
- **Admin operations:** outdated product edits, concurrent updates and data consistency.
- **Emails:** template rendering, escaping and notification behavior.

Automated tests validate expected behavior under controlled conditions. External integrations also require verification in their configured environments.

## Validation Environments

The project followed three levels of validation.

### 1. Local Development

Before integration or deployment, changes were checked using:

- Automated frontend and backend tests.
- TypeScript type checking.
- Angular production builds.
- Focused regression tests for modified functionality.

### 2. UAT — User Acceptance Testing

A separate Cloudflare environment was used to validate functionality before releasing it to customers.

UAT testing included:

- Browser and responsive checks.
- Stripe Checkout in TEST mode.
- Database migrations and order persistence.
- Admin functionality.
- Transactional email behavior.

### 3. Production

Production releases were performed after the relevant changes had passed local validation and UAT checks.

Release verification included checking the deployed version, database compatibility and critical application flows.

UAT and Production used separate configurations and resources.

## Deployment Architecture

The application uses Cloudflare Pages to host the Angular frontend and Pages Functions for backend APIs.

Additional components include:

- **Cloudflare D1:** SQLite-based database and versioned migrations.
- **Cloudflare Workers:** scheduled background processing.
- **Stripe:** hosted Checkout and payment webhooks.
- **Resend:** transactional email delivery.

Deployments require coordination between application code, database migrations and environment configuration.

The project used Git branches and selective releases to keep development changes separate from Production.

## Engineering Responsibilities

As the sole developer, I coordinated implementation, test validation, integration, debugging and production releases, with assistance from ChatGPT and OpenAI Codex.

The workflow was based on incremental development, automated regression testing and manual UAT verification.

The project does not claim a fully automated CI/CD pipeline. Releases and environment verification were managed manually.
