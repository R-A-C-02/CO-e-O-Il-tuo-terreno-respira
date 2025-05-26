INSERT INTO species (name, co2_absorption_rate, o2_production_rate)
VALUES 
  ('Quercia', 21.5, 16.3),
  ('Pino', 17.2, 14.8),
  ('Mais', 2.4, 1.8),
  ('Faggio', 19.0, 15.1);



-- psql -U tuo_utente -d co2app -f seed_data.sql
