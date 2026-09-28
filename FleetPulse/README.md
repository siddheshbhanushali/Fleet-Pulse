# FleetPulse

FleetPulse is a comprehensive, production-ready Transit and Fleet Management platform designed to streamline vehicle tracking, driver scheduling, routes planning, maintenance management, and operational expenses.

Built as a high-performance, enterprise-grade platform, FleetPulse delivers a unified control center for fleet operators, financial analysts, and drivers to coordinate day-to-day transport logistics seamlessly.

**🌐 Live Demo (Frontend):** [FleetPulse on Vercel](https://transit-ops-odoo-one.vercel.app/)

---

## 🚀 Key Features

FleetPulse provides modular, role-gated interfaces for managing complex transport networks:

*   **📊 Live Fleet Dashboard:** Aggregate view of core KPIs (active/available/in-shop vehicles, drivers on duty, dispatched trips) and operational finances (total revenue, fuel efficiency in km/L, total maintenance costs).
*   **🚚 Fleet & Vehicle Directory:** Full vehicle lifecycle management, including registration details, max load capacity, manufacturer metadata, odometer updates, and status toggles (*Available*, *In Shop*, *Retired*, *On Trip*).
*   **👤 Driver Registry:** Standardized onboarding for drivers, tracking contact information, driver license categories, license expiry dates, status tracking, and performance/safety scores.
*   **🛣️ Route Optimization:** Route registry defining predefined pathways between sources and destinations, measuring distances, estimating driving hours, and linking routes directly to active trips.
*   **📋 Trip Dispatch & Scheduling:** Dispatch control room to schedule trips, assign drivers and vehicles, record cargo specifications (type and weight), monitor odometer records, and update trip progress states.
*   **🔧 Maintenance Logging:** Service logs to track vehicle maintenance schedules, log completion dates, record maintenance costs, and manage service center notes.
*   **⛽ Expense & Fuel Tracking:** Granular logs tracking fuel top-ups (liters, cost/liter, fueling stations) and miscellaneous trip expenses (tolls, food, permit fees) to compute operational profitability.
*   **🔔 Notifications & Audit Trails:** Real-time user alert dispatch and system-wide activity logs auditing all create, update, and delete actions for security and visibility.

---

## 🛠️ Technology Stack

FleetPulse is architected as a decoupled full-stack application:

### Frontend (`client/`)
*   **Framework:** Next.js 16 (App Router)
*   **Styling:** Tailwind CSS & Shadcn UI (using modern variables and radix-primitives)
*   **State & Queries:** React Hook Form & Zod (validation), Axios (client request runner)
*   **Data Visualization:** Recharts (dynamic charts showing monthly revenue vs. expenses, and vehicle distribution)
*   **Table Layouts:** TanStack Table (with client-side sorting, pagination, and filters)

### Backend (`server/`)
*   **Environment:** Node.js & Express.js (TypeScript)
*   **Database ORM:** Prisma Client
*   **Database:** PostgreSQL
*   **Security:** JWT (JSON Web Tokens) Authentication, bcryptjs password hashing, and Helmet headers protection.
*   **Validation:** Zod schemas for route inputs validation.

---

## 📁 Project Structure

```text
fleetpulse/
├── client/          # Next.js frontend application
├── server/          # Express API backend application & Prisma ORM schema
├── docs/            # Detailed project documentation & guides
├── SETUP.md         # Complete step-by-step setup guide (Neon DB & Local Postgres)
└── README.md
```

---

## 📚 Detailed Documentation

To understand the setup, API structure, database scheme, and security rules, refer to the guides below:

1.  **⚙️ [Developer Setup Guide](docs/SETUP.md)**: Guide on configuring variables, building, seeding, and running the application.
2.  **🗄️ [Database Architecture](docs/DATABASE.md)**: Detailed schema description, tables descriptions, and Entity-Relationship (ER) diagram.
3.  **🛡️ [Role-Based Access Control (RBAC)](docs/ROLES.md)**: Details on route protection rules, user roles, and access matrices.
4.  **🔗 [API Reference Guide](docs/API.md)**: Documentation of Express endpoints and Postman/Bruno collection tests.

---

## 👥 Contributors & Roles

FleetPulse was built with love by:

*   **Namrata Gaikwad**
    *   *Database design & schema scripting*
    *   *Backend hosting and Bruno environment configuration*
    *   *Dashboard metrics aggregation and UI Design*
*   **Piyush Pardeshi**
    *   *Frontend UI development & component composition*
    *   *Backend API routing, schema validations, and controllers development*