-- Employees who leave are kept (with their staffing history) instead of being deleted: they are "former" employees
-- from their departure date onwards. A future date records a planned departure (e.g. during a notice period).
ALTER TABLE "employees" ADD COLUMN "departure_date" DATE;
