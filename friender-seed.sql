-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, age, bio, interests, image_url, location, radius, is_admin)
VALUES ('ben',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Ben',
        'Jacobson',
        'testing@gmail.com',
        28,
        'Testing out the bio portion',
        'Basketball, coding',
        NULL,
        11211,
        5,
        TRUE),
      ('kat',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Kat',
        'Huang',
        'testing1@gmail.com',
        30,
        'Testing out the bio portion',
        'Coding',
        NULL,
        11212,
        5,
        TRUE),
      ('nate',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Nate',
        'Lipp',
        'testing2@gmail.com',
        36,
        'Testing out the bio portion',
        'Coding',
        NULL,
        11213,
        5,
        FALSE),
      ('matt',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Matt',
        'Lane',
        'testing3@gmail.com',
        35,
        'Testing out the bio portion',
        'Coding',
        NULL,
        11212,
        5,
        FALSE),
      ('tim',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Tim',
        'Garcia',
        'testing4@gmail.com',
        38,
        'Testing out the bio portion',
        'Coding',
        NULL,
        11211,
        5,
        FALSE)
