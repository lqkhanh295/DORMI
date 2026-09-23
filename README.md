# DORMI — Smart Rental & Roommate Matching Platform

> An end-to-end rental ecosystem connecting tenants and landlords with interactive 3D virtual room tours, geospatial search, intelligent roommate matching, and real-time moderation.

---

## 📖 Overview

**DORMI** is a modern housing and rental management platform designed to streamline accommodation discovery for students, young professionals, and property managers. It eliminates uncertainty in the rental process by integrating in-browser 3D virtual room inspections, location-aware search, compatibility-based roommate matching, and real-time messaging into a unified platform.

---

## ✨ Key Features

- 🔍 **Geospatial Room Discovery**: Search and filter properties by budget, amenities, room types, and geographic radius using PostgreSQL **PostGIS** spatial queries.
- 🕶️ **Virtual 3D Room Tours**: Inspect properties directly in the browser with interactive 3D spatial models powered by Three.js and React Three Fiber.
- 🤝 **Roommate Matching (Jaccard Compatibility)**: Connect with compatible roommates using lifestyle, habit, budget, and personality preference scoring.
- 💬 **Real-Time Communication & Live Moderation**: 
  - Instant messaging between landlords, tenants, and roommates powered by ASP.NET Core SignalR.
  - Real-time room submission and moderation broadcast events (`NewRoomPending`, `RoomModerated`, `RoomStatusUpdated`).
- 📅 **Tour Scheduling & Appointments**: Request, manage, and confirm property viewing appointments directly through the platform.
- 💳 **Landlord Subscriptions & Billing**: VIP listing upgrades and subscription packages integrated with VNPay Sandbox (HMAC-SHA512 checksum security).
- 🛡️ **Identity Verification & Reputation System**: Landlord CCCD/business registration verification, verified badges, and bidirectional reviews (room reviews and tenant history reviews).
- 📊 **Role-Based Portals**: Dedicated workflows for **Tenants**, **Landlords** (listing management, lead analytics, conversion tracking), and **Administrators** (content moderation, verification review, system statistics).
- 🎨 **Authentic Design System**: Built on a clean, responsive light aesthetic (`#00153D` brand navy, `#F2A900` gold accent), Tailwind CSS v4, Framer Motion, and standard `lucide-react` JSX components.

---

## 🏗️ System Architecture & Tech Stack

The project is structured as a monorepo containing a high-performance Single Page Application (SPA) frontend and a Clean Architecture .NET backend with a decoupled Service Layer:

```text
Dormi/
├── backend/
│   ├── Dormi.API/             # Presentation layer: Pure REST controllers (BaseApiController), SignalR hubs, program pipeline
│   ├── Dormi.Application/     # Application contracts: ServiceResult pattern, DTOs, Service interfaces (IAuthService, IRoomService, etc.)
│   ├── Dormi.Domain/          # Core enterprise entities (User, Room, Message, LeaseContract...) and Enums (UserRole, RoomStatus)
│   ├── Dormi.Infrastructure/  # Service implementations (AuthService, RoomService...), EF Core DbContext, PostGIS, Cloudinary, JWT
│   └── Dormi.Tests/           # Automated unit test suite (xUnit, EF In-Memory)
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components (GlobalNav, GlobalFooter, 3D viewer, maps, modals, cards)
│   │   ├── layouts/           # MainLayout and dashboard layouts
│   │   ├── pages/             # Public, Auth, Landlord, Tenant, and Admin views
│   │   ├── services/          # Axios HTTP API client and SignalR connection handlers
│   │   ├── store/             # Zustand global state stores (auth, filters, UI)
│   │   └── utils/             # Helper utilities and formatters
│   ├── package.json
│   └── vite.config.ts
└── doc/                       # Design system and technical documentation
```

### **Backend Technologies**
- **Framework & Runtime**: [.NET 10 Web API](https://dotnet.microsoft.com/)
- **Architecture**: **Clean Architecture with Decoupled Service Layer**
  - **Controllers**: Strictly handle HTTP routing, parameter binding, claims extraction, and returning HTTP responses via `HandleResult()`.
  - **Services**: Encapsulate 100% of business logic, database queries, calculations, external APIs, and real-time SignalR notifications.
  - **Result Pattern**: Standardized `ServiceResult<T>` and `ServiceResult` for consistent status codes and error handling.
- **ORM & Database**: [Entity Framework Core](https://docs.microsoft.com/ef/core/) with [Npgsql](https://www.npgsql.org/) and [PostGIS](https://postgis.net/) (hosted on Supabase PostgreSQL)
- **Spatial Calculations**: `NetTopologySuite` for accurate geospatial point distance queries.
- **Authentication**: JWT Bearer Tokens (HMAC-SHA256, 24-hour expiration) with role-based policies (`Customer`, `Landlord`, `Admin`).
- **Real-Time Engine**: ASP.NET Core SignalR (`/hubs/chat`).
- **Media CDN**: Cloudinary integration for room and identity document image uploads.

### **Frontend Technologies**
- **Framework & Language**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Icons & Animation**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)

---

## ⚙️ Service Layer Specifications

| Domain Area | Application Interface | Infrastructure Implementation | Controller |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | `IAuthService`<br>`IProfileService` | `AuthService`<br>`ProfileService` | `AuthController`<br>`ProfilesController` |
| **Room Listings & Media** | `IRoomService` | `RoomService` | `RoomsController`<br>`ImagesController` |
| **Landlord Hub & Billing** | `ILandlordDashboardService` | `LandlordDashboardService` | `LandlordDashboardController` |
| **Admin Moderation** | `IAdminService` | `AdminService` | `AdminController` |
| **Instant Messaging** | `IMessageService` | `MessageService` | `MessagesController` |
| **Roommate Matching** | `IRoommateService` | `RoommateService` | `RoommatesController` |
| **Viewing Appointments** | `IAppointmentService` | `AppointmentService` | `AppointmentsController` |
| **Saved Favorites** | `IFavoriteService` | `FavoriteService` | `FavoritesController` |
| **Reviews & Feedback** | `IReviewService`<br>`ITenantReviewService` | `ReviewService`<br>`TenantReviewService` | `ReviewsController`<br>`TenantReviewsController` |
| **System Notifications** | `INotificationService` | `NotificationService` | `NotificationsController` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **.NET 10 SDK**
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/lqkhanh295/DORMI.git
cd Dormi
```

---

### 2. Backend Setup & Run

1. **Configure Connection**:
   The backend connects to PostgreSQL with PostGIS enabled. Configure credentials in `backend/Dormi.API/appsettings.json` (or via environment variables in production):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=aws-0-ap-south-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.<project_ref>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true;"
   }
   ```

2. **Run the API Server**:
   ```bash
   dotnet run --project backend/Dormi.API/Dormi.API.csproj --launch-profile http
   ```
   - **API Base URL**: `http://localhost:5167`
   - **Swagger API Docs**: `http://localhost:5167/swagger`
   - **SignalR Hub**: `http://localhost:5167/hubs/chat`

---

### 3. Frontend Setup & Run

1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

2. *(Optional)* Configure `.env`:
   ```env
   VITE_API_URL=http://localhost:5167/api
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Access the client application at `http://localhost:5173`.

---

## 🧪 Testing & Verification

- **Run Backend Unit & Integration Tests**:
  ```bash
  dotnet test backend/Dormi.Tests/Dormi.Tests.csproj
  ```
  *(Status: 14/14 automated tests passing)*

- **Verify Frontend Build & Typecheck**:
  ```bash
  cd frontend
  npm run build
  ```

---

## 👥 Authors & Academic Context

Developed as part of the **EXE101 — Experiential Entrepreneurship** course project. Special thanks to all mentors, faculty advisors, and team members contributing to the DORMI ecosystem.
