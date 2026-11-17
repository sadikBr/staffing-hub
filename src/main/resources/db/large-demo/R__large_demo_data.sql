-- LARGE DEMO DATA, loaded only with the 'large-demo' profile, together with the 'dev' profile (see
-- application-large-demo.properties). Never runs in production. Adds, on top of the regular demo data:
--   9 technologies and ~50 skills, 6 roles, 21 customers, 56 employees, 35 missions with their required skills,
--   ~70 assignments, ~40 absences and ~25 open positions (about 70 employees and 40 missions in total).
-- Everything is generated deterministically (fixed ids from md5, choices from hashtext), so loading it again changes
-- nothing. Dates are relative to the day it is loaded. To try other sizes, change the generate_series bounds.

-- Technologies and skills -------------------------------------------------------------------------------------------
INSERT INTO "technologies" ("id", "label")
SELECT md5('large-technology-' || label)::uuid, label
FROM unnest(ARRAY['Java', 'React', 'Python', 'AWS', 'Angular', 'Kotlin', 'Vue.js', 'Go', '.NET', 'Azure', 'Google Cloud',
                  'Kubernetes', 'Flutter', 'Data engineering']) AS label
ON CONFLICT DO NOTHING;

INSERT INTO "skills" ("id", "label", "technology_id")
SELECT md5('large-skill-' || s.technology || '-' || s.label)::uuid, s.label, t."id"
FROM (VALUES
    ('Java', 'Microservices'), ('Java', 'Kafka'), ('Java', 'Quarkus'), ('Java', 'Performance tuning'),
    ('React', 'TypeScript'), ('React', 'Redux'), ('React', 'Accessibility'), ('React', 'React Native'),
    ('Python', 'Django'), ('Python', 'Machine learning'), ('Python', 'Data visualisation'),
    ('AWS', 'ECS'), ('AWS', 'DynamoDB'), ('AWS', 'CloudFormation'), ('AWS', 'Security'),
    ('Angular', 'Signals'), ('Angular', 'Material'), ('Angular', 'Testing'),
    ('Kotlin', 'Coroutines'), ('Kotlin', 'Ktor'), ('Kotlin', 'Android'), ('Kotlin', 'Spring'),
    ('Vue.js', 'Nuxt'), ('Vue.js', 'Pinia'), ('Vue.js', 'Composition API'),
    ('Go', 'gRPC'), ('Go', 'Concurrency'), ('Go', 'CLI tools'), ('Go', 'Testing'),
    ('.NET', 'ASP.NET Core'), ('.NET', 'Entity Framework'), ('.NET', 'Blazor'), ('.NET', 'Azure Functions'),
    ('Azure', 'AKS'), ('Azure', 'Cosmos DB'), ('Azure', 'DevOps pipelines'), ('Azure', 'Entra ID'),
    ('Google Cloud', 'BigQuery'), ('Google Cloud', 'Cloud Run'), ('Google Cloud', 'Pub/Sub'),
    ('Kubernetes', 'Helm'), ('Kubernetes', 'Operators'), ('Kubernetes', 'Observability'), ('Kubernetes', 'GitOps'),
    ('Flutter', 'Dart'), ('Flutter', 'State management'), ('Flutter', 'Animations'),
    ('Data engineering', 'Spark'), ('Data engineering', 'Airflow'), ('Data engineering', 'dbt'),
    ('Data engineering', 'Data modelling'), ('Data engineering', 'Streaming')
) AS s(technology, label)
JOIN "technologies" t ON t."label" = s.technology
ON CONFLICT DO NOTHING;

-- Roles and customers -----------------------------------------------------------------------------------------------
INSERT INTO "roles" ("id", "label")
SELECT md5('large-role-' || label)::uuid, label
FROM unnest(ARRAY['Developer', 'Tech Lead', 'Architect', 'Scrum Master', 'Project Manager', 'QA Engineer',
                  'DevOps Engineer', 'Data Engineer', 'UX Designer', 'Product Owner', 'Business Analyst']) AS label
ON CONFLICT DO NOTHING;

INSERT INTO "customers" ("id", "label")
SELECT md5('large-customer-' || label)::uuid, label
FROM unnest(ARRAY['Blue Harbor Bank', 'Greenfield Energy', 'Atlas Logistics', 'Novacare Health', 'Northwind Retail',
                  'Helios Airlines', 'Quantum Insurance', 'Riverstone Telecom', 'Summit Pharma', 'Orbit Media',
                  'Cobalt Mining', 'Evergreen Foods', 'Lumen Automotive', 'Pioneer Rail', 'Silverline Hotels',
                  'Crescent Utilities', 'Vertex Software', 'Mosaic Fashion', 'Polar Water', 'Nimbus Gaming',
                  'Keystone Construction', 'Aurora Public Services', 'Beacon University', 'Tidal Shipping',
                  'Cedar Real Estate']) AS label
ON CONFLICT DO NOTHING;

-- Employees ---------------------------------------------------------------------------------------------------------
-- The first 8 are senior leads; everyone else reports to one of them.
INSERT INTO "employees" ("id", "first_name", "last_name", "seniority", "community", "departure_date", "comment")
SELECT md5('large-employee-' || i)::uuid,
       (ARRAY['Amira', 'Bastien', 'Clara', 'Damien', 'Elena', 'Farid', 'Gabrielle', 'Hamza', 'Iris', 'Jules',
              'Kenza', 'Louis', 'Maya', 'Nathan', 'Olivia', 'Paul', 'Rania', 'Samuel', 'Talia', 'Ugo', 'Valentine',
              'Walid', 'Yanis', 'Zoe', 'Adam', 'Bianca', 'Cyril', 'Dalia', 'Ethan', 'Fatima', 'Gaspard', 'Hana',
              'Ilyes', 'Jeanne', 'Karl', 'Lina', 'Mathis', 'Nora', 'Oscar', 'Pauline', 'Quentin', 'Rose', 'Sami',
              'Ines', 'Tom', 'Ulysse', 'Victoria', 'William', 'Yasmina', 'Zakaria', 'Alice', 'Bruno', 'Camil',
              'Diane', 'Emile', 'Flora'])[i],
       (ARRAY['Moreau', 'Benali', 'Rousseau', 'Nguyen', 'Petrov', 'Mansouri', 'Lambert', 'Kovacs', 'Fontaine',
              'Cheng', 'Haddad', 'Girard', 'Okafor', 'Lemoine', 'Silva', 'Bernard', 'Ziani', 'Novak', 'Lefevre',
              'Rossi', 'Diallo', 'Marchand', 'Schmidt', 'Garnier', 'Tanaka', 'Mercier', 'El Amrani', 'Duval',
              'Kowalski', 'Faure', 'Ibrahim', 'Perrin', 'Andersen', 'Blanc', 'Chevalier', 'Bouzid', 'Roux',
              'Laurent', 'Martins', 'Vidal', 'Caron', 'Fischer', 'Leroy', 'Gauthier', 'Morel', 'Ferrari',
              'Dumont', 'Brun', 'Chraibi', 'Lopez', 'Muller', 'Meyer', 'Picard', 'Renard', 'Simon', 'Weber'])
           [((i * 17) % 56) + 1],
       CASE WHEN i <= 8 THEN 'SENIOR'
            WHEN abs(hashtext('seniority-' || i)) % 10 < 3 THEN 'JUNIOR'
            WHEN abs(hashtext('seniority-' || i)) % 10 < 7 THEN 'MID_LEVEL'
            ELSE 'SENIOR' END::"SENIORITY",
       (ARRAY['TIGER', 'BEAR', 'SHARK', 'SQUIRREL', 'DRAGON', 'EAGLE', 'IGUANA', 'UNICORN', 'OWL', 'WOLF'])
           [abs(hashtext('community-' || i)) % 10 + 1]::"COMMUNITY",
       CASE WHEN i % 23 = 0 THEN CURRENT_DATE - 75
            WHEN i % 19 = 0 THEN CURRENT_DATE + 50 END,
       CASE WHEN i % 11 = 0 THEN 'Open to missions abroad'
            WHEN i % 13 = 0 THEN 'Part time on Fridays' END
FROM generate_series(1, 56) AS i
ON CONFLICT DO NOTHING;

UPDATE "employees"
SET "manager_id" = md5('large-employee-' || ((i % 8) + 1))::uuid
FROM generate_series(9, 56) AS i
WHERE "id" = md5('large-employee-' || i)::uuid AND "manager_id" IS NULL;

-- One main role each; seniors often have a second one.
INSERT INTO "employees_roles" ("employee_id", "role_id")
SELECT md5('large-employee-' || i)::uuid, r."id"
FROM generate_series(1, 56) AS i
JOIN LATERAL (
    SELECT "id" FROM "roles" ORDER BY "label"
    OFFSET abs(hashtext('role-' || i)) % (SELECT count(*) FROM "roles") LIMIT 1
) r ON TRUE
ON CONFLICT DO NOTHING;

INSERT INTO "employees_roles" ("employee_id", "role_id")
SELECT md5('large-employee-' || i)::uuid, r."id"
FROM generate_series(1, 56) AS i
JOIN "roles" r ON r."label" = (ARRAY['Tech Lead', 'Architect', 'Scrum Master'])[abs(hashtext('second-role-' || i)) % 3 + 1]
WHERE i <= 8 OR abs(hashtext('has-second-role-' || i)) % 4 = 0
ON CONFLICT DO NOTHING;

-- Two or three technologies each.
INSERT INTO "employees_technologies" ("employee_id", "technology_id")
SELECT md5('large-employee-' || i)::uuid, t."id"
FROM generate_series(1, 56) AS i
CROSS JOIN LATERAL (
    SELECT "id", row_number() OVER (ORDER BY "label") AS rank, count(*) OVER () AS total FROM "technologies"
) t
WHERE t.rank = (i % t.total) + 1
   OR t.rank = ((i * 5 + 3) % t.total) + 1
   OR (abs(hashtext('third-technology-' || i)) % 3 = 0 AND t.rank = ((i * 11 + 7) % t.total) + 1)
ON CONFLICT DO NOTHING;

-- About two thirds of the skills of their technologies, at a level that tends to grow with seniority.
INSERT INTO "employees_skills" ("employee_id", "skill_id", "level")
SELECT et."employee_id", s."id",
       (ARRAY['NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])[
           LEAST(5, GREATEST(1, abs(hashtext('level-' || et."employee_id" || s."id")) % 3 + 1
               + CASE e."seniority" WHEN 'JUNIOR' THEN 0 WHEN 'MID_LEVEL' THEN 1 ELSE 2 END))]::"LEVEL"
FROM "employees_technologies" et
JOIN "employees" e ON e."id" = et."employee_id"
JOIN "skills" s ON s."technology_id" = et."technology_id"
WHERE e."id" IN (SELECT md5('large-employee-' || i)::uuid FROM generate_series(1, 56) AS i)
  AND abs(hashtext('has-skill-' || et."employee_id" || s."id")) % 3 <> 0
ON CONFLICT DO NOTHING;

-- Missions ----------------------------------------------------------------------------------------------------------
INSERT INTO "missions" ("id", "label", "project_name", "description", "business_unit", "status", "customer_id",
                        "project_manager_id")
SELECT md5('large-mission-' || j)::uuid,
       (ARRAY['Payments platform', 'Customer portal', 'Mobile banking app', 'Data lake', 'Fleet tracking',
              'Booking engine', 'Claims automation', 'Network monitoring', 'Clinical trials app', 'Streaming backend',
              'Mine safety sensors', 'Supply chain visibility', 'Connected car', 'Timetable optimisation',
              'Loyalty programme', 'Smart meters rollout', 'Licensing portal', 'E-commerce replatforming',
              'Water quality dashboards', 'Matchmaking service', 'Site planning tool', 'Citizen services portal',
              'Student information system', 'Port operations', 'Property management', 'API gateway',
              'Identity and access', 'Cloud landing zone', 'Search relaunch', 'Pricing engine', 'Design system',
              'Analytics migration', 'Fraud detection', 'Document management', 'Chatbot assistant'])[j],
       'P-' || lpad(j::text, 3, '0'),
       (ARRAY['Rebuild of a key customer-facing application.', 'Migration of legacy systems to the cloud.',
              'New data platform and reporting.', 'Mobile-first experience for end users.',
              'Automation of manual back-office processes.', 'Modernisation of the integration layer.'])
           [abs(hashtext('description-' || j)) % 6 + 1],
       (ARRAY['DIGITAL', 'DATA', 'CLOUD', 'INFRASTRUCTURE', 'CONSULTING'])
           [abs(hashtext('unit-' || j)) % 5 + 1]::"BUSINESS_UNIT",
       CASE WHEN abs(hashtext('status-' || j)) % 10 < 2 THEN 'PROSPECT'
            WHEN abs(hashtext('status-' || j)) % 10 < 4 THEN 'CONFIRMED'
            WHEN abs(hashtext('status-' || j)) % 10 < 8 THEN 'ONGOING'
            WHEN abs(hashtext('status-' || j)) % 10 < 9 THEN 'COMPLETED'
            ELSE 'CANCELLED' END::"MISSION_STATUS",
       c."id",
       md5('large-employee-' || ((j % 8) + 1))::uuid
FROM generate_series(1, 35) AS j
JOIN LATERAL (
    SELECT "id" FROM "customers" ORDER BY "label" OFFSET (j % (SELECT count(*) FROM "customers")) LIMIT 1
) c ON TRUE
ON CONFLICT DO NOTHING;

-- Two or three required skills each.
INSERT INTO "missions_skills" ("mission_id", "skill_id", "required_level")
SELECT md5('large-mission-' || j)::uuid, s."id",
       (ARRAY['INTERMEDIATE', 'ADVANCED', NULL, 'EXPERT', 'BEGINNER'])[abs(hashtext('required-' || j || '-' || k)) % 5 + 1]::"LEVEL"
FROM generate_series(1, 35) AS j
CROSS JOIN generate_series(1, 3) AS k
JOIN LATERAL (
    SELECT "id" FROM "skills" ORDER BY "id" OFFSET abs(hashtext('mission-skill-' || j || '-' || k)) % (SELECT count(*) FROM "skills") LIMIT 1
) s ON TRUE
WHERE k <= 2 OR abs(hashtext('third-skill-' || j)) % 2 = 0
ON CONFLICT DO NOTHING;

-- Assignments: teams sized and dated according to each mission's status. Some people end up overbooked, as in life.
INSERT INTO "mission_assignments" ("id", "mission_id", "employee_id", "start_date", "end_date", "duration", "rate",
                                   "appreciation")
SELECT md5('large-assignment-' || j || '-' || k)::uuid, m."id",
       md5('large-employee-' || (abs(hashtext('member-' || j || '-' || k)) % 56 + 1))::uuid,
       dates.start_date, dates.end_date, NULL,
       (ARRAY[100, 100, 100, 80, 60, 50, 40])[abs(hashtext('rate-' || j || '-' || k)) % 7 + 1],
       CASE WHEN m."status" = 'COMPLETED' AND k = 1 THEN 'Delivered on time, great feedback from the customer' END
FROM generate_series(1, 35) AS j
CROSS JOIN generate_series(1, 4) AS k
JOIN "missions" m ON m."id" = md5('large-mission-' || j)::uuid
CROSS JOIN LATERAL (
    SELECT CASE m."status"
               WHEN 'ONGOING' THEN CURRENT_DATE - (30 + abs(hashtext('start-' || j || '-' || k)) % 170)
               WHEN 'CONFIRMED' THEN CURRENT_DATE + (5 + abs(hashtext('start-' || j || '-' || k)) % 55)
               ELSE CURRENT_DATE - (250 + abs(hashtext('start-' || j || '-' || k)) % 150) END AS start_date
) s
CROSS JOIN LATERAL (
    SELECT s.start_date,
           CASE WHEN m."status" = 'ONGOING' AND abs(hashtext('open-ended-' || j || '-' || k)) % 8 = 0 THEN NULL
                ELSE s.start_date + (60 + abs(hashtext('length-' || j || '-' || k)) % 200)::int END AS end_date
) dates
WHERE m."status" IN ('ONGOING', 'CONFIRMED', 'COMPLETED')
  AND k <= CASE m."status" WHEN 'ONGOING' THEN 2 + abs(hashtext('team-' || j)) % 3
                           WHEN 'CONFIRMED' THEN 1 + abs(hashtext('team-' || j)) % 2
                           ELSE 2 + abs(hashtext('team-' || j)) % 2 END
ON CONFLICT DO NOTHING;

-- Absences: about half of the people have time off coming, some have a second one later.
INSERT INTO "absences" ("id", "employee_id", "type", "start_date", "end_date", "comment")
SELECT md5('large-absence-' || i || '-' || n)::uuid, md5('large-employee-' || i)::uuid,
       (ARRAY['HOLIDAY', 'HOLIDAY', 'HOLIDAY', 'TRAINING', 'SICK_LEAVE', 'OTHER'])
           [abs(hashtext('absence-type-' || i || '-' || n)) % 6 + 1]::"ABSENCE_TYPE",
       a.start_date, a.start_date + (abs(hashtext('absence-length-' || i || '-' || n)) % 12)::int, NULL
FROM generate_series(1, 56) AS i
CROSS JOIN generate_series(1, 2) AS n
CROSS JOIN LATERAL (
    SELECT CURRENT_DATE + (CASE n WHEN 1 THEN -10 ELSE 90 END) + (abs(hashtext('absence-start-' || i || '-' || n)) % 60)
           AS start_date
) a
WHERE abs(hashtext('has-absence-' || i || '-' || n)) % (CASE n WHEN 1 THEN 2 ELSE 5 END) = 0
ON CONFLICT DO NOTHING;

-- Open positions on prospect, confirmed and ongoing missions.
INSERT INTO "mission_needs" ("id", "mission_id", "role_id", "seniority", "start_date", "end_date", "rate", "comment")
SELECT md5('large-need-' || j || '-' || k)::uuid, m."id", r."id",
       (ARRAY['JUNIOR', 'MID_LEVEL', 'SENIOR', NULL])[abs(hashtext('need-seniority-' || j || '-' || k)) % 4 + 1]::"SENIORITY",
       n.start_date, n.start_date + (90 + abs(hashtext('need-length-' || j || '-' || k)) % 150)::int,
       (ARRAY[100, 100, 80, 50])[abs(hashtext('need-rate-' || j || '-' || k)) % 4 + 1],
       CASE WHEN k = 1 THEN 'Needed to start the next phase' END
FROM generate_series(1, 35) AS j
CROSS JOIN generate_series(1, 2) AS k
JOIN "missions" m ON m."id" = md5('large-mission-' || j)::uuid
JOIN LATERAL (
    SELECT "id" FROM "roles" ORDER BY "label" OFFSET abs(hashtext('need-role-' || j || '-' || k)) % (SELECT count(*) FROM "roles") LIMIT 1
) r ON TRUE
CROSS JOIN LATERAL (SELECT CURRENT_DATE + (7 + abs(hashtext('need-start-' || j || '-' || k)) % 80) AS start_date) n
WHERE m."status" IN ('PROSPECT', 'CONFIRMED', 'ONGOING')
  AND (k = 1 OR abs(hashtext('second-need-' || j)) % 3 = 0)
  AND abs(hashtext('has-need-' || j)) % 4 <> 0
ON CONFLICT DO NOTHING;
