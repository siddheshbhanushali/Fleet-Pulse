# 🚀 Complete FleetPulse Setup Guide

Welcome to **FleetPulse**! This guide provides an end-to-end, beginner-friendly walkthrough for setting up FleetPulse from scratch on **macOS**, **Windows**, or **Linux**, using either a **Cloud Neon Database** (Recommended) or a **Local PostgreSQL Database**.

---

## 📋 Table of Contents
1. [Prerequisites](#-1-prerequisites)
2. [Database Setup (Choose Option A or B)](#-2-database-setup)
   - [Option A: Cloud Database via Neon PostgreSQL (Recommended)](#option-a-cloud-database-via-neon-postgresql-recommended)
   - [Option B: Local PostgreSQL Database Installation](#option-b-local-postgresql-database-installation)
3. [Backend Setup (`server/`)](#-3-backend-setup-server)
4. [Frontend Setup (`client/`)](#-4-frontend-setup-client)
5. [Default Demo Credentials](#-5-default-demo-credentials)
6. [Troubleshooting & Common Issues](#-6-troubleshooting--common-issues)

---

## 🛠️ 1. Prerequisites

Before starting, ensure you have the following installed on your computer:

*   **Node.js**: Version 18.x or higher ([Download Node.js](https://nodejs.org/))
*   **npm**: Comes bundled with Node.js
*   **Git**: ([Download Git](https://git-scm.com/))

Verify installations in your terminal:
```bash
node -v   # Should output v18.x.x or higher
npm -v    # Should output 9.x.x or higher
```

---

## 🗄️ 2. Database Setup

You need a PostgreSQL database to run FleetPulse. You can choose **Option A** (Easiest - 2 minutes, no installation required) or **Option B** (Local PostgreSQL).

---

### Option A: Cloud Database via Neon PostgreSQL (Recommended)

[Neon](https://neon.tech) provides free, cloud-hosted PostgreSQL databases with instant setup.

1. **Sign Up / Log In**:
   - Go to [https://neon.tech](https://neon.tech) and create a free account.
2. **Create a New Project**:
   - Click **"New Project"**.
   - Set **Project Name**: `FleetPulse`
   - Set **Database Name**: `fleetpulse`
   - Select your nearest region and click **"Create Project"**.
3. **Copy your Connection String**:
   - In the project dashboard, locate the **Connection Details** box.
   - Select **Prisma** or **Node.js** format.
   - Copy the full URL string. It will look like this:
     ```text
     postgresql://neondb_owner:AbCdEf123456@ep-sample-pooler.us-east-2.aws.neon.tech/fleetpulse?sslmode=require
     ```
4. Save this URL string! You will paste it into your `server/.env` file in Section 3.

---

### Option B: Local PostgreSQL Database Installation

If you prefer running PostgreSQL locally on your machine:

#### 🍏 macOS Setup (via Homebrew)
1. Install Homebrew (if not installed): [https://brew.sh](https://brew.sh)
2. Install PostgreSQL:
   ```bash
   brew install postgresql@18
   ```
3. Start the PostgreSQL background service:
   ```bash
   brew services start postgresql@18
   ```
4. Create the `fleetpulse` database:
   ```bash
   createdb fleetpulse
   ```
5. Your local connection string:
   ```text
   postgresql://YOUR_MAC_USERNAME@localhost:5432/fleetpulse?schema=public
   ```
   *(Replace `YOUR_MAC_USERNAME` with your Mac user account name).*

---

#### 🪟 Windows Setup
1. Download the PostgreSQL Installer from [PostgreSQL Official Download](https://www.postgresql.org/download/windows/).
2. Run the installer and set a password for the superuser `postgres` (e.g. `password123`).
3. Open **pgAdmin** or **Command Prompt** and log in to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
4. Create the database:
   ```sql
   CREATE DATABASE fleetpulse;
   ```
5. Your local connection string:
   ```text
   postgresql://postgres:password123@localhost:5432/fleetpulse?schema=public
   ```

---

#### 🐧 Linux (Ubuntu / Debian) Setup
1. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   ```
2. Start and enable PostgreSQL service:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```
3. Create the database under the postgres user:
   ```bash
   sudo -u postgres createdb fleetpulse
   ```
4. Set password for postgres user:
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password123';"
   ```
5. Your local connection string:
   ```text
   postgresql://postgres:password123@localhost:5432/fleetpulse?schema=public
   ```

---

## 🖥️ 3. Backend Setup (`server/`)

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Open `server/.env` in your text editor and add the following lines:
   ```ini
   PORT=8000
   DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING_HERE"
   NODE_ENV="development"
   JWT_SECRET="fleetpulse-super-secret-jwt-key-2026"
   ```
   *(Replace `YOUR_POSTGRESQL_CONNECTION_STRING_HERE` with your Neon URL from Option A or local Postgres URL from Option B).*

4. **Push Schema to Database (Prisma)**:
   This command automatically creates all required database tables:
   ```bash
   npx prisma db push
   ```

5. **Seed Default Accounts & Sample Data**:
   Populate your database with demo users, vehicles, routes, and trips:
   ```bash
   npm run seed
   ```

6. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   You should see:
   `✅ Server listening on port 8000`

---

## 💻 4. Frontend Setup (`client/`)

1. **Open a new terminal window** and navigate to the project root, then `client/`:
   ```bash
   cd client
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Open `client/.env.local` in your text editor and set:
   ```ini
   NEXT_PUBLIC_API_URL="http://localhost:8000/api"
   ```

4. **Start Frontend Next.js Server**:
   ```bash
   npm run dev
   ```
   The application will be running live at **[http://localhost:3000](http://localhost:3000)**!

---

## 🔑 5. Default Demo Credentials

Once both servers are running, visit `http://localhost:3000` and use any of these pre-seeded demo accounts (Password for all accounts is **`password123`**):

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Admin** | `admin@fleetpulse.io` | Full system control, user management, system settings. |
| **Fleet Manager** | `manager@fleetpulse.io` | Vehicle lifecycle, driver assignments, route planning, maintenance. |
| **Driver** | `driver@fleetpulse.io` | View assigned trips, record odometer, complete trips. |
| **Finance Analyst** | `analyst@fleetpulse.io` | Analytics reports, expense tracking, revenue metrics. |

*(You can also click the quick-switch demo buttons on the login screen to auto-fill credentials).*

---

## ❓ 6. Troubleshooting & Common Issues

### Issue 1: `P1001: Can't reach database server`
- **Cause**: Database server is stopped or host/port is incorrect.
- **Solution**:
  - For **Local Postgres**: Ensure Postgres service is started (`brew services start postgresql@18` or `sudo systemctl start postgresql`).
  - For **Neon**: Check your internet connection and verify `?sslmode=require` is present at the end of the `DATABASE_URL`.

### Issue 2: `Port 8000 or 3000 already in use`
- **Solution**: Kill any process running on those ports:
  - macOS/Linux: `lsof -ti:8000 | xargs kill -9`
  - Windows: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`

### Issue 3: `Prisma client not generated`
- **Solution**: Run `npx prisma generate` inside the `server/` directory manually.
