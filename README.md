# DORMI — Smart Rental, Lease Management & Roommate Matching Platform

> An end-to-end rental ecosystem connecting tenants, landlords, and administrators with authentic verified listings, PostGIS geospatial discovery, intelligent roommate matching, full lease lifecycle management, real-time messaging, and PayOS VietQR automated payment processing.

---

## 📖 Overview

**DORMI** is a modern housing and rental platform developed to solve core pain points in student and young-professional accommodation: inaccurate listings, lack of trust, complex lease and deposit handling, and incompatible roommate pairing.

Built with a decoupled **.NET 10 Web API** backend (Clean Architecture) and a high-performance **React 19 SPA** frontend, DORMI delivers a secure, production-hardened platform featuring multi-tier content moderation, eKYC identity verification, automated VietQR deposit settlement, and real-time SignalR communication.

---

## ✨ Key Features & Capabilities

### 🔍 Geospatial Discovery & Search
- **PostGIS Spatial Queries**: Filter properties by geographic radius, budget, room types, and amenities using `NetTopologySuite` geospatial queries.
- **District Alias Support**: Intelligent search query normalization for Vietnamese administrative units (e.g., `Q.1`, `Q.3`, `Q.7`, `Bình Thạnh`).
- **Interactive Map**: Synchronized map pins, bounding box search, and cluster views via Leaflet.

### 📝 Complete Lease & Post-Rental Lifecycle
- **Rental Applications**: Seamless digital application flow with income/occupancy details and landlord review (`Pending`, `Approved`, `Rejected`).
- **Digital Lease Contracts**: Configurable contract durations with preset terms (6, 12, 24 months), automated deposit and monthly rental payment schedules, and printable PDF contract templates.
- **Maintenance & Issue Ticketing**: Tenant-initiated maintenance requests with priority levels, photo attachments, and landlord resolution tracking.

### 💳 PayOS VietQR Payment Gateway
- **Automated Rental Deposits**: Dynamic VietQR generation for holding deposits and monthly rents with cryptographic SHA256 HMAC webhook verification.
- **Instant Settlement**: Webhook-driven auto-settlement immediately updating payment schedules, generating receipts, and transitioning room states.
- **Landlord Subscriptions**: VIP listing upgrades and recurring subscription packages managed via PayOS checkout.

### 🛡️ Trust, Safety & State Machine Moderation
- **Strict Room State Machine**: Listings enforce `PendingApproval (2) -> Available (0) -> Rented (1) / Hidden (3)`.
- **Sensitive Edit Re-Moderation**: Any landlord modification to sensitive fields (`Price`, `Title`, `Description`, `Address`) on an active room automatically drops it back to `PendingApproval` for administrative re-audit.
- **eKYC & Identity Verification**: Landlord CCCD/business registration verification, verified badges, and trust & safety reporting with admin resolution tools.
- **Bidirectional Reviews**: Room quality reviews from tenants and rental history reviews from landlords.

### 🤝 Intelligent Roommate Matching
- **Compatibility Scoring**: Multi-factor Jaccard compatibility algorithm evaluating lifestyle habits, sleep schedules, cleanliness standards, budget, and personality preferences.
- **Roommate Community Feed**: Dedicated matching board to post roommate requests and connect directly with prospective co-tenants.

### 💬 Real-Time Communication
- **SignalR Instant Messaging**: Low-latency direct messaging between tenants, landlords, and roommates via `/hubs/chat`.
- **Automated Profanity Filtering**: In-transit message sanitization to keep community communications constructive and safe.
- **Live Event Broadcasts**: Real-time moderation triggers (`NewRoomPending`, `RoomModerated`, `RoomStatusUpdated`).

### ⚡ Free-Tier Performance & Resilience
- **In-Memory & Redis Caching**: Sub-50ms p95 latency on `GET /api/rooms/{id}` via caching with sliding expiration.
- **Decoupled View Counting**: Asynchronous room view counting to eliminate write lock contention on room reads.
- **Cloudinary Dynamic Optimization**: Responsive image transformations (`f_auto,q_auto,w_800`) and lazy loading to minimize bandwidth.
- **Supabase Pool Guard**: Strict connection lifetime and pooling constraints (Max Pool Size = 10, Keepalive = 30) preventing pool exhaustion.
- **Render Keep-Alive**: Automated GitHub Actions cron pinging (`keepalive.yml`) to eliminate cold-start latency.

---

## 🏗️ System Architecture & Monorepo Layout

```text
Dormi/
├── backend/
│   ├── Dormi.API/             # Presentation layer: REST controllers, ChatHub, middleware, Program pipeline
│   ├── Dormi.Application/     # Contracts: DTOs, interfaces (IAuthService, IRoomService, IPostRentalService, etc.)
│   ├── Dormi.Domain/          # Domain entities (User, Room, LeaseContract, RentalPaymentSchedule...) and enums
│   ├── Dormi.Infrastructure/  # Service implementations, EF Core PostGIS DbContext, PayOS, Cloudinary, Redis, Kafka
│   └── Dormi.Tests/           # Unit test suite (xUnit, EF Core In-Memory) — 60 automated tests
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components (Modals, cards, navigation, Leaflet maps, 3D viewer)
│   │   ├── layouts/           # MainLayout, AdminLayout, LandlordLayout, TenantLayout
│   │   ├── pages/
│   │   │   ├── public/        # LandingPage, SearchResults, RoomDetail, AuthPage, Terms, Privacy
│   │   │   ├── tenant/        # TenantDashboard, RoommateMatcher, TenantLeases, TenantApplications, Chat
│   │   │   ├── landlord/      # LandlordDashboard, SmartListingForm, RoomManagement, Leases, Viewings, Analytics
│   │   │   ├── admin/         # AdminDashboard, ContentModeration, VerificationModeration, Users, Reports
│   │   │   └── payment/       # PaymentReturn (PayOS return handler & receipt)
│   │   ├── services/          # Axios HTTP client, SignalR connection handlers
│   │   ├── store/             # Zustand global state stores (auth, filters, UI)
│   │   └── utils/             # Helper utilities, image URL optimizers, formatters
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   ├── e2e/                   # Automated E2E test suites across 4 Tiers (95 tests)
│   ├── e2e_runner.mjs         # CLI test runner for E2E suites
│   ├── stress_test.mjs        # 50-100 concurrency load testing
│   └── adversarial_tests_*.mjs# Boundary security and penetration test scripts
├── docker-compose.yml         # Local infrastructure (PostgreSQL 17, Redis, Kafka, Kafka UI)
├── .github/workflows/         # CI/CD and keepalive automation
└── doc/                       # System design and specifications
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Runtime** | [.NET 10 Web API](https://dotnet.microsoft.com/) | High-performance C# RESTful backend |
| **Architecture** | Clean Architecture | Separation of Domain, Application, Infrastructure, Presentation |
| **ORM & Database** | [Entity Framework Core 10](https://docs.microsoft.com/ef/core/) + PostgreSQL | Code-First relational persistence |
| **Geospatial Engine** | [PostGIS](https://postgis.net/) + [NetTopologySuite](https://nettopologysuite.github.io/) | Spatial distance calculations, radius queries, spatial indexing |
| **Authentication** | JWT Bearer (HMAC-SHA256) | Stateless role-based access (`Customer`, `Landlord`, `Admin`) |
| **Real-Time Engine** | [ASP.NET Core SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr) | WebSocket / Long-Polling live chat & notification hubs |
| **Payment Gateway** | [PayOS](https://payos.vn/) VietQR Gateway | VietQR code checkout, SHA256 webhook auto-settlement |
| **Caching Layer** | Distributed Memory Cache / [Redis](https://redis.io/) | Multi-layer caching for room details and rate limiting |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Cloud storage with dynamic format/quality transformations |
| **Event Bus** | [Apache Kafka](https://kafka.apache.org/) (Confluent.Kafka) | Asynchronous notifications and event auditing (optional/degradable) |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Component-driven SPA client |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Lightning-fast HMR and optimized production builds |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first responsive styling (`#00153D` navy, `#F2A900` gold) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) | Lightweight, boilerplate-free state management |
| **Maps & Location** | [Leaflet](https://leafletjs.com/) | Interactive map visualization and room pin clustering |
| **Icons & UI** | [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/), [Sonner](https://sonner.emilkowal.ski/) | 100% JSX icon compliance, fluid animations, toasts |

---

## ⚙️ Service Layer Specifications

| Domain Area | Application Interface | Infrastructure Service | Controller |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | `IAuthService`<br>`IProfileService` | `AuthService`<br>`ProfileService` | `AuthController`<br>`ProfilesController` |
| **Room Listings & Media** | `IRoomService`<br>`IImageService` | `RoomService`<br>`CloudinaryImageService` | `RoomsController`<br>`ImagesController` |
| **Rental Applications** | `IRentalApplicationService` | `RentalApplicationService` | `ApplicationsController` |
| **Lease & Contract Flow** | `ILeaseService` | `LeaseService` | `LeasesController` |
| **Post-Rental & Payments** | `IPostRentalService` | `PostRentalService` | `PostRentalController` |
| **Landlord Hub & Billing** | `ILandlordDashboardService` | `LandlordDashboardService` | `LandlordDashboardController` |
| **Trust, Safety & eKYC** | `ITrustSafetyService` | `TrustSafetyService` | `TrustSafetyController` |
| **Admin Moderation** | `IAdminService` | `AdminService` | `AdminController` |
| **Instant Messaging** | `IMessageService` | `MessageService` | `MessagesController`<br>`ChatHub` (`/hubs/chat`) |
| **Roommate Matching** | `IRoommateService` | `RoommateService` | `RoommatesController` |
| **Viewing Appointments** | `IAppointmentService` | `AppointmentService` | `AppointmentsController` |
| **Saved Favorites** | `IFavoriteService` | `FavoriteService` | `FavoritesController` |
| **Reviews & Reputation** | `IReviewService`<br>`ITenantReviewService` | `ReviewService`<br>`TenantReviewService` | `ReviewsController`<br>`TenantReviewsController` |
| **Notifications & Event Bus** | `INotificationService`<br>`IKafkaProducer` | `NotificationService`<br>`KafkaProducer` | `NotificationsController` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v20.x or higher) & **npm**
- **.NET 10 SDK** (v10.0.x)
- **Docker & Docker Compose** (Optional, for local DB/Redis/Kafka services)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/lqkhanh295/DORMI.git
cd Dormi
```

---

### 2. Infrastructure Setup (Optional Docker)

To run PostgreSQL (PostGIS), Redis, and Kafka locally:
```bash
docker-compose up -d
```
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Kafka UI: `http://localhost:8085`

---

### 3. Backend Setup & Run

1. **Configure Environment**:
   Configure database and provider keys in `backend/Dormi.API/appsettings.json` (or via `appsettings.Local.json`):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=dormi;Username=postgres;Password=postgres;SSL Mode=Prefer;",
       "Redis": "localhost:6379"
     },
     "PayOS": {
       "ClientId": "your-payos-client-id",
       "ApiKey": "your-payos-api-key",
       "ChecksumKey": "your-payos-checksum-key"
     },
     "CloudinarySettings": {
       "CloudName": "your-cloud-name",
       "ApiKey": "your-api-key",
       "ApiSecret": "your-api-secret"
     }
   }
   ```

2. **Launch the API Server**:
   ```bash
   dotnet run --project backend/Dormi.API/Dormi.API.csproj --launch-profile http
   ```
   - **Base API**: `http://localhost:5167`
   - **Swagger OpenAPI Docs**: `http://localhost:5167/swagger`
   - **Health Probe**: `http://localhost:5167/health`
   - **SignalR Chat Hub**: `http://localhost:5167/hubs/chat`

---

### 4. Frontend Setup & Run

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the client application at `http://localhost:5173`.

---

## 🧪 Testing & Quality Assurance

### 1. Backend Unit Tests
Execute the automated .NET test suite:
```bash
dotnet test backend/Dormi.Tests/Dormi.Tests.csproj
```
> **Status**: ✅ **60/60 tests passing** (xUnit, EF In-Memory, covering auth, JWT, room state machine, post-rental, caching, and services).

### 2. End-to-End (E2E) Automated Test Suite
Run the native ESM E2E test runner against a live backend (`http://localhost:5167`):
```bash
# Run all 95 tests across all 4 tiers
node scripts/e2e_runner.mjs --tier all
```
Or execute individual tiers:
- **Tier 1 (Feature Coverage)**: `node scripts/e2e_runner.mjs --tier 1` (40 tests covering F1–F8 happy paths)
- **Tier 2 (Boundary & Corner Cases)**: `node scripts/e2e_runner.mjs --tier 2` (40 tests covering SQLi, rate limiting, permissions)
- **Tier 3 (Cross-Feature Combinations)**: `node scripts/e2e_runner.mjs --tier 3` (10 tests covering full lifecycle state transitions)
- **Tier 4 (Real-World Scenarios & Stress)**: `node scripts/e2e_runner.mjs --tier 4` (5 realistic end-to-end user journeys)

> **Status**: ✅ **95/95 tests passing** (Detailed report in `TEST_READY.md`).

### 3. Load & Adversarial Testing
- **Concurrency Load Stress**: `node scripts/stress_test.mjs` (50–100 concurrent requests with 0% 500 error rate).
- **Adversarial & Injection Testing**: `node scripts/adversarial_tests_1.mjs` & `node scripts/adversarial_tests_2.mjs`.

### 4. Frontend Typecheck & Build
```bash
cd frontend
npm run build
```
> **Status**: ✅ Verified clean production build with Vite code splitting.

---

## 👥 Authors & Academic Context

Developed as part of the **EXE101 — Experiential Entrepreneurship** course project at **FPT University**. Special thanks to all mentors, faculty advisors, and team members contributing to the DORMI ecosystem.
