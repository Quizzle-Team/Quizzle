CREATE TABLE IF NOT EXISTS search (
    quizname         text,
    quizdescription  text,
    quizurl          text UNIQUE PRIMARY KEY,
    keywords         text,
    createdby        text
);CREATE TABLE IF NOT EXISTS users (
    username text UNIQUE PRIMARY KEY,
    pwdhash text,
    administrator boolean
);

INSERT INTO users(username,pwdhash,administrator) VALUES ('admin', 'd92ff72f779259305ebb5e9989c019b411cedd5ad9f2be59b284be0c69d3738f', true);
INSERT INTO users(username,pwdhash,administrator) VALUES ('adoman','9db5b1cf11facadaea1cc6bcc3fd17a6a8c9822057565ab4d1513f7595bd90d7', false);
INSERT INTO search (quizname, quizdescription, quizurl, keywords, createdby) VALUES ('Quiz Name Here', 'Quiz Description','URL here', 'Keywords here', 'Walter Hartwell White');