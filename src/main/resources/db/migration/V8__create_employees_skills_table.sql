CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "LEVEL" AS ENUM('NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

CREATE TABLE "employees_skills" (
    "employee_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "level" "LEVEL" NOT NULL,

    CONSTRAINT "pk_employee_skills" PRIMARY KEY ("employee_id", "skill_id"),

    CONSTRAINT fk_employee_skills_employee
        FOREIGN KEY ("employee_id")
        REFERENCES "employees"("id")
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_skills_skill
        FOREIGN KEY ("skill_id")
        REFERENCES "skills"("id")
        ON DELETE CASCADE
);