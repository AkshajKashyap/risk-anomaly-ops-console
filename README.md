# Risk Anomaly Ops Console

A fraud and anomaly review console for triaging flagged events, recording reviewer decisions, and tracking queue health.

Core workflow: `queue -> case detail -> reviewer action -> analytics`

This repo is meant to show the product layer around ML scoring, not just model output. It combines a review queue, case investigation view, reviewer decisions, and database-backed analytics in one app.

## Start Here

- Start the public demo at `/dashboard`
- Open one seeded case from the queue
- Finish at `/analytics` to see queue health and outcome KPIs

You can browse the seeded queue, case detail pages, and analytics without signing in.

Sign-in is only needed for write actions:
- create a demo event
- rerun live scoring
- save a reviewer decision or feedback label

## What This Proves

- End-to-end ML product integration, not just raw model output
- Human-in-the-loop review workflow with persisted decisions
- Database-backed analytics tied to queue health and reviewer outcomes
- Product thinking around case operations, not just a dashboard shell

## Public vs Auth-Only

- Public read-only: `/dashboard`, `/dashboard/events/[eventId]`, `/analytics`
- Auth-only writes: `POST /api/events/ingest-demo`, `POST /api/events/[eventId]/rescore`, `POST /api/reviews`

## Live Scoring Caveat

The seeded read-only demo works on its own. Live scoring is a local demo integration and requires two separate ML service repos to be running.

- Risk service: `RISK_SERVICE_URL` in `.env.local` defaults to `http://127.0.0.1:8001`
- Anomaly service: `ANOMALY_SERVICE_URL` in `.env.local` defaults to `http://127.0.0.1:8002`
- In local development, each service repo may require activating its own `.venv` before running `uvicorn`

Example local startup:

```bash
cd /home/akshaj/code/churn-ensemble
source .venv/bin/activate
uvicorn src.api:app --reload --host 127.0.0.1 --port 8001
```

```bash
cd /home/akshaj/code/flagship2-log-anomaly
source .venv/bin/activate
uvicorn api:app --app-dir src --host 127.0.0.1 --port 8002
```

If those services are offline, the app still supports public read-only evaluation with seeded data, but create/rescore actions will not produce fresh live scores.

## ML Story Note

This project is honest about being a demo integration layer around separate ML services. The ops-console domain is fraud/anomaly review, while the local risk and anomaly backends are adapted service integrations rather than a perfectly domain-native production stack.

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
