-- Incremented on every change. Clients send back the version they read, so that a change made in the meantime by
-- someone else is reported (409) instead of being silently overwritten.
ALTER TABLE "customers" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "roles" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "technologies" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "skills" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "employees" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "missions" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "mission_assignments" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
