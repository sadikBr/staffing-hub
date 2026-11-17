-- Open positions on a mission: "we need a senior developer at 80% from March". A need is filled by an assignment;
-- removing that assignment opens the need again. Candidates are matched against the mission's required skills.
CREATE TABLE "mission_needs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "version" BIGINT NOT NULL DEFAULT 0,
    "mission_id" UUID NOT NULL,
    "role_id" UUID,
    "seniority" "SENIORITY",
    "start_date" DATE,
    "end_date" DATE,
    -- Occupation rate wanted, as a percentage.
    "rate" NUMERIC(5, 2),
    "comment" TEXT,
    "filled_by_assignment_id" UUID,

    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT "fk_mission_needs_mission"
        FOREIGN KEY ("mission_id")
        REFERENCES "missions"("id")
        ON DELETE CASCADE,

    -- Deleting a role keeps the need, without a role.
    CONSTRAINT "fk_mission_needs_role"
        FOREIGN KEY ("role_id")
        REFERENCES "roles"("id")
        ON DELETE SET NULL,

    -- Removing the assignment that filled the need opens it again.
    CONSTRAINT "fk_mission_needs_filled_by"
        FOREIGN KEY ("filled_by_assignment_id")
        REFERENCES "mission_assignments"("id")
        ON DELETE SET NULL,

    CONSTRAINT "uq_mission_needs_filled_by" UNIQUE ("filled_by_assignment_id"),
    CONSTRAINT "chk_mission_needs_period" CHECK ("end_date" >= "start_date"),
    CONSTRAINT "chk_mission_needs_rate" CHECK ("rate" > 0 AND "rate" <= 100)
);

CREATE INDEX "mission_needs_mission_id_index" ON "mission_needs"("mission_id");
CREATE INDEX "mission_needs_role_id_index" ON "mission_needs"("role_id");
