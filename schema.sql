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