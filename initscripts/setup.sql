CREATE TABLE IF NOT EXISTS search (
    quizname         text,
    quizdescription  text,
    quizurl          SERIAL PRIMARY KEY,
    keywords         text,
    createdby        text
);CREATE TABLE IF NOT EXISTS users (
    username text UNIQUE PRIMARY KEY,
    pwdhash text,
    administrator boolean
);

INSERT INTO users(username,pwdhash,administrator) VALUES ('admin', 'd92ff72f779259305ebb5e9989c019b411cedd5ad9f2be59b284be0c69d3738f', true);