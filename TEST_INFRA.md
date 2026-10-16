# E2E Test Infra: Dormi Fullstack Platform

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Auth & Security (Register, Login, Lockout, Forgot PW, MFA) | ORIGINAL_REQUEST §R1, R4 | 5 | 5 | ✓ |
| 2 | Room Search & Filter (District, Price, Amenities, Map) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Room Posting & State Machine (PendingApproval, Available, etc.) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | PayOS Deposit & Webhook Auto-Settlement | ORIGINAL_REQUEST §R1, R4 | 5 | 5 | ✓ |
| 5 | Roommate Matching & Communication | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | Free-Tier Infra (Keep-alive, DB pool < 15, Cache, Cloudinary) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Global Exception Handling & Graceful Degradation | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 8 | Frontend UI Rules (Lucide icons JSX, Mobile layout, Lighthouse) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: `node scripts/e2e_runner.mjs`
- Test case format: Standalone runnable Node.js test suites with assertion reporting
- Directory layout: `scripts/e2e/` (Tiers 1-4)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Student finds room by filter, creates PayOS deposit link, verifies payment settlement | F1, F2, F4 | High |
| 2 | Landlord registers, uploads CCCD, posts room -> Admin approves -> Landlord edits price -> triggers re-moderation | F1, F3, F8 | High |
| 3 | Roommate discovery -> filter profile, swipe match, open chat connection | F1, F5 | Medium |
| 4 | High-load concurrent traffic (50-100 users) -> 0% 500 error, DB pool stays within 15 | F1, F6, F7 | High |
| 5 | Third-party timeout / failure resilience: PayOS / Cloudinary timeout handled gracefully | F4, F6, F7 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (8 features x 5 = ≥40 tests)
- Tier 2: ≥5 per feature (8 features x 5 = ≥40 tests)
- Tier 3: pairwise coverage of major feature interactions (≥10 tests)
- Tier 4: ≥5 realistic application scenarios
- Total target: ≥95 automated opaque-box test cases
