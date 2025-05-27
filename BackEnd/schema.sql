-- Estensione PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Utenti
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Terreni
CREATE TABLE plots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    geom GEOMETRY(POLYGON, 4326),           -- Poligono
    centroid GEOMETRY(POINT, 4326),         -- Punto centrale
    created_at TIMESTAMP DEFAULT NOW()
);

-- Specie vegetali
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    co2_absorption_rate FLOAT,  -- kg/giorno/unità
    o2_production_rate FLOAT    -- kg/giorno/unità
);

-- Associazione terreno-specie
CREATE TABLE plot_species (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id),
    species_id INTEGER REFERENCES species(id),
    quantity FLOAT NOT NULL
);

-- Dati meteo
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id),
    date DATE NOT NULL,
    temperature FLOAT,
    precipitation FLOAT,
    solar_radiation FLOAT
);


-- database co2app già creato

-- questo comando crea le tabelle nel database che è gia creato su postgres:
-- psql -U postgres -d co2app -f schema.sql
