CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "SENIORITY" AS ENUM('JUNIOR', 'MID_LEVEL', 'SENIOR');
CREATE TYPE "COMMUNITY" AS ENUM('TIGER', 'BEAR', 'SHARK', 'SQUIRREL', 'DRAGON', 'EAGLE', 'IGUANA', 'UNICORN', 'OWL', 'WOLF');

CREATE TABLE "employees" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "comment" TEXT,
    "seniority" "SENIORITY" NOT NULL,
    "community" "COMMUNITY" NOT NULL,
    "manager_id" UUID,
    
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_manager
        FOREIGN KEY ("manager_id")
        REFERENCES "employees"("id")
);

CREATE INDEX "employee_manager_id_index" ON "employees"("manager_id");