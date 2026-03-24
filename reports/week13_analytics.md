# Analytics Dashboard Report

## Goal
Build a real database-backed analytics page for the Risk Anomaly Ops Console that shows reviewer workflow health and model-to-human outcome metrics.

## What shipped
- Added `/analytics` page
- Added real KPI query layer in `lib/analytics.ts`
- Added KPI cards for:
  - flagged rate
  - review completion rate
  - average review turnaround
  - decision mix
  - high-risk precision proxy
  - latest anomaly rate
- Added review funnel visualization:
  1. total events
  2. flagged
  3. reviewed
  4. confirmed issue
  5. escalated
- Added anomaly-rate trend panel for the last 7 active days
- Added dashboard link to analytics
- Added KPI definitions to `README.md`
- Fixed lint blocker in `components/live-score-button.tsx`
- Added explicit `turbopack.root` config to remove workspace-root ambiguity

## Business definitions used
- Reviewed = flagged event with at least one saved review
- Confirmed issue = latest review status is `APPROVED` or `ESCALATED`
- High-risk precision proxy = among reviewed events whose risk score crossed threshold, percent confirmed by latest review

## Why this matters
This makes the project look more like a real internal ops product instead of just a CRUD + ML demo. It now shows:
- reviewer throughput
- queue conversion
- human feedback quality signal
- basic operational monitoring

## Validation
- `npm run lint` passed
- `npm run build` passed
- Manual check passed for:
  - dashboard analytics link
  - analytics page load
  - KPI card rendering
  - funnel rendering
  - anomaly trend rendering

## Good interview framing
Designed and implemented a SQL/Prisma-backed analytics dashboard for a fraud/anomaly review console, including workflow funnel metrics, review turnaround, decision mix, and a human-feedback precision proxy.

## Next logical step
The next phase should focus on deployment polish, demo quality, and resume or portfolio packaging rather than adding more core product surface area.
