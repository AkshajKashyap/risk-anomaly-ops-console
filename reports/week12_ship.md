# Week 12 Ship Report

## Goal
Integrate both ML services into the ops console so new events can be scored live, persisted, and reviewed in the UI.

## What I implemented

### 1. Service configuration
Added environment-based ML service config:
- risk service URL
- anomaly service URL
- anomaly feature schema path
- timeout config
- selected anomaly model

### 2. Adapter layer
Added adapters that convert console events into:
- churn/risk service request payloads
- anomaly service strict feature-schema payloads

### 3. ML client layer
Added backend clients for both services with:
- HTTP calls
- timeout handling
- error handling
- response normalization
- inference logging

### 4. Persistence layer
Added live scoring flow that:
- scores an existing event
- stores latest risk prediction
- stores latest anomaly output
- updates flagged state

### 5. Event creation + live scoring
Added API flow to:
- create a new demo event
- immediately score it with both services
- persist outputs
- open it in the review UI

### 6. UI updates
Dashboard:
- create + live score demo event button

Case detail:
- run live scoring now button
- stored model/version/timestamp/latency display
- refreshed outputs shown in review workflow

## Validation
Manual browser flow worked:
1. opened dashboard
2. created a live-scored demo event
3. landed on the case page
4. saw persisted live outputs
5. reran live scoring successfully
6. returned to dashboard and confirmed event presence

## Outcome
Week 12 moved the app from seeded/mock scoring to live multi-service ML integration.
