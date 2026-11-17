-- PLACEHOLDER VALUES: the final lists are still being decided. Before production, replace them with a new
-- migration (ALTER TYPE ... ADD VALUE / RENAME VALUE) and update the matching Java enums.
CREATE TYPE "MISSION_STATUS" AS ENUM ('PROSPECT', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BUSINESS_UNIT" AS ENUM ('DIGITAL', 'DATA', 'CLOUD', 'INFRASTRUCTURE', 'CONSULTING');

-- What a mission is: shared by everyone assigned to it.
CREATE TABLE "missions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "comment" TEXT,
    "star_url" VARCHAR(500),
    "business_unit" "BUSINESS_UNIT",
    "status" "MISSION_STATUS" NOT NULL,
    "customer_id" UUID NOT NULL,
    "project_manager_id" UUID,

    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- A customer with missions cannot be deleted.
    CONSTRAINT "fk_missions_customer"
        FOREIGN KEY ("customer_id")
        REFERENCES "customers"("id")
        ON DELETE RESTRICT,

    -- Deleting the project manager leaves the mission without one.
    CONSTRAINT "fk_missions_project_manager"
        FOREIGN KEY ("project_manager_id")
        REFERENCES "employees"("id")
        ON DELETE SET NULL
);

CREATE INDEX "missions_customer_id_index" ON "missions"("customer_id");
CREATE INDEX "missions_project_manager_id_index" ON "missions"("project_manager_id");

-- Skills a mission needs. The required level is optional and informational only.
CREATE TABLE "missions_skills" (
    "mission_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "required_level" "LEVEL",

    CONSTRAINT "pk_missions_skills" PRIMARY KEY ("mission_id", "skill_id"),

    CONSTRAINT "fk_missions_skills_mission"
        FOREIGN KEY ("mission_id")
        REFERENCES "missions"("id")
        ON DELETE CASCADE,

    CONSTRAINT "fk_missions_skills_skill"
        FOREIGN KEY ("skill_id")
        REFERENCES "skills"("id")
        ON DELETE CASCADE
);

CREATE INDEX "missions_skills_skill_id_index" ON "missions_skills"("skill_id");

-- One employee's assignment to a mission. The same employee can be assigned to the same mission several times
-- (e.g. over different periods), hence the surrogate id.
CREATE TABLE "mission_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "mission_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    -- Days actually worked: independent of the start/end period, but cannot exceed it.
    "duration" INTEGER,
    -- Occupation rate, as a percentage.
    "rate" NUMERIC(5, 2),
    "appreciation" TEXT,
    "comment" TEXT,

    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT "fk_mission_assignments_mission"
        FOREIGN KEY ("mission_id")
        REFERENCES "missions"("id")
        ON DELETE CASCADE,

    -- Staffing history must not disappear silently: an employee with assignments cannot be deleted.
    CONSTRAINT "fk_mission_assignments_employee"
        FOREIGN KEY ("employee_id")
        REFERENCES "employees"("id")
        ON DELETE RESTRICT,

    CONSTRAINT "chk_mission_assignments_period" CHECK ("end_date" >= "start_date"),
    CONSTRAINT "chk_mission_assignments_duration_positive" CHECK ("duration" > 0),
    CONSTRAINT "chk_mission_assignments_duration_within_period"
        CHECK ("duration" <= "end_date" - "start_date" + 1),
    CONSTRAINT "chk_mission_assignments_rate" CHECK ("rate" > 0 AND "rate" <= 100)
);

CREATE INDEX "mission_assignments_mission_id_index" ON "mission_assignments"("mission_id");
CREATE INDEX "mission_assignments_employee_id_index" ON "mission_assignments"("employee_id");
