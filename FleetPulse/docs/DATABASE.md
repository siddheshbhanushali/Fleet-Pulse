# 🗄️ Database Architecture

FleetPulse is powered by a relational schema implemented in **PostgreSQL** and modeled with **Prisma ORM**. 

Below is the Entity-Relationship (ER) diagram followed by a detailed overview of each table and its role in the system.

---

## 📊 Entity-Relationship Diagram

```mermaid
erDiagram

    ROLES {
        int id PK
        string name UK
        string description
        timestamp created_at
    }

    USERS {
        int id PK
        int role_id FK
        string first_name
        string last_name
        string email UK
        string password_hash
        string phone
        string profile_image
        boolean is_active
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }

    VEHICLES {
        int id PK
        string registration_number UK
        string vehicle_name
        string model
        string manufacturer
        int manufacture_year
        string vehicle_type
        decimal max_load_capacity
        decimal acquisition_cost
        string fuel_type
        int current_odometer
        string status
        string region
        text notes
        timestamp purchase_date
        timestamp created_at
        timestamp updated_at
    }

    DRIVERS {
        int id PK
        string first_name
        string last_name
        string email UK
        string phone UK
        string address
        date date_of_birth
        string emergency_contact
        string license_number UK
        string license_category
        date license_issue_date
        date license_expiry_date
        decimal safety_score
        string status
        timestamp joining_date
        text notes
        timestamp created_at
        timestamp updated_at
    }

    ROUTES {
        int id PK
        string route_name
        string source
        string destination
        decimal distance
        decimal estimated_hours
        string status
        timestamp created_at
        timestamp updated_at
    }

    TRIPS {
        int id PK
        string trip_number UK
        int vehicle_id FK
        int driver_id FK
        int route_id FK
        int created_by FK
        string source
        string destination
        string cargo_type
        decimal cargo_weight
        decimal planned_distance
        decimal actual_distance
        timestamp planned_start
        timestamp actual_start
        timestamp actual_end
        decimal fuel_consumed
        int start_odometer
        int end_odometer
        decimal revenue
        string status
        text remarks
        timestamp created_at
        timestamp updated_at
    }

    MAINTENANCE_LOGS {
        int id PK
        int vehicle_id FK
        int created_by FK
        string maintenance_type
        string service_center
        date maintenance_date
        date completion_date
        decimal cost
        string status
        text description
        text remarks
        timestamp created_at
        timestamp updated_at
    }

    FUEL_LOGS {
        int id PK
        int vehicle_id FK
        int trip_id FK
        decimal liters
        decimal price_per_liter
        decimal total_cost
        int odometer
        string fuel_station
        date fuel_date
        timestamp created_at
    }

    EXPENSES {
        int id PK
        int vehicle_id FK
        int trip_id FK
        string expense_type
        decimal amount
        string description
        date expense_date
        timestamp created_at
    }

    ACTIVITY_LOGS {
        int id PK
        int user_id FK
        string entity_type
        int entity_id
        string action
        text description
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        string message
        string type
        boolean is_read
        timestamp created_at
    }

    %% RELATIONSHIPS

    ROLES ||--o{ USERS : has

    USERS ||--o{ TRIPS : creates
    USERS ||--o{ MAINTENANCE_LOGS : creates
    USERS ||--o{ ACTIVITY_LOGS : performs
    USERS ||--o{ NOTIFICATIONS : receives

    VEHICLES ||--o{ TRIPS : assigned_to
    VEHICLES ||--o{ MAINTENANCE_LOGS : has
    VEHICLES ||--o{ FUEL_LOGS : consumes
    VEHICLES ||--o{ EXPENSES : incurs

    DRIVERS ||--o{ TRIPS : drives

    ROUTES ||--o{ TRIPS : assigned_to

    TRIPS ||--o{ FUEL_LOGS : includes
    TRIPS ||--o{ EXPENSES : generates
```

---

## 🗄️ Table Details

### 1. `roles`
Stores authorization groups that govern role-based access control.
*   `id`: Primary key (autoincrement).
*   `name`: Unique role label (e.g. `Admin`, `Fleet Manager`, `Driver`, `Financial Analyst`).
*   `description`: Description of permissions.

### 2. `users`
System operators who log into the application.
*   `role_id`: Links to user's primary authorization role.
*   `email`: Unique username for authentication.
*   `password_hash`: Securely hashed password.
*   `is_active`: Controls whether the user is authorized or redirected to the `/pending` registration queue.

### 3. `vehicles`
Fleet vehicle assets.
*   `registration_number`: Unique license plate identifier.
*   `status`: Operational status indicator (`Available`, `On Trip`, `In Shop`, `Retired`).
*   `max_load_capacity`: Cargo capacity in kilograms.
*   `current_odometer`: Running total odometer for trip validation.

### 4. `drivers`
On-duty dispatch drivers.
*   `license_number`: Driver's legal operating license.
*   `license_expiry_date`: Tracked to prevent assigning expired drivers to active trips.
*   `safety_score`: Out of 100, updated based on driving history and performance.
*   `status`: Work status (`Available`, `On Trip`, `On Leave`).

### 5. `routes`
Geographic pathways mapped for transport planning.
*   `source` & `destination`: Named locations.
*   `distance` & `estimated_hours`: Planned metrics to validate fuel costs and schedules.

### 6. `trips`
Core transactional table detailing dispatched freight shipments.
*   Links `vehicles`, `drivers`, `routes`, and the dispatching `users`.
*   Records planned vs. actual distances, odometer values, fuel used, cargo payload details, revenue, and statuses (`Draft`, `Dispatched`, `In Progress`, `Completed`, `Cancelled`).

### 7. `maintenance_logs`
Historical records of vehicle servicing.
*   `maintenance_type`: Categorizes work (e.g., Oil Change, Engine Tuning, Tire Rotation).
*   `cost`: Monetary cost of repair.
*   `status`: Status of repairs (`Scheduled`, `In Progress`, `Completed`, `Cancelled`).

### 8. `fuel_logs` & `expenses`
Financial logging tables.
*   `fuel_logs`: Liters, price, total cost, and mileage metrics to evaluate fuel efficiency.
*   `expenses`: Non-fuel trip costs (e.g., tolls, food, permits) to determine trip ROI.

### 9. `activity_logs` & `notifications`
*   `activity_logs`: Administrative actions audit trails.
*   `notifications`: Alerts for system alerts, vehicle breakdowns, or dispatch updates.
