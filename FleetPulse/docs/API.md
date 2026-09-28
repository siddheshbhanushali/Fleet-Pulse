# 🔗 API Reference Guide

FleetPulse exposes a modular REST API built with Express.js and TypeScript. All request payloads are validated using **Zod** schemas, and responses are formatted as standard JSON objects.

---

## 🔒 Base Configuration & Security
*   **Base URL (Local)**: `http://localhost:8000/api`
*   **Authentication**: Most endpoints require authentication. Provide your JSON Web Token (JWT) in the HTTP `Authorization` header:
    ```http
    Authorization: Bearer <your_jwt_token>
    ```

---

## 🛣️ API Endpoints

### 1. Authentication (`/api/auth`)

*   **`POST /api/auth/register`**
    *   **Description**: Registers a new user account. Newly registered users are set to inactive (`is_active: false`) and must be approved by an Admin.
    *   **Body**:
        ```json
        {
          "first_name": "John",
          "last_name": "Doe",
          "email": "johndoe@transit.com",
          "password": "securepassword",
          "phone": "9876543210"
        }
        ```
*   **`POST /api/auth/login`**
    *   **Description**: Validates credentials and returns a JWT token.
    *   **Body**:
        ```json
        {
          "email": "admin@transit.com",
          "password": "password123"
        }
        ```
    *   **Response**:
        ```json
        {
          "success": true,
          "token": "eyJhbGciOi...",
          "user": { "id": 1, "first_name": "Admin", "email": "admin@transit.com", "role_id": 1, "is_active": true }
        }
        ```
*   **`GET /api/auth/me`**
    *   **Description**: Fetches profile data of the currently logged-in user.
    *   **Headers**: Requires authentication token.

---

### 2. Vehicle Management (`/api/vehicles`)
*Protected by `authenticate` middleware.*

*   **`GET /api/vehicles`**
    *   **Description**: Retrieves all vehicles. Supports optional query filters: `status`, `type`, and `region`.
*   **`POST /api/vehicles`**
    *   **Description**: Registers a new vehicle.
    *   **Body**:
        ```json
        {
          "registration_number": "MH-12-PQ-9999",
          "vehicle_name": "Heavy cargo-truck 04",
          "vehicle_type": "Truck",
          "max_load_capacity": 5000,
          "model": "F-150",
          "manufacturer": "Ford",
          "manufacture_year": 2022,
          "fuel_type": "Diesel",
          "status": "Available"
        }
        ```
*   **`GET /api/vehicles/:id`**
    *   **Description**: Retrieves detailed info for a single vehicle by database ID.
*   **`PUT /api/vehicles/:id`**
    *   **Description**: Updates vehicle parameters.
*   **`DELETE /api/vehicles/:id`**
    *   **Description**: Soft-deletes a vehicle by switching its status to `Retired`.

---

### 3. Driver Management (`/api/drivers`)
*Protected by `authenticate` middleware.*

*   **`GET /api/drivers`**
    *   **Description**: Retrieves all drivers.
*   **`POST /api/drivers`**
    *   **Description**: Registers a new driver.
    *   **Body**:
        ```json
        {
          "first_name": "Jane",
          "last_name": "Smith",
          "phone": "9090909090",
          "email": "janesmith@transit.com",
          "license_number": "DL-1234567890",
          "license_category": "Heavy Commercial",
          "license_issue_date": "2023-01-01",
          "license_expiry_date": "2033-01-01",
          "status": "Available"
        }
        ```
*   **`GET /api/drivers/:id`**
    *   **Description**: Fetches driver details by ID.
*   **`PUT /api/drivers/:id`**
    *   **Description**: Updates driver files or license attributes.
*   **`DELETE /api/drivers/:id`**
    *   **Description**: Removes driver account.

---

### 4. Trip Logs & Dispatching (`/api/trips`)
*Protected by `authenticate` middleware.*

*   **`GET /api/trips`**
    *   **Description**: Retrieves active and historical trip logs.
*   **`POST /api/trips`**
    *   **Description**: Plans and saves a new trip in `Draft` state.
*   **`POST /api/trips/:id/dispatch`**
    *   **Description**: Transition trip status to `Dispatched` and updates the assigned driver and vehicle statuses to active duties.
*   **`POST /api/trips/:id/complete`**
    *   **Description**: Ends a trip. Expects `end_odometer`, `actual_distance`, and `revenue` values in the body. Transitions status to `Completed` and returns driver and vehicle to `Available` status.
*   **`POST /api/trips/:id/cancel`**
    *   **Description**: Cancels an active or planned trip.

---

### 5. Maintenance Logging (`/api/maintenance`)
*Protected by `authenticate` middleware.*

*   **`GET /api/maintenance`**
    *   **Description**: Returns all scheduled and completed maintenance records.
*   **`POST /api/maintenance`**
    *   **Description**: Registers a maintenance incident or scheduled tune-up.
*   **`POST /api/maintenance/:id/complete`**
    *   **Description**: Completes maintenance service. Updates completion dates and changes the associated vehicle's status from `In Shop` back to `Available`.

---

### 6. Expenses & Fuel Logs (`/api/expenses`)
*Protected by `authenticate` middleware.*

*   **`POST /api/expenses/fuel`**
    *   **Description**: Logs a refueling event.
    *   **Body**:
        ```json
        {
          "vehicle_id": 1,
          "trip_id": 2,
          "liters": 45.5,
          "price_per_liter": 1.2,
          "total_cost": 54.6,
          "odometer": 10500,
          "fuel_station": "Chevron Hwy 1",
          "fuel_date": "2026-07-12"
        }
        ```
*   **`GET /api/expenses/fuel`**
    *   **Description**: Lists all fuel top-up records.
*   **`POST /api/expenses`**
    *   **Description**: Logs a general trip/fleet expense.
*   **`GET /api/expenses`**
    *   **Description**: Lists general expenses.

---

### 7. Route Directories (`/api/routes`)
*Protected by `authenticate` middleware.*

*   **`GET /api/routes`**
    *   **Description**: Lists all predefined routing paths.
*   **`POST /api/routes`**
    *   **Description**: Adds a new route route.
*   **`PUT /api/routes/:id`**
    *   **Description**: Modifies route details.
*   **`DELETE /api/routes/:id`**
    *   **Description**: Removes route directory entry.

---

### 8. Analytics & Financial Metrics (`/api/analytics` & `/api/dashboard`)
*Protected by `authenticate` middleware.*

*   **`GET /api/dashboard`**
    *   **Description**: Computes and returns active KPIs: vehicle state distributions, active dispatch totals, fleet utilization percentage, and financial operating costs.
*   **`GET /api/analytics/dashboard`**
    *   **Description**: Computes 6-month historical trends comparing monthly revenue against running operational expenses (fuel, maintenance, miscellaneous).
*   **`GET /api/analytics/overview`**
    *   **Description**: Computes metrics overview (drivers available, pending maintenance due, fuel efficiency averages) alongside recent dispatch activities.

---

### 9. User Administration (`/api/users`)
*Protected by Admin Authentication Guard (Role ID 1 only).*

*   **`GET /api/users`**
    *   **Description**: Lists all registered users (active and pending approval accounts).
*   **`PUT /api/users/:id`**
    *   **Description**: Updates user status (e.g., toggles `is_active` to authorize pending users, or changes user roles).

---

### 10. Service Health (`/api/health`)

*   **`GET /api/health`**
    *   **Description**: Simple public endpoint verifying the backend server is running.
    *   **Response**:
        ```json
        { "success": true, "status": "UP" }
        ```

---

## 🧪 Testing with Bruno

FleetPulse comes prepared with API collection definitions inside the `/bruno` directory.
Import the folder directly into the [Bruno client](https://www.usebruno.com/) to interact with these endpoints, run environment tests (`environments/Local.bru`), and execute auth flows instantly.
