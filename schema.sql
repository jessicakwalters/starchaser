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

INSERT INTO dark_parks (park_name, lat, long) VALUES ('portland', 45.5155, -122.6793);
INSERT INTO dark_parks (park_name, lat, long) VALUES ('chicago', 41.8781, -87.6298);
INSERT INTO dark_parks (park_name, lat, long) VALUES ('new york', 40.7128, -74.006);