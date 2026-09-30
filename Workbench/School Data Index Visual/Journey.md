# Journey log

## 2026-09-30

1. Reviewed the requirements in Spec-V2.md and the available school dataset file.
2. Confirmed the app must use Next.js, live under a fresh folder in Workbench, and include search, pagination, a chart, and source attribution.
3. Created a new app in `Workbench/version-3` using a fresh Next.js scaffold.
4. Added a server-side CSV loader that reads the school data from `Data/Elevate-215/Elevate-215_School-Data.csv` and converts it into structured records.
5. Built a client-side table with search, rows-per-page controls, a page navigator, and a performance chart using the available metrics.
6. Updated the app README with local run instructions and saved this walkthrough to the journey log.
7. Verified the app builds and serves locally, then stopped the application as required after validation.

## Notes

- The dataset does not include year-over-year time series for every school, so the chart shows a subject-based performance snapshot based on the available 2025 metrics.
- The app remains front-end only and does not expose backend or security-critical configuration.
