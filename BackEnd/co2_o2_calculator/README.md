📘 README.md – CO₂/O₂ Summary Calculator
🌱 Descrizione del progetto
Questo script calcola la quantità di CO₂ assorbita e O₂ prodotta giornalmente da un insieme di specie vegetali, in base:

al meteo orario (temperatura, umidità, radiazione solare)
ai coefficienti di assorbimento per specie
alla quantità o superficie coltivata
Il risultato è una tabella giornaliera di output in formato CSV e visibile in console.

🔁 Flusso dati
Dati meteo orari arrivano da API (Open-Meteo), simulati ora con weather.json
Dati delle piante arriveranno via Flask come JSON (ora simulati in plants.json)
Coefficienti di assorbimento verranno dal database (ora letti da coefficients.json)
Tutto viene elaborato da calculate_co2_o2_hourly()

I risultati giornalieri sono aggregati e salvati in tabella_risultati.csv

📂 File principali
File	Descrizione
co2_o2_calculator.py	Funzione principale di calcolo orario CO₂/O₂
daily_summary.py	Script completo per caricare i dati e generare output
plants.json	Specie vegetali e quantità o superficie (simulati)
coefficients.json	Coefficienti assorbimento per specie (kg/h per unità)
weather.json	Dati meteo orari ottenuti da Open-Meteo API

📥 Esempio input (plants.json)                  ----------> Simone avra un route che prende i dati li salva nel db e poi prenderla da qui tramite Query


json

[
  { "species": "quercia", "quantity": 5 },
  { "species": "pino", "quantity": 10 },
  { "species": "mais", "area_m2": 300 }
]
🔢 Esempio coefficienti (coefficients.json)         ----------> Alice dovra inserire la lista nel db e poi prenderla da qui trami Query
json

{
  "quercia": 0.0015,
  "pino": 0.0013,
  "mais": 0.0002
}
🌤 Esempio meteo (weather.json)
Contiene un array orario con:

json                                                ----------> Simone dovra creare una route che prende i dati da Open-Meteo API e poi prenderla da qui tramite Query
{
  "datetime": "2025-05-23T14:00",
  "temperature": 12.1,
  "humidity": 47,
  "precipitation": 0.0,
  "radiation": 472.8
}

▶️ Come eseguire
Assicurati di avere Python e le librerie richieste (pandas).

bash

cd BackEnd/
python daily_summary.py


🧾 Output
-  Tabella stampata in console
-  File CSV generato: tabella_risultati.csv

(ASSICURATI DI AVERE PANDAS)


🔜 Integrazione futura
Origine dati	        Ora	               In futuro
weather.json	    File statico	    ➡️ API Open-Meteo live
plants.json	        File statico	    ➡️ Query da Database (JSON da API Flask)
coefficients.json	File statico	    ➡️ Query da Database


📌 Cosa resta da collegare ---ISTRUZIONI PER DOMANI SE NON VI è CHIARO COSA FARE------ 
- Simone: creare una route Flask che accetta il JSON di piante e lo passa al modulo di calcolo
- Alice: inserire i coefficienti nel DB, creare una query e restituire il dict in formato compatibile
- Simone: gestire la chiamata a Open-Meteo, trasformare la risposta in lista di dizionari per il modulo

✅ Tutti i JSON di esempio sono già pronti come struttura
✅ Il calcolo funziona per ogni giorno (24h) e stampa + salva
