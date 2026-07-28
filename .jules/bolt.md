# Bolt's Journal ⚡

Critical performance learnings and patterns discovered in this codebase.

## 2026-07-29 - Sub-Filter String Allocation & Numeric Seat Sort Optimization in WebWorker
**Learning:** In large dataset loops (~920k records in worker), creating temporary template literal strings like `${nameNorm} ${seat} ${CASES[caseIdx]} ${degree}` inside candidate loops causes high garbage collection (GC) pressure. Short-circuit `.includes()` checks avoid heap allocations completely. Furthermore, sorting integer seat strings via `localeCompare(..., { numeric: true })` is ~15x slower than direct `parseInt` subtraction.
**Action:** Use short-circuit property checks instead of dynamic string concatenation in hot iteration loops, and use integer subtraction for numeric string IDs in sort comparators.
