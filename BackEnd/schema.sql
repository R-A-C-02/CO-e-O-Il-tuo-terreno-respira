-- PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL    created_at TIMESTAMP DEFAULT NOW()
);

-- Users Natural Persons
CREATE TABLE natural_person (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE, --Se una riga nella tabella users viene eliminata, allora automaticamente verrà eliminata anche la riga collegata in natural_person o society che ha lo stesso user_id
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    province VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users Society
CREATE TABLE society (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    ragione_sociale VARCHAR(150) NOT NULL,
    sede_legale VARCHAR(200),
    partita_IVA VARCHAR(20) UNIQUE NOT NULL, 
    COD_FIS VARCHAR (20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Plots
CREATE TABLE plots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    geom GEOMETRY(POLYGON, 4326),           -- Polygon
    centroid GEOMETRY(POINT, 4326),         -- Centroid point
    created_at TIMESTAMP DEFAULT NOW(),
    total_co2_absorption FLOAT DEFAULT 0,
    total_o2_production FLOAT DEFAULT 0
);

-- Plant Species
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    co2_absorption_rate FLOAT -- kg/day/m²
    o2_production_rate  FLOAT -- kg/day/m²

);

-- Plot-Species Association
CREATE TABLE plot_species (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id),
    species_id INTEGER REFERENCES species(id),
    surface_area FLOAT,              -- Area occupied by the species (e.g., m² per unit)
    -- actual_co2_absorption FLOAT,    -- Total CO2 absorption by this quantity
    -- actual_o2_production FLOAT      -- Total O2 production by this quantity
);

-- Weather Data
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id),
    date_time TIMESTAMP NOT NULL,
    temperature FLOAT,
    precipitation FLOAT,
    solar_radiation FLOAT,
    humidity INTEGER,
    total_co2_absorption ,
    total_o2_production
);


-- database co2app già creato

-- questo comando crea le tabelle nel database che è gia creato su postgres:
-- psql -U postgres -d co2app -f schema.sql

