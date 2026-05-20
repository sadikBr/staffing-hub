CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "employees_roles" (
    "employee_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "pk_employee_roles" PRIMARY KEY ("employee_id", "role_id"),

    CONSTRAINT fk_employee_roles_employee
        FOREIGN KEY ("employee_id")
        REFERENCES "employees"("id")
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_roles_role
        FOREIGN KEY ("role_id")
        REFERENCES "roles"("id")
        ON DELETE CASCADE
);