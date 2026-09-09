# DORMI — Smart Rental & Roommate Matching Platform

> An end-to-end rental ecosystem connecting tenants and landlords with interactive 3D virtual room tours, geospatial search, and intelligent roommate matching.

---

## 📖 Overview

**DORMI** is a modern housing and rental management platform designed to streamline accommodation discovery for students, young professionals, and property managers. It eliminates uncertainty in the rental process by integrating in-browser 3D virtual room inspections, location-aware search, compatibility-based roommate matching, and real-time messaging into a unified platform.

---

## ✨ Key Features

- 🔍 **Geospatial Room Discovery**: Search and filter properties by budget, amenities, room types, and geographic radius using PostGIS spatial queries.
- 🕶️ **Virtual 3D Room Tours**: Inspect properties directly in the browser with interactive 3D spatial models powered by Three.js and React Three Fiber.
- 🤝 **Roommate Matching**: Connect with compatible roommates using lifestyle, habit, and personality preference scoring.
- 💬 **Real-Time Communication**: Instant messaging and notification updates between landlords, tenants, and roommates powered by ASP.NET Core SignalR.
- 📅 **Tour Scheduling & Appointments**: Request, manage, and confirm property viewing appointments directly through the platform.
- 📊 **Role-Based Portals**: Dedicated, optimized workflows for **Tenants**, **Landlords** (listing management, appointment tracking), and **Administrators**.
- 🎨 **Design System (v2.1)**: Built on accessible Light Pastel UI standards with Tailwind CSS v4 and smooth Framer Motion transitions.

---

## 🏗️ System Architecture & Tech Stack

The project is architected as a monorepo containing a modern SPA frontend and a Clean Architecture .NET backend:

### **Frontend**
- **Framework & Language**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Maps & Location**: [Leaflet](https://leafletjs.com/)
- **Real-Time Client**: [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr)
- **Animations & Icons**: [Framer Motion](https://www.framer.com/motion/), [Phosphor Icons](https://phosphoricons.com/), [Lucide](https://lucide.dev/)

### **Backend**
- **Framework & Runtime**: [.NET 10 Web API](https://dotnet.microsoft.com/)
- **Architecture**: **Clean Architecture** (`Domain` → `Application` → `Infrastructure` → `API`)
- **ORM & Database**: [Entity Framework Core](https://docs.microsoft.com/ef/core/), [PostgreSQL](https://www.postgresql.org/) with **PostGIS** extension
- **Authentication**: JWT (JSON Web Tokens) with role-based authorization
- **Real-Time Engine**: ASP.NET Core SignalR
- **Media Storage**: Cloudinary integration for image hosting

---

## 📁 Repository Structure

```text
Dormi/
├── backend/
│   ├── Dormi.API/             # Presentation layer: REST controllers, SignalR hubs, program entry
│   ├── Dormi.Application/     # Application logic: DTOs, interfaces, service implementations
│   ├── Dormi.Domain/          # Core business entities and domain models
│   ├── Dormi.Infrastructure/  # EF Core DbContext, migrations, external services (Cloudinary, JWT)
│   ├── Dormi.Tests/           # Unit and integration test suites
│   ├── Dormi.slnx             # Solution configuration
│   └── seed_data_mvp.sql      # Initial MVP database seed script
├── frontend/
│   ├── src/
│   │   ├── assets/            # Static assets and icons
│   │   ├── components/        # Reusable UI components (3D viewer, maps, modals, cards)
│   │   ├── layouts/           # Layout wrappers (Navbar, Sidebar, Footers)
│   │   ├── pages/             # Route views (Auth, Room search/detail, Roommates, Dashboards)
│   │   ├── routes/            # App routing configurations and protected routes
│   │   ├── services/          # HTTP API client and SignalR connection handlers
│   │   ├── store/             # Zustand global state stores (auth, filters, UI)
│   │   └── utils/             # Helper utilities and formatters
│   ├── package.json
│   └── vite.config.ts
└── doc/                       # Design systems and project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** (v18.x or higher) & **npm**
- **.NET 10 SDK** (or .NET 9 if configured locally)
- **PostgreSQL** with the **PostGIS** extension installed
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/lqkhanh295/DORMI.git
cd Dormi
```

---

### 2. Backend Setup

1. **Verify PostgreSQL & PostGIS**:
   Ensure your local PostgreSQL instance is running and has PostGIS enabled.

2. **Configure Connection String**:
   Open [`backend/Dormi.API/appsettings.json`](backend/Dormi.API/appsettings.json) and verify your PostgreSQL credentials:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=127.0.0.1;Database=DORMI;Username=postgres;Password=YOUR_PASSWORD"
   }
   ```

3. **Apply Database Migrations**:
   Run the following commands from the project root:
   ```bash
   cd backend/Dormi.API
   dotnet ef database update
   ```
   *(Optional)* To populate sample listings and mock profiles for testing:
   ```bash
   # Using psql or pgAdmin:
   psql -U postgres -d DORMI -f ../seed_data_mvp.sql
   ```

4. **Run the API**:
   ```bash
   dotnet run
   ```
   The backend API will start at `http://localhost:5167` (or `https://localhost:7167`). Swagger API documentation is available at `/swagger`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   By default, the client points to `http://localhost:5167/api`. To customize, create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5167/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Access the web application at `http://localhost:5173`.

---

## 🛡️ Backend Clean Architecture Layers

| Layer | Responsibility |
| :--- | :--- |
| **`Dormi.Domain`** | Enterprise business rules, core entities (`User`, `Room`, `Appointment`, `Review`, `RoommateProfile`), enums, and domain events. Zero external dependencies. |
| **`Dormi.Application`** | Business use cases, DTOs, mappings, repository interfaces, validation logic, and orchestrations. |
| **`Dormi.Infrastructure`** | Persistence (`AppDbContext`), EF Core configurations, migrations, PostGIS spatial queries, JWT token generation, and Cloudinary media uploading. |
| **`Dormi.API`** | RESTful endpoints, SignalR hubs, authentication middlewares, dependency injection wiring, and API request handling. |

---

## 🧪 Testing & Verification

- **Backend tests**:
  ```bash
  cd backend
  dotnet test
  ```
- **Frontend linting & build**:
  ```bash
  cd frontend
  npm run lint
  npm run build
  ```

---

## 👥 Authors & Acknowledgments

Developed as part of the **EXE101** course project. Special thanks to all contributors and mentors supporting the DORMI ecosystem.
