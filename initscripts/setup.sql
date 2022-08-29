CREATE TABLE IF NOT EXISTS search (
    quizname         text,
    quizdescription  text,
    quizurl          text UNIQUE PRIMARY KEY,
    keywords         text,
    createdby        text
);CREATE TABLE IF NOT EXISTS users (
    username text UNIQUE PRIMARY KEY,
    pwdhash text
);

INSERT INTO search (quizname, quizdescription, quizurl, keywords, createdby) VALUES ('Quiz Name Here', 'Quiz Description','URL here', 'Keywords here', 'Walter Hartwell White');