CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  age INTEGER CHECK (age >= 18),
  bio TEXT, 
  interests TEXT NOT NULL,
  image_url TEXT, (result.key)
  location VARCHAR(5),
  radius INT NOT NULL DEFAULT 5,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username VARCHAR(25) NOT NULL REFERENCES users,
  to_username VARCHAR(25) NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE likes (
  liker VARCHAR(25) NOT NULL REFERENCES users,
  liked VARCHAR(25) NOT NULL REFERENCES users,
  PRIMARY KEY (liker, liked)
);

CREATE TABLE matches (
  username_first VARCHAR(25) NOT NULL REFERENCES users,
  username_second VARCHAR(25) NOT NULL REFERENCES users,
  PRIMARY KEY (username_first, username_second)
);