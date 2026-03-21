# Hire & Fix Backend Architecture

## 1. System Overview
Hire & Fix is a role-based backend API for a home-services booking platform.

High-level flow:
1. Client (web/mobile/Postman) sends request to Express API.
2. Request passes through middlewares (auth, validation, error boundaries).
3. Controller delegates business logic to service layer.
4. Service layer reads/writes PostgreSQL through Prisma.
5. For payments, service layer integrates with Stripe Checkout + Webhooks.
6. Response is returned in a consistent JSON format.

## 2. Core Modules and Responsibilities

- `auth`
  Handles registration, login/logout, JWT cookie flow, and current user resolution.

- `vendor`
  Vendor listing/details, vendor self-profile management, vendor dashboard summary.

- `employee`
  Public employee listing/details, vendor-managed employee operations, employee self-profile updates.

- `serviceCategory`
  Service category management (admin writes, public reads).

- `booking`
  Booking creation, ownership-scoped booking retrieval, lifecycle/status transitions by role.

- `review`
  Review creation and updates by users, employee review aggregation and listing.

- `payment`
  Stripe checkout-session creation and webhook-driven payment finalization.

- `admin`
  Platform-level summaries and management endpoints (users, vendors, bookings, payments).

## 3. Data Model Relationships

Main entities and links:
- `User` has one role: `ADMIN | VENDOR | EMPLOYEE | USER`.
- `User` has one role-specific profile:
  - `UserProfile` (customer)
  - `VendorProfile`
  - `EmployeeProfile`
- `VendorProfile` has many `EmployeeProfile`.
- `Booking` belongs to one `User` (customer), one `VendorProfile`, and one `EmployeeProfile`.
- `Payment` is one-to-one with `Booking`.
- `Review` is one-to-one with `Booking` and associated with `EmployeeProfile`.

## 4. Auth and RBAC Architecture

- JWT is issued on login and stored in an HTTP-only cookie.
- `auth` middleware verifies token and populates `req.user`.
- Route-level role guards enforce access rules, e.g.:
  - only `VENDOR` can manage own employees
  - only `ADMIN` can approve vendors or access platform-wide admin endpoints
  - only `USER` can initiate booking checkout payment

## 5. Validation and Error Handling Flow

Request flow:
1. Route uses `validateRequest(zodSchema)` when payload validation is needed.
2. Controller receives validated request and calls service method.
3. Service throws domain errors through `AppError` when rules are violated.
4. `globalErrorHandler` normalizes known errors (including zod/prisma cases).
5. API returns a consistent error body with `statusCode`, `message`, and `errorSources`.

## 6. Booking Lifecycle Architecture

Booking creation includes:
- ownership and role checks
- booking window constraints (time validation)
- employee availability conflict checks
- automatic price calculation from employee hourly rate and duration

Status transitions are role-scoped:
- vendor transitions (e.g. `PENDING -> ACCEPTED/REJECTED`, etc.)
- employee transitions (limited subset, e.g. `ACCEPTED -> IN_PROGRESS -> COMPLETED`)
- cancellation rules enforced for users before service start time

## 7. Payment Architecture (Stripe)

Checkout flow:
1. User calls `POST /payments/checkout-session/:bookingId`.
2. Service validates booking ownership and payability.
3. Service upserts `Payment` as `PENDING` and creates Stripe Checkout Session.
4. Stripe session id is stored in `payment.transactionId`.
5. Frontend redirects to Stripe-hosted checkout URL.

Webhook flow:
1. Stripe sends event to `POST /payments/webhook`.
2. Endpoint uses `express.raw({ type: "application/json" })` for signature-safe payload.
3. Signature is verified with `STRIPE_WEBHOOK_SECRET`.
4. On success/failure events, payment and booking payment status are updated transactionally.
5. Idempotency guard avoids duplicate successful updates.

## 8. Cross-Cutting Patterns

- Controller-service separation is used consistently across modules.
- Shared pagination and sorting helper normalizes list endpoint behavior.
- Response shape is standardized through `sendResponse`.
- Important multi-write operations use database transactions.

## 9. Deployment Considerations

- Configure all required environment variables (DB, JWT, Stripe, redirect URLs).
- Set production Stripe webhook endpoint in Stripe Dashboard.
- Use production Stripe keys in deployed environments.
- Keep webhook raw-body route ordering intact (before JSON body parser for that route).
- Monitor webhook delivery failures and rotate exposed secrets when needed.
