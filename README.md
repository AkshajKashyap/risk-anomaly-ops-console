# Risk Anomaly Ops Console

A full-stack fraud and anomaly review console built with Next.js, Prisma, PostgreSQL, Clerk authentication, and two live ML services.

This project simulates an internal operations workflow:
- ingest or create a demo event
- score it with a risk model and an anomaly model
- persist model outputs
- flag high-risk cases
- let a reviewer approve, reject, or escalate
- track workflow KPIs in an analytics dashboard

## What this project demonstrates

- End-to-end ML product integration, not just model training
- Human-in-the-loop review workflow
- Real database-backed analytics
- Production-style route hardening with loading, error, and empty states
- Clean project story for demos, resume bullets, and GitHub review

## Core features

### Review queue
The dashboard shows flagged events, latest review status, risk score, anomaly score, and direct links into case detail.

### Case detail
Each case page shows:
- event metadata
- stored risk model output
- stored anomaly model output
- latest reviewer decision
- latest feedback label
- ability to trigger live rescoring
- ability to save a reviewer action

### Live ML scoring
The app calls two services:
- risk service
- anomaly service

It normalizes responses, persists predictions, and updates whether an event is flagged.

### Analytics dashboard
The `/analytics` page is backed by real database queries and includes:
- flagged rate
- review completion rate
- average review turnaround
- decision mix
- high-risk precision proxy
- latest anomaly rate
- review funnel
- anomaly-rate trend

## Tech stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Tailwind CSS
- External ML service integration over HTTP

## Architecture

See the diagram in [`docs/architecture.md`](docs/architecture.md).

## Key API routes

- `GET /api/health`
- `POST /api/events/ingest-demo`
- `POST /api/events/[eventId]/rescore`
- `POST /api/reviews`

## KPI definitions

- **Flagged rate**: flagged events / total events
- **Review completion rate**: reviewed flagged events / flagged events
- **Average review turnaround time**: average hours from event creation to latest review decision
- **Decision mix**: percent approved / rejected / escalated among reviewed flagged events
- **High-risk precision proxy**: among reviewed events whose risk score crossed threshold, percent confirmed by the latest review
- **Confirmed issue**: latest review status is `APPROVED` or `ESCALATED`

### Review funnel

1. Total events
2. Flagged
3. Reviewed
4. Confirmed issue
5. Escalated

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Create `.env.local` with your database, Clerk, and ML service configuration.

Typical values include:

- `DATABASE_URL`
- Clerk auth keys
- risk service base URL
- anomaly service base URL

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo flow

1. Sign in
2. Open the review queue at `/dashboard`
3. Create a demo event
4. Inspect the case detail page
5. Run live scoring if needed
6. Save a reviewer action
7. Open `/analytics`
8. Inspect KPI cards, funnel, and anomaly trend

A talk track is included in [`docs/demo-script.md`](docs/demo-script.md).

## Health check

The health route returns:

- app status
- database connectivity status
- total event count
- flagged event count

## Why this project is strong for interviews

This is not just a model notebook or dashboard mockup. It shows:

- ML inference integration
- backend persistence
- reviewer operations workflow
- analytics tied to human feedback
- product thinking around queue health and decision quality

## Current status

- Week 12: live ML scoring + review workflow
- Week 13: analytics dashboard
- Week 14: hardening, docs, demo, deployment polish

## Next steps

- deploy publicly
- create a short demo video
- add seeded demo-user instructions
- polish architecture visuals for portfolio use
