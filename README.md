# Staffing Hub

REST API for staffing: employees and their skills, customers, missions, and who is assigned to what.

Spring Boot 4 · Java 25 · PostgreSQL · Flyway · MapStruct · springdoc (Swagger UI)

## Run locally

Requirements: JDK 25+ and Docker.

```bash
# 1. Start PostgreSQL (set DB_PORT=5433 if 5432 is already taken, and DB_URL accordingly)
docker compose up -d

# 2. Start the API with the dev profile: no login needed, demo data loaded
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Then open **http://localhost:8000/swagger-ui.html** to browse and call every endpoint.

> Without the `dev` profile, the API requires a login provider (see below) and refuses to start if none is
> configured. Never use the `dev` profile in production.

## Configuration

All settings come from environment variables (defaults suit local development):

| Variable | Purpose | Default |
|---|---|---|
| `DB_URL` | JDBC URL of the database | `jdbc:postgresql://localhost:5432/staffing` |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials | `postgres` / `password` |
| `OIDC_ISSUER_URI` | Company login provider (OpenID Connect issuer). **Required in production.** | — |
| `OIDC_AUDIENCE` | Only accept tokens issued for this audience (usually the API's client id) | — |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API (the frontend's URL) | — |
| `SPRING_PROFILES_ACTIVE` | `dev` for local development only | — |

Issuer examples: Microsoft Entra ID `https://login.microsoftonline.com/<tenant-id>/v2.0`, Google
`https://accounts.google.com`, Keycloak `https://<host>/realms/<realm>`.

Clients send `Authorization: Bearer <access token>`. In Swagger UI, use the **Authorize** button. Any authenticated
user can currently do everything; role-based restrictions can be added in `SecurityConfig`.

## API overview

| Resource | Endpoints |
|---|---|
| Reference data | `/customers`, `/roles`, `/technologies`, `/skills?technologyId=` (CRUD) |
| Employees | `/employees` (search + CRUD), `/employees/{id}/roles`, `/technologies`, `/skills/{skillId}`, `/assignments` |
| Availability | `/employees/availability?from=&to=&minAvailability=` (+ the employee search filters) |
| Missions | `/missions` (filter by customer, status, business unit), `/missions/{id}/skills/{skillId}`, `/missions/{id}/assignments` |
| Health | `/actuator/health` (+ `/liveness`, `/readiness`) |

Conventions:

- Errors use the standard problem format (`application/problem+json`): 400 invalid input (with an `errors` map per
  field), 404 not found, 409 conflict (duplicate, stale version, delete blocked), 422 business rule violated.
- Lists of employees, missions and availability are paginated: `?page=0&size=20&sort=lastName,asc`.
- Updates (PUT) replace the whole resource. Send back the `version` you read: if someone changed the record in the
  meantime, the update is refused with 409 instead of overwriting their change.

## Business rules

- An employee can only have skills in technologies they have; removing a technology removes those skills.
- Managers cannot form cycles. Deleting a manager keeps their staff (without a manager).
- Employees who leave get a **departure date** instead of being deleted: they keep their history and are hidden
  from searches (unless `includeFormer=true`). An employee with assignments cannot be deleted.
- A customer with missions cannot be deleted. Deleting a mission deletes its assignments.
- Mission required skills have an optional level. Employees can be assigned whatever their levels; each assignment
  reports `skillMatches` (required vs actual level).
- Assignment `duration` is the number of days worked: independent of the start/end dates, but not longer than that
  period. `rate` is the occupation percentage (0–100).
- **Occupation / availability**: peak total rate on any day of the period. Assignments without a start date are
  ignored, without an end date are ongoing, without a rate count as 100%. Overbooking (> 100%) is reported, never
  blocked. Someone leaving during the period has 0% availability.

> Mission status and business unit values are **placeholders** (see `V10__create_missions.sql` and the Java enums).
> Change them with a new migration (`ALTER TYPE ... ADD VALUE / RENAME VALUE`) before going to production.

## Tests

```bash
./mvnw verify
```

Integration tests run against a real PostgreSQL started automatically with Testcontainers (Docker required).

## Docker

```bash
docker build -t staffing-hub .
docker run -p 8000:8000 -e DB_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... -e OIDC_ISSUER_URI=... staffing-hub
```

CI (`.github/workflows/ci.yml`) runs the tests and builds the image on every push to `main` and every pull request.

## Project layout

```
src/main/java/.../staffinghub
├── controllers/    HTTP endpoints (+ Swagger descriptions)
├── services/       business logic and transactions
├── domain/         pure business calculations (occupation)
├── models/         JPA entities
├── repositories/   data access and search specifications
├── dtos/           request/response records (with validation)
├── mappers/        MapStruct entity <-> DTO mapping
├── exceptions/     error types and the global error handler
└── config/         security, OpenAPI, clock
src/main/resources/db/migration/   schema (Flyway), never edit an applied migration: add a new one
src/main/resources/db/dev-data/    demo data, dev profile only
```
