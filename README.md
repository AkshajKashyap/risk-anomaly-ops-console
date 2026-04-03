# Risk Anomaly Ops Console

A human-in-the-loop ML product case study for fraud and anomaly operations.

Core workflow: `queue -> case detail -> reviewer action -> analytics`

This project focuses on the systems and product layer that turns model outputs into a usable review workflow: triaging flagged events, recording reviewer decisions, triggering rescoring, and tracking operational outcomes.

## What This Repo Proves

- ML predictions can be operationalized into a reviewer-facing workflow, not just surfaced as raw scores
- flagged events can be turned into reviewable cases with persisted context, decisions, and feedback labels
- external ML services can be integrated through live rescoring hooks and adapter layers
- analytics can be tied to operational outcomes and queue health, not just offline model metrics

If you are skimming quickly: this is an internal ops console that demonstrates ML system integration, human review workflows, and operational analytics.

## Demo In 60 Seconds

- Open the public demo and go to `/dashboard`
- Open one seeded case from the queue
- Finish at `/analytics` to see queue health and outcome KPIs

You can browse the seeded queue, case detail pages, and analytics without signing in.

Sign-in is only required for write actions:
- create a demo event
- rerun live scoring
- save a reviewer decision or feedback label

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

## ML Integration Approach

This repo focuses on the application layer around ML services:

- normalize model outputs into a common case-review workflow
- persist predictions alongside events and reviewer actions
- support rescoring and failure handling
- expose analytics over stored outcomes

The current local ML backends are adapted demo integrations, not a domain-perfect fraud stack. The strongest claim of this repo is that it shows how ML predictions become reviewable cases, persisted decisions, and operational analytics.

## Interview Summary

Short version:

> I built a human-in-the-loop ops console on top of external ML scoring services. The interesting part is how predictions become reviewable cases, persisted decisions, and analytics that reflect operational outcomes.

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
