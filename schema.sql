
DROP TABLE IF EXISTS dark_parks;

CREATE TABLE dark_parks (
 id SERIAL PRIMARY KEY,
 park_name VARCHAR(255),
 location_name VARCHAR(255),
 lat NUMERIC(10, 7),
 long NUMERIC(10, 7),
 img_url VARCHAR(255),
 learn_more_url VARCHAR(255),
 idsa_desig VARCHAR(255)
);
