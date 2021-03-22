DROP TABLE IF EXISTS users;
CREATE TABLE users (
    ID SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS custom_sets;

CREATE TABLE custom_sets (
    ID SERIAL PRIMARY KEY,
    words TEXT,
    user_id INT NOT NULL,
     CONSTRAINT fk_custom_sets_user 
        FOREIGN KEY (user_id)
            REFERENCES users (ID) 
            ON DELETE CASCADE
);

-- INSERT INTO users(username, email, password) VALUES ('Jarrell28', 'jhouston2882@gmail.com', 'password');
-- INSERT INTO users(username, email, password) VALUES ('Jarrell', 'jhouston2882@gmail.com', 'password');

-- INSERT INTO favorites (favorites, user_id) VALUES ('word1,word3', 2);

-- INSERT INTO custom_sets (words, user_id) VALUES ('word1,word2', 1);

-- SELECT * FROM favorites WHERE user_id = 1;

-- SELECT * FROM users INNER JOIN favorites ON users.id = favorites.user_id;