import json
import pandas as pd
from collections import defaultdict

#FUNZIONE PER CALCOLARE IL CO2 E L'O2 DI UNA PLANT IN UNA DATA ORA

def calculate_co2_o2_hourly(plants, hourly_weather, coefficients):              # PRENDO IN INPUT UNA LISTA DEI PLANT, UNA LISTA DI DATI METEO E UNA LISTA DI COEFFICIENTI
    results = []                                                                # CREO UNA LISTA
    for plant in plants:                                                        
        species = plant.get("species")                                          # PER OGNI PLANT DALLA LISTA DEI PLANT CREO UN DIZIONARIO
        quantity = plant.get("quantity", 0)
        area = plant.get("area_m2", 0)

        if species not in coefficients:
            print(f"⚠️  Attenzione: non sono presenti dati per la specie '{species}' nei coefficienti.")
            continue

        co2_factor = coefficients[species]["co2"]
        o2_factor = coefficients[species]["o2"]
                                       # PER OGNI SPECIE nella LISTA DEI COEFFICIENTI CREO UN DIZIONARIO
        total_co2 = 0
        total_o2 = 0
                                                          # INIZIALIZZO IL CO2 A 0

        for hour in hourly_weather:                                         
            radiation = hour.get("radiation", 0)                                # ITERO SU LA LISTA DI DATI METEO
            temperature = hour.get("temperature", 20)
            humidity = hour.get("humidity", 60)

            rad_factor = min(radiation / 800, 1.0)                              # CALCOLO GLI INDICATORI UTILI AL FACTOR DEL METEO
            temp_factor = min(temperature / 25, 1.0)                        # DACONTROLLARE
            hum_factor = min(humidity / 60, 1.0)

            meteo_factor = rad_factor * temp_factor * hum_factor                # DEFINISCO IL FACTOR DEL METEO
            base = area if area else quantity                                   
            co2_hour = base * co2_factor * meteo_factor
            total_co2 += co2_hour

            o2_hour = base * o2_factor * meteo_factor
            total_o2 += o2_hour                                             

        results.append({
            "species": species,
            "co2_kg_day": round(total_co2, 3),
            "o2_kg_day": round(total_o2, 3)
        })

    return results                                                          # RITORNO LA LISTA DI DIZIONARI

# Carica i dati                           PARTE DA MODIFICARE QUANDO TUTTE LE ROUTE E LE API SONO FUNZIONANTI
with open("plants.json", "r", encoding="utf-8") as f:
    plants = json.load(f)

with open("coefficients.json", "r", encoding="utf-8") as f:
    raw_coefficients = json.load(f)
    coefficients = {
        item["name"]: {
            "co2": item["co2_absorption_rate"],
            "o2": item["o2_production_rate"]
        }
        for item in raw_coefficients
    }

with open("weather.json", "r", encoding="utf-8") as f:
    weather_data = json.load(f)

# Gruppo le ore per giorno              GRUPPO LE ORE PER DATA UNICA IN UNA LISTA DI DIZIONARI
grouped = defaultdict(list)         
for hour in weather_data:
    date = hour["datetime"][:10]
    grouped[date].append(hour)

# Calcolo CO2/O2 per giorno          CREO UNA LISTA DI DIZIONARI CON I DATI DI CO2 E O2 PER OGNI SPECIE
records = []
for date, hourly_weather in grouped.items():                                    # Per ogni giorno creo un dizionario con i dati di CO2 e O2 per ogni specie
    results = calculate_co2_o2_hourly(plants, hourly_weather, coefficients)     # Calcolo CO2 e O2 per ogni specie
    for res in results:
        records.append({
            "Data": date,
            "Specie": res["species"],
            "CO2 (kg)": res["co2_kg_day"],
            "O2 (kg)": res["o2_kg_day"]
        })                                                          #LISTA DI DIZIONARI CON I DATI DI CO2 E O2 PER OGNI SPECIE COMPLETATA

# Costruzione tabella                           DALLA LISTA DI DIZIONARI CREO UN DATAFRAME
df = pd.DataFrame(records)          
print(df)                                       #TABELLA CON I DATI DI CO2 E O2 PER OGNI SPECIE COMPLETATA

# Esporta (facoltativo)                         GENERA UNA TABELLA E ESPORTA IL DATAFRAME IN UN FILE CSV è UNA PROVA CHE ANDRà IMPLEMENTATE IN FRONTEND
df.to_csv("tabella_risultati.csv", index=False)
