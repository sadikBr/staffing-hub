CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "skills" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "label" TEXT UNIQUE NOT NULL,
    "technology_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT fk_technology
        FOREIGN KEY ("technology_id")
        REFERENCES "technologies"("id")
        ON DELETE CASCADE
);

CREATE INDEX "skills_technology_id_index" ON "skills"("technology_id")