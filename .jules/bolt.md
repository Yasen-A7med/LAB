# Bolt's Journal ⚡

Critical performance learnings and patterns discovered in this codebase.

## 2026-07-29 - Status Filter & Seat Search Optimization in WebWorker
**Learning:** In large dataset loops (919,396 records in worker), performing string lookups like `CASES[caseIdx] !== opts.statusFilter` and continuing to iterate after finding a unique 7-digit seat number exact match adds unnecessary CPU cycles and memory allocations. Resolving status filter strings to integer index `targetCaseIdx` before the loop and adding early termination for exact seat number matches reduces search latency significantly.
**Action:** Always resolve string lookups to integer index constants outside iteration loops, and add early exits for unique key matches.
