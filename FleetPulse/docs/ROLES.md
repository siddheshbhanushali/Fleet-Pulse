# 🛡️ Role-Based Access Control (RBAC)

FleetPulse employs a strict Role-Based Access Control (RBAC) mechanism on both the Next.js frontend and Express.js backend. This ensures users only see data and execute actions corresponding to their designated role.

---

## 👥 Role Definitions

The system defines four operational roles, mapped by integer IDs stored in the `roles` table and the JWT payload:

| Role ID | Role Name | System Purpose |
| :---: | :--- | :--- |
| **1** | **Admin** | Full system access, system configuration, setting adjustments, and user activations. |
| **2** | **Fleet Manager** | Managing vehicles, onboarding drivers, organizing routes, planning maintenance, and scheduling/dispatching trips. |
| **3** | **Driver** | Operational field access. Can view assigned trips, report logs, and log incidents. |
| **4** | **Financial Analyst** | Access to financial analytics, operational costs aggregation, fuel logs, and expense reports. |

---

## 🚦 Inactive User Registration Guard

All newly registered users are created with `is_active: false` by default.
*   **Workflow**: When an inactive user logs in, the frontend `CentralRoleGuard` intercepts their request.
*   **Restriction**: They are redirected to `/pending` (the Pending Approval waitlist page) and cannot access the dashboard or sidebar options.
*   **Activation**: An Admin (Role ID 1) must go to the **Users** directory (`/users`) and activate their account by toggling `is_active` to `true`.

---

## 🛣️ Client Route Permissions Matrix

The frontend uses `CentralRoleGuard` (located in `client/components/central-role-guard.tsx`) to check route paths. The matrix below defines which roles are permitted on each subpath:

| Route Path | Admin (1) | Fleet Manager (2) | Driver (3) | Financial Analyst (4) |
| :--- | :---: | :---: | :---: | :---: |
| `/dashboard` | ✅ | ✅ | ✅ | ✅ |
| `/vehicles` | ✅ | ✅ | ❌ | ❌ |
| `/drivers` | ✅ | ✅ | ❌ | ❌ |
| `/routes` | ✅ | ✅ | ❌ | ❌ |
| `/trips` | ✅ | ✅ | ✅ | ❌ |
| `/maintenance` | ✅ | ✅ | ❌ | ❌ |
| `/incidents` | ✅ | ✅ | ✅ | ❌ |
| `/alerts` | ✅ | ✅ | ❌ | ❌ |
| `/analytics` | ✅ | ❌ | ❌ | ✅ |
| `/reports` | ✅ | ❌ | ❌ | ✅ |
| `/settings` | ✅ | ❌ | ❌ | ❌ |
| `/users` | ✅ | ❌ | ❌ | ❌ |

---

## 🧬 Frontend Component Gates (`RoleGate`)

For fine-grained UI controls (like hiding the **"Add Vehicle"** button or **"Delete"** actions from read-only users), FleetPulse uses the `<RoleGate>` wrapper component (defined in `client/components/role-gate.tsx`).

### Example Usage:
```tsx
import { RoleGate } from "@/components/role-gate";
import { ROLES } from "@/lib/roles";

// Only Admins and Fleet Managers will see this action
<RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
  <Button onClick={handleDeleteVehicle}>Delete Vehicle</Button>
</RoleGate>
```

---

## 🔒 Backend API Guarding

The backend validates roles in two ways:

1.  **Global Authorization Middleware**: All protected endpoints require a valid JWT token sent in the `Authorization` header (`Bearer <token>`). The middleware `authenticate` decodes the token and attaches `req.user` to the request object.
2.  **Explicit Route Guards**: Inside admin routes (e.g., `/api/users`), the router executes a check to verify that `req.user.roleId === 1` before invoking controllers:
    ```typescript
    router.use((req, res, next) => {
      if (req.user?.roleId !== 1) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
      }
      next();
    });
    ```
