DROP TABLE IF EXISTS loca;
CREATE TABLE loca(
    id SERIAL PRIMARY KEY,
    search VARCHAR(255),
    name VARCHAR(255),
    lat NUMERIC,
    lon NUMERIC
);
