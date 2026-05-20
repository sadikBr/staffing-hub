CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "employees_technologies" (
    "employee_id" UUID NOT NULL,
    "technology_id" UUID NOT NULL,

    CONSTRAINT "pk_employee_technologies" PRIMARY KEY ("employee_id", "technology_id"),

    CONSTRAINT fk_employee_technologies_employee
        FOREIGN KEY ("employee_id")
        REFERENCES "employees"("id")
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_technologies_technology
        FOREIGN KEY ("technology_id")
        REFERENCES "technologies"("id")
        ON DELETE CASCADE
);