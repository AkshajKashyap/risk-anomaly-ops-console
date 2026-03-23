# Architecture Diagram

```mermaid
flowchart LR
    A[Reviewer in browser] --> B[Next.js App Router UI]
    B --> C[Dashboard]
    B --> D[Case Detail]
    B --> E[Analytics]

    C --> F[POST /api/events/ingest-demo]
    D --> G[POST /api/events/[eventId]/rescore]
    D --> H[POST /api/reviews]
    B --> I[GET /api/health]

    F --> J[createAndScoreDemoEvent]
    G --> K[scoreAndPersistEventById]
    H --> L[Review upsert + feedback label upsert]

    J --> M[Risk ML service]
    J --> N[Anomaly ML service]
    K --> M
    K --> N

    M --> O[ModelPrediction table]
    N --> P[AnomalyOutput table]

    J --> Q[EventItem table]
    K --> Q
    L --> R[ReviewDecision table]
    L --> S[FeedbackLabel table]

    E --> T[Analytics query layer]
    T --> Q
    T --> O
    T --> P
    T --> R
```

## Notes

- `EventItem` is the central case record.
- Risk and anomaly outputs are persisted separately.
- Reviewer actions and feedback labels are stored independently.
- The analytics page reads from persisted database state rather than mocked aggregates.
