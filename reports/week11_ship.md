# Week 11 Ship Report

## Goal
Build the core reviewer workflow for the risk/anomaly ops console:
- review queue
- filter/sort for flagged cases
- case detail page
- reviewer decision persistence
- optional reviewer feedback labels
- end-to-end happy path demo

## What I implemented

### 1. Review persistence model
Updated Prisma schema to support the Week 11 workflow:
- `ReviewDecision.updatedAt`
- `FeedbackLabel.updatedAt`
- unique reviewer/event constraint on review decisions
- unique reviewer/event constraint on feedback labels

Migration created:
- `20260322051753_week11_review_persistence`

### 2. Current reviewer linkage
Added:
- `lib/current-user.ts`

This helper:
- reads the signed-in Clerk user
- looks up the matching DB user
- creates the DB user if it does not exist

### 3. Review action API
Added:
- `app/api/reviews/route.ts`

Supports:
- approve
- reject
- escalate
- optional note
- optional feedback label

Persistence uses Prisma upserts so a reviewer has one current decision and one current label per event.

### 4. Review queue dashboard
Replaced the simple Week 10 dashboard table with a real queue:
- flagged queue view
- status filters
- sort by occurred time, risk score, anomaly score
- status badge
- link into case detail page

File:
- `app/dashboard/page.tsx`

### 5. Case detail page
Added:
- `app/dashboard/events/[eventId]/page.tsx`

Shows:
- risk score
- anomaly score
- confidence
- threshold status
- metadata
- payload JSON
- latest review
- latest feedback label
- reviewer action form

### 6. Shared UI pieces
Added:
- `components/status-badge.tsx`
- `components/review-action-form.tsx`

## Validation completed
Manual browser validation succeeded:
1. opened `/dashboard`
2. opened a flagged case
3. submitted a reviewer decision
4. returned to dashboard
5. confirmed status update persisted

## Current status
Week 11 core workflow is complete enough for demo:
- authenticated reviewer flow works
- DB persistence works
- queue/detail happy path works

## Known limitations
- no pagination yet
- filters use query params only, no richer controls
- latest status is derived from most recent review row
- no full audit trail/history UI yet
- no ML service integration yet, that belongs to Week 12

## Suggested commit
`week11: build core review workflow`
