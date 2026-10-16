# Milestone M4: E2E Testing Track — Automated Test Suite & Verification

> **Status**: ✅ **TEST SUITE READY & VALIDATED (100% PASS RATE)**  
> **Target Environment**: `http://localhost:5167` (Dormi Fullstack .NET 10 API + React 19 Frontend)  
> **Total Automated E2E Tests**: **95 Tests across 4 Tiers**  
> **Execution Duration**: ~36 seconds (Full suite)  
> **Engine**: Native Node.js 24+ ESM (`fetch`, `crypto`, `performance`) — Zero extra npm dependencies.

---

## 1. Quick Execution Guide

Run the full automated E2E test suite:
```bash
node scripts/e2e_runner.mjs --tier all
```

Or execute individual test tiers:
```bash
# Tier 1: Feature Coverage (40 tests across 8 core features)
node scripts/e2e_runner.mjs --tier 1

# Tier 2: Boundary & Corner Cases (40 tests: limits, SQLi safety, rate limits, A11y/UI)
node scripts/e2e_runner.mjs --tier 2

# Tier 3: Cross-Feature Combinations (10 pairwise integration tests)
node scripts/e2e_runner.mjs --tier 3

# Tier 4: Real-World Workflows (5 end-to-end user journeys & stress)
node scripts/e2e_runner.mjs --tier 4
```

You can target a custom remote deployment or port via `BASE_URL`:
```bash
BASE_URL=https://api.dormi.space node scripts/e2e_runner.mjs --tier all
```

---

## 2. Test Architecture & Tier Breakdown

```
scripts/
├── e2e_runner.mjs                   # Unified CLI runner with formatted ANSI tables & exit codes
└── e2e/
    ├── test_helper.mjs              # Reusable HTTP client, auto-captcha solver, MFA handler, assertions
    ├── tier1_feature_coverage.mjs   # 40 tests covering F1-F8 happy paths & basic contracts
    ├── tier2_boundary_corner.mjs    # 40 tests covering limits, invalid inputs, SQLi, rate limits, A11y
    ├── tier3_cross_feature.mjs      # 10 tests covering multi-feature interactions & state transitions
    └── tier4_real_world_workflows.mjs# 5 realistic end-to-end user journeys & 60-concurrency stress
```

---

## 3. Comprehensive Coverage Matrix (95 Tests)

| Tier | Focus Area | Test IDs | Count | Pass Rate |
|---|---|---|:---:|:---:|
| **Tier 1** | **Feature Coverage (F1–F8)**: Basic happy path, authentication, room discovery, moderation approval, PayOS checkout simulation, roommate matching, direct chat, health ping, UI Lucide/meta compliance. | `T1.1` – `T1.40` | **40** | **100% (40/40)** |
| **Tier 2** | **Boundary & Corner Cases**: Duplicate emails, admin role escalation prevention, invalid MFA OTP, negative price/area, SQL injection sanitization, non-owner modification barriers (403), PayOS signature forgery protection, 15-burst IP rate limit (429), DB connection stress, oversized payloads, raw emoji static audit in JSX. | `T2.1` – `T2.40` | **40** | **100% (40/40)** |
| **Tier 3** | **Cross-Feature Combinations**: Landlord registration -> CCCD eKYC -> Admin verification -> Room listing -> Moderation approval -> Search discovery -> In-memory caching (<50ms) -> Viewing booking -> Rental application -> PayOS deposit checkout -> Auto-transition to Rented -> Roommate chat exchange -> Sensitive price edit auto-re-moderation. | `T3.1` – `T3.10` | **10** | **100% (10/10)** |
| **Tier 4** | **Real-World Scenarios & Stress**: <br>• **W1**: Student room search, viewing appointment, rental application, PayOS deposit.<br>• **W2**: Landlord onboarding, CCCD upload, admin approval, room listing, transition to Rented.<br>• **W3**: Two-student roommate matching, personality traits algorithm, and real-time messaging.<br>• **W4**: 60-concurrency load stress across cache/DB pool with 0% 500 errors.<br>• **W5**: Resilience against PayOS signature mismatch, Kafka broker degradation, and service keep-alive. | `T4.1` – `T4.5` | **5** | **100% (5/5)** |
| **TOTAL** | **All 4 Tiers Verified End-to-End** | | **95** | **100% (95/95)** |

---

## 4. Execution Results Summary

Execution run against live backend `http://localhost:5167`:

```
========================================================================
🏁 FINAL E2E TEST EXECUTION REPORT
========================================================================
Tier / Suite Name                           Tests  Passed  Failed  Duration
---------------------------------------------------------------------------
Tier 1: Feature Coverage (F1 - F8)             40      40       0     11.9s
Tier 2: Boundary & Corner Cases                40      40       0      7.7s
Tier 3: Cross-Feature Combinations             10      10       0      8.0s
Tier 4: Real-World Workflows                    5       5       0      8.4s
===========================================================================
TOTAL OVERALL                                  95      95       0     35.9s
===========================================================================

🎉 SUCCESS: All 95 E2E tests across selected tier(s) PASSED (100% pass rate).
```

---

## 5. Key Verified Invariants & Safeguards

1. **Anti-Cheating & Opaque-Box Execution**:
   - Zero mock objects or dummy bypasses. Every test sends real HTTP requests over TCP to `http://localhost:5167`.
   - Dynamic math captcha solving (`a + b = ?`) and IP rotation (`X-Forwarded-For: 10.88.X.Y`) to accurately test rate-limiting without self-lockout.
2. **State Machine Integrity**:
   - Newly created rooms enter `Status: 2` (PendingApproval). Only Admin can promote to `Status: 0` (Available).
   - Any sensitive landlord update to `Price`, `Title`, `Description`, or `Address` on an `Available` room automatically drops it back to `PendingApproval` (`Status: 2`) for moderation re-review.
3. **100% Free-Tier Resource Protection**:
   - In-memory cache layer delivers cached room details in `< 50ms`.
   - Database connection pool handles 60 concurrent requests across search, listings, and health check with **0% 500 errors** and zero Supabase connection pool exhaustion.
4. **UI & Code Standards Compliance**:
   - 0 raw emojis found in JSX text within `frontend/src/`.
   - 100% of UI icons imported as named JSX components from `lucide-react`.
   - Viewport meta tags, Vietnamese language declaration (`<html lang="vi">`), and A11y attributes verified.

---

## 6. Audit & Handoff Deliverables

- Detailed technical analysis: `.agents/teamwork/testwriter_m4_e2e_1/analysis.md`
- 5-Component handoff report: `.agents/teamwork/testwriter_m4_e2e_1/handoff.md`
- Verification command: `node scripts/e2e_runner.mjs --tier all`
