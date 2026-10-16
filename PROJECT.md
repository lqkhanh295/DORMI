# Project: Dormi Fullstack Platform (.NET 10 Web API + React 19 SPA)

## Architecture
- **Backend**: Clean Architecture (.NET 10 Web API, Domain, Application, Infrastructure, API, Tests).
- **Database**: Supabase PostgreSQL (Free Tier Session Mode on port 5432, max 15 direct connections).
- **Frontend**: React 19 SPA, Vite, TypeScript, Tailwind CSS, Lucide-react icons, Leaflet map, SignalR realtime.
- **Storage & CDN**: Cloudinary Free Tier (25GB/month, dynamic transformations).
- **Payment**: PayOS VietQR Gateway (Webhook signature verification with SHA256 HMAC).
- **Deployment**: Render Web Service (Free Tier, 15-min idle spin-down) + Vercel / Cloudflare Pages.

## Feature Inventory
Every feature from the Survey phase is mapped to an assigned milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Supabase Connection Pool Guard | Keepalive=30, Max Pool Size=10, Idle Lifetime=60, 0 pool exhaustion | M1 | Survey Infra/Backend |
| F2 | Render Cold-Start Keep-Alive | Automated cron pinging `GET /` every 10-12 mins to guarantee < 1.5s readiness | M1 | Survey Infra/Backend |
| F3 | Room Detail Read Decoupling & Cache | Decouple `RoomView` synchronous DB insert from `GET /api/rooms/{id}`, cache DTO to drop p95 latency from 5.5s to < 50ms | M1 | Survey Infra |
| F4 | Cloudinary Media Optimization | Remove raw base64 DB fallback, apply responsive transforms (`f_auto,q_auto,w_800`), lazy load | M1 | Survey Frontend/Infra |
| F5 | PayOS Online Rental Deposit | Backend checkout link generation & webhook auto-settlement for rental deposits; Frontend VietQR modal & `/payment/return` route | M2 | Survey Backend/Frontend |
| F6 | Room Lifecycle State Machine | `PendingApproval -> Available -> Rented / Hidden` and automatic re-moderation on sensitive edits | M2 | Survey Backend |
| F7 | Roommate Matching & Chat Link Fix | Fix landlord chat navigation in `RoomDetail.tsx:557` and complete matching UX | M2 | Survey Frontend |
| F8 | Profile & Identity Verification | Landlord & Tenant CCCD/eKYC upload and admin review verification flow | M2 | Survey Frontend/Backend |
| F9 | Frontend Lighthouse Optimization | Google fonts preconnect, SEO meta tags, `robots.txt`, `sitemap.xml`, accessible `aria-label`, caching headers, dead deps removal | M3 | Survey Frontend |
| F10 | Lucide Icon Rule Compliance | Enforce 100% `lucide-react` JSX components, 0 raw emojis in strings | M3 | Survey Frontend |
| F11 | Global Exception & Degradation | RFC 7807 Problem Details, safe in-process fallback when Kafka/third-party services are unavailable | M5 | Survey Backend |
| F12 | Stress Testing Verification | Concurrency 50-100 load verification (`scripts/stress_test.mjs`), 0% 500 error rate, < 100ms p95 latency | M5 | Survey Infra |
| F13 | Comprehensive E2E Testing Suite | Requirement-driven opaque-box test suite across Tiers 1-4, publishing `TEST_READY.md` | M4 | E2E Testing Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Free Tier Infra & Performance Optimization | Keep-alive cron, Room detail cache & write decoupling, Cloudinary responsive images & base64 elimination | none | DONE (Verified: 0 errors, 51/51 tests pass, 50x throughput jump, 0% 500 errors) |
| M2 | Core Business & PayOS Deposit Flow | PayOS rental deposit link & webhook auto-settlement, `/payment/return`, Landlord chat link fix, CCCD verification | M1 | DONE (Verified: 0 errors, 54/54 tests pass, VietQR deposit & webhook auto-settled) |
| M3 | Frontend UX, Mobile Optimization & Lighthouse | Font preconnect, SEO meta tags, sitemap/robots, aria-labels, dead deps pruning, lucide icon audit | none | DONE (Verified: 0 build errors, 0 emoji violations, Lighthouse optimizations applied) |
| M4 | E2E Testing Track Suite Creation | Design & write opaque-box automated test suite (Tiers 1-4), publish `TEST_READY.md` | none (Parallel) | DONE (Verified: 95/95 tests passed, TEST_READY.md published) |
| M5 | Final Integration, 100% E2E Pass & Adversarial Hardening | Phase 1: 100% E2E test suite pass + stress test 50-100 concurrency. Phase 2: Tier 5 adversarial testing | M1, M2, M3, M4 | DONE (Verified: Gate PASS, 2x APPROVE, 2x Challenger APPROVE, Auditor CLEAN) |

## Interface Contracts
### PayOS Rental Deposit Contract
- `POST /api/postrental/leases/{id}/deposit/checkout`:
  - Request: `{ leaseId: string }`
  - Response: `{ checkoutUrl: string, paymentLinkId: string, qrCode: string, orderCode: number, amount: number }`
- `POST /api/payment/webhook` (or existing `LandlordDashboard` webhook extension):
  - Signature validation: SHA256 HMAC using PayOS Checksum Key
  - Event Handling: `orderCode` matching deposit schedule -> update `RentalPaymentSchedule.Status = Paid`, `PaymentDate = UtcNow`, update Room status if configured.
- `GET /payment/return` (Frontend):
  - Handles PayOS redirect with query params (`status=PAID/CANCELLED`, `orderCode=...`) -> displays receipt/status, navigates to lease details.

### Room Cache & View Counter Contract
- `GET /api/rooms/{id}`:
  - Cache key: `room:detail:{id}` with sliding expiration (10 min).
  - View increment: Non-blocking background worker or Redis increment `room:views:{id}` batched flush to DB.

### Cloudinary URL Helper Contract
- Frontend helper `getOptimizedImageUrl(url, { width, height, quality })`:
  - Appends `/f_auto,q_auto,w_{width},c_limit/` if Cloudinary URL, otherwise returns original URL.

## Code Layout
- `backend/Dormi.API/`: Controllers, Program.cs, middleware, config.
- `backend/Dormi.Application/`: DTOs, interfaces, business logic contracts.
- `backend/Dormi.Domain/`: Entities, enums, domain rules.
- `backend/Dormi.Infrastructure/`: EF Core DbContext, PayOSClient, CloudinaryService, Cache, Repositories.
- `backend/Dormi.Tests/`: Unit and integration test suites.
- `frontend/src/`: React 19 components, pages, hooks, services, types.
- `.github/workflows/`: GitHub Actions workflows (including `keepalive.yml`).
- `scripts/`: Testing and automation scripts (`stress_test.mjs`, `e2e/`, `e2e_runner.mjs`, `adversarial_tests_1.mjs`, `adversarial_tests_2.mjs`).
