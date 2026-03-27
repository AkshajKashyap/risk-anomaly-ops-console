# Risk Anomaly Ops Console

A fraud and anomaly review console for triaging flagged events, recording reviewer decisions, and tracking queue health.

Core workflow: `queue -> case detail -> reviewer action -> analytics`

This repo is meant to show the product layer around ML scoring, not just model output. It combines a review queue, case investigation view, reviewer decisions, and database-backed analytics in one app.

## What to look at

- `/dashboard` for the flagged review queue
- `/dashboard/events/[eventId]` for case detail and reviewer action
- `/analytics` for queue health and outcome KPIs

## How to evaluate this project

1. Open the dashboard and scan the flagged queue.
2. Open a case to inspect stored scores, event metadata, and the latest review state.
3. Finish in analytics to see how reviewer actions roll up into operational metrics.

## What this project demonstrates

- End-to-end ML product integration, not just model output
- Human-in-the-loop review workflow with persisted decisions
- Database-backed analytics tied to queue health and reviewer outcomes
- Product thinking around case operations, not just dashboards

## Core features

- Review queue with flagged events, model scores, and latest review status
- Case detail with event metadata, stored risk and anomaly outputs, rescoring, and reviewer actions
- Analytics dashboard with queue, turnaround, and decision-quality KPIs

## KPI definitions

- `Flagged rate`: flagged events / total events
- `Review completion rate`: reviewed flagged events / flagged events
- `Average review turnaround`: average time from event creation to latest review decision
- `Decision mix`: approved / rejected / escalated share among reviewed flagged events
- `High-risk precision proxy`: reviewed high-risk cases confirmed by the latest review

## Health and key routes

- `GET /api/health` for app and database status
- `POST /api/events/[eventId]/rescore` to refresh stored model outputs
- `POST /api/reviews` to persist reviewer actions

## Tech stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Tailwind CSS
- External ML service integration over HTTP

## Local setup

```bash
npm install
```

Create `.env.local` with your database, Clerk, and ML service configuration.

- `DATABASE_URL`
- Clerk auth keys
- risk service base URL
- anomaly service base URL
- optional `ANOMALY_FEATURE_SCHEMA_PATH` override, otherwise the app uses `artifacts/feature_schema.json`

```bash
npm run dev
```

Open `http://localhost:3000`.

## Architecture

See [`docs/architecture.md`](docs/architecture.md).
