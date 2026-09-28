#  FleetPulse

**FleetPulse** is a full-stack fleet and transit management platform designed to help transportation teams manage vehicles, drivers, routes, trips, maintenance, expenses, analytics, and operational activities from a centralized dashboard.

The application combines a **Next.js frontend**, **Express.js/TypeScript backend**, **PostgreSQL database**, and **Prisma ORM**, with authentication and role-based access control for different operational users.

🌐 **Live Demo:** https://transit-ops-odoo-one.vercel.app/

---

## ✨ Features

### 📊 Dashboard & Analytics

* Fleet overview and operational KPIs
* Vehicle availability and status tracking
* Driver activity overview
* Revenue and expense metrics
* Fuel-efficiency information
* Maintenance cost tracking
* Visual analytics and charts

### 🚚 Fleet & Vehicle Management

* Vehicle registration and lifecycle management
* Vehicle status tracking
* Manufacturer and vehicle metadata
* Load capacity information
* Odometer tracking
* Trip-related vehicle assignment

### 👤 Driver Management

* Driver registration and onboarding
* Contact and license information
* License expiry tracking
* Driver status management
* Performance and safety information

### 🛣️ Route Management

* Route creation and management
* Source and destination tracking
* Distance and estimated driving time
* Route assignment to trips

### 📋 Trip Dispatch & Scheduling

* Trip creation and scheduling
* Driver and vehicle assignment
* Cargo type and weight tracking
* Odometer records
* Trip status management

### 🔧 Maintenance Management

* Vehicle maintenance records
* Service completion tracking
* Maintenance costs
* Service-center notes
* Maintenance history

### ⛽ Expense & Fuel Tracking

* Fuel logs
* Fuel quantity and cost tracking
* Fuel station information
* Trip-related expenses
* Tolls, food, permits, and miscellaneous expenses

### 🔐 Authentication & Role-Based Access Control

FleetPulse implements role-based access control across both the frontend and backend.

The application supports:

| Role                  | Access                                           |
| --------------------- | ------------------------------------------------ |
| **Admin**             | Full system and user management                  |
| **Fleet Manager**     | Vehicles, drivers, routes, maintenance and trips |
| **Driver**            | Assigned trips and operational activities        |
| **Financial Analyst** | Analytics, expenses and financial reports        |

Authentication is handled using **JWT**, while passwords are securely hashed using **bcryptjs**.

### 🔔 Notifications & Activity Logs

* User notifications
* Operational alerts
* Activity logging
* Create/update/delete audit trails

---

## 🛠️ Tech Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Shadcn UI**
* **React Hook Form**
* **Zod**
* **Axios**
* **Recharts**
* **TanStack Table**

### Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **Prisma**
* **PostgreSQL**
* **JWT**
* **bcryptjs**
* **Zod**
* **Helmet**

---

## 🏗️ Architecture

FleetPulse follows a decoupled full-stack architecture:

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │     Frontend        │
                    │                     │
                    │ React + TypeScript  │
                    │ Tailwind + Shadcn   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express.js API    │
                    │      Backend        │
                    │                     │
                    │ TypeScript + JWT    │
                    │ Zod + Middleware    │
                    └──────────┬──────────┘
                               │
                               │ Prisma
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Database       │
                    └─────────────────────┘
```

---

## 📁 Project Structure

```text
FleetPulse/
│
├── client/                 # Next.js frontend
│   ├── app/                # Application routes and pages
│   ├── components/         # Reusable UI components
│   ├── context/            # Application contexts
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and API configuration
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Environment and database configuration
│   │   ├── controllers/    # API controllers
│   │   ├── db/             # Database seeding
│   │   ├── middlewares/    # Authentication and validation
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Zod validation schemas
│   │   └── utils/          # Backend utilities
│   └── prisma/             # Prisma schema
│
├── docs/                   # Project documentation
│   ├── API.md
│   ├── DATABASE.md
│   ├── ROLES.md
│   └── SETUP.md
│
├── SETUP.md                # Complete setup instructions
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js 18+
* npm
* Git
* PostgreSQL

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/FleetPulse.git

cd FleetPulse
```

---

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=8000
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
NODE_ENV="development"
JWT_SECRET="YOUR_SECURE_JWT_SECRET"
```

Then generate the Prisma client and initialize the database:

```bash
npx prisma generate
npx prisma db push
```

Seed the database:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:8000
```

---

### 3. Configure the frontend

Open another terminal:

```bash
cd client
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Demo Roles

The project includes seeded demo accounts for different operational roles.

| Role              | Purpose                          |
| ----------------- | -------------------------------- |
| Admin             | System and user administration   |
| Fleet Manager     | Fleet and trip operations        |
| Driver            | Assigned trip operations         |
| Financial Analyst | Financial analytics and expenses |

For the exact credentials and setup process, refer to [`SETUP.md`](SETUP.md).

---

## 🔐 Security

FleetPulse includes several security mechanisms:

* JWT-based authentication
* Password hashing with bcryptjs
* Role-based authorization
* Protected frontend routes
* Backend authorization middleware
* Request validation with Zod
* Helmet security headers
* Environment-based configuration

**Never commit `.env`, `.env.local`, database credentials, JWT secrets, or other private configuration files to GitHub.**

---

## 📚 Documentation

Additional project documentation:

* [Setup Guide](SETUP.md)
* [API Documentation](docs/API.md)
* [Database Architecture](docs/DATABASE.md)
* [Role-Based Access Control](docs/ROLES.md)

---

## 👥 Contributors

### Project Contributors

* **[Your Name]** — [Add your actual contribution here]
* **Namrata Gaikwad** — Database design & schema scripting, backend hosting and Bruno environment configuration, dashboard metrics aggregation and UI design
* **Piyush Pardeshi** — Frontend UI development, component composition, backend API routing, schema validation and controller development

> Update the contributor section with each contributor's actual responsibilities.

---

## 📌 Project Highlights

FleetPulse demonstrates practical implementation of:

* Full-stack web application architecture
* REST API development
* Database design and ORM usage
* Authentication and authorization
* Role-based access control
* Form validation
* Data visualization
* CRUD operations
* Fleet and operational data management
* Financial and maintenance tracking
* Modular frontend component architecture

---

## 📄 License

This project is intended for educational and portfolio purposes.
