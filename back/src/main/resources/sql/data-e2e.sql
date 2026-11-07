INSERT INTO users (first_name, last_name, admin, email, password)
VALUES (
           'Admin', 'Admin', true, 'yoga@studio.com',
           '$2y$10$5p5sgw16rUrG4MzNlUc2CukFN2RYL6daYhO.L7haAWIJHzWd/6I3m'
       );

INSERT INTO users (first_name, last_name, admin, email, password)
VALUES (
           'Test', 'User', false, 'user@yoga.test',
           '$2y$10$5p5sgw16rUrG4MzNlUc2CukFN2RYL6daYhO.L7haAWIJHzWd/6I3m'
       );

INSERT INTO teachers (first_name, last_name)
VALUES ('Sophie', 'Martin');

INSERT INTO teachers (first_name, last_name)
VALUES ('Thomas', 'Bernard');

INSERT INTO sessions (name, date, description, teacher_id)
VALUES (
           'Yoga débutant',
           '2027-01-15 10:00:00',
           'Séance de yoga adaptée aux débutants.',
           (SELECT id FROM teachers WHERE first_name = 'Sophie' AND last_name = 'Martin')
       );


INSERT INTO sessions (name, date, description, teacher_id)
VALUES (
           'Yoga relaxation',
           '2027-01-25 09:00:00',
           'Séance de relaxation et de respiration.',
           (SELECT id FROM teachers WHERE first_name = 'Sophie' AND last_name = 'Martin')
       );

INSERT INTO participate (session_id, user_id)
VALUES (
           (SELECT id FROM sessions WHERE name = 'Yoga débutant'),
           (SELECT id FROM users WHERE email = 'user@yoga.test')
       );


INSERT INTO sessions (name, date, description, teacher_id)
VALUES (
           'Yoga avancé',
           '2027-01-20 14:00:00',
           'Séance de yoga pour pratiquants expérimentés',
           (SELECT id FROM teachers WHERE first_name = 'Thomas' AND last_name = 'Bernard')
       );