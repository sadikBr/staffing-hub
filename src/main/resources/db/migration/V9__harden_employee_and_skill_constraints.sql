-- Deleting a manager must not delete (or block on) their staff: they simply no longer have a manager.
ALTER TABLE "employees" DROP CONSTRAINT "fk_manager";
ALTER TABLE "employees"
    ADD CONSTRAINT "fk_manager"
        FOREIGN KEY ("manager_id")
        REFERENCES "employees"("id")
        ON DELETE SET NULL;

-- An employee can never be their own manager (longer cycles are rejected by the application).
ALTER TABLE "employees"
    ADD CONSTRAINT "chk_employee_not_own_manager" CHECK ("manager_id" IS NULL OR "manager_id" <> "id");

-- Skill labels are unique per technology, not globally (e.g. "Testing" can exist for both Java and Python).
ALTER TABLE "skills" DROP CONSTRAINT "skills_label_key";
ALTER TABLE "skills" ADD CONSTRAINT "uq_skills_technology_label" UNIQUE ("technology_id", "label");

-- The unique constraint above already indexes "technology_id" as its leading column.
DROP INDEX "skills_technology_id_index";

-- Index the second column of each join table so lookups and cascading deletes from that side are fast.
CREATE INDEX "employees_roles_role_id_index" ON "employees_roles"("role_id");
CREATE INDEX "employees_technologies_technology_id_index" ON "employees_technologies"("technology_id");
CREATE INDEX "employees_skills_skill_id_index" ON "employees_skills"("skill_id");
