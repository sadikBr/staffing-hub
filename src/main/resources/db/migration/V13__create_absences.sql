-- Time an employee is away (holidays, sick leave, training...). Absences reduce availability; they never block
-- assignments.
CREATE TYPE "ABSENCE_TYPE" AS ENUM ('HOLIDAY', 'SICK_LEAVE', 'TRAINING', 'OTHER');

CREATE TABLE "absences" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "version" BIGINT NOT NULL DEFAULT 0,
    "employee_id" UUID NOT NULL,
    "type" "ABSENCE_TYPE" NOT NULL,
    -- Both days included.
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "comment" TEXT,

    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT "fk_absences_employee"
        FOREIGN KEY ("employee_id")
        REFERENCES "employees"("id")
        ON DELETE CASCADE,

    CONSTRAINT "chk_absences_period" CHECK ("end_date" >= "start_date")
);

CREATE INDEX "absences_employee_id_index" ON "absences"("employee_id");
