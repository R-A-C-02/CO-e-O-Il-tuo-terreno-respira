import os
import psycopg2
from datetime import datetime
from typing import List, Dict, Any
from collections import defaultdict
from dotenv import load_dotenv
import pandas as pd


DATABASE_URL = "postgresql://postgres:postgres@165.22.75.145:15432/co2app"
print("Mi connetto a:", DATABASE_URL)

conn = psycopg2.connect(DATABASE_URL)

def get_coefficients_from_db() -> Dict[str, Dict[str, float]]:
    cursor = conn.cursor()
    cursor.execute("SELECT name, co2_absorption_rate, o2_production_rate FROM species;")
    rows = cursor.fetchall()
    cursor.close()
    return {
        row[0].lower(): {
            "co2": row[1],
            "o2": row[2]
        } for row in rows
    }

def get_weather_data_from_db(plot_id: int, date: str) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date_time, temperature, humidity, precipitation, solar_radiation
        FROM weather_data
        WHERE plot_id = %s AND date_time::date = %s
        ORDER BY date_time ASC;
    """, (plot_id, date))
    rows = cursor.fetchall()
    cursor.close()
    return [{
        "datetime": row[0],
        "temperature": row[1],
        "humidity": row[2],
        "precipitation": row[3],
        "radiation": row[4]
    } for row in rows]

def get_species_from_db(plot_id: int) -> List[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.name, ps.surface_area
        FROM plot_species ps
        JOIN species s ON ps.species_id = s.id
        WHERE ps.plot_id = %s
    """, (plot_id,))
    rows = cursor.fetchall()
    cursor.close()
    return [
        {"species": row[0].lower(), "area_m2": row[1]}
        for row in rows
        if row[1] is not None and row[1] > 0
    ]
def calculate_co2_o2_hourly(plants: List[Dict[str, Any]], hourly_weather: List[Dict[str, Any]], coefficients: Dict[str, Dict[str, float]]) -> List[Dict[str, Any]]:
    results = []
    for plant in plants:
        species = plant.get("species", "").lower()
        area = plant.get("area_m2", 0)

        if species not in coefficients:
            print(f"⚠️ Coefficienti mancanti per '{species}'")
            continue

        co2_factor = coefficients[species]["co2"]
        o2_factor = coefficients[species]["o2"]
        total_co2 = 0
        total_o2 = 0

        for hour in hourly_weather:
            radiation = hour.get("radiation", 0)
            temperature = hour.get("temperature", 20)
            humidity = hour.get("humidity", 60)

            rad_factor = min(radiation / 800, 1.0)
            temp_factor = min(temperature / 25, 1.0)
            hum_factor = min(humidity / 60, 1.0)

            meteo_factor = rad_factor * temp_factor * hum_factor
            base = area
            co2_hour = base * co2_factor * meteo_factor
            o2_hour = base * o2_factor * meteo_factor

            total_co2 += co2_hour
            total_o2 += o2_hour

        results.append({
            "species": species,
            "co2_kg_day": round(total_co2, 3),
            "o2_kg_day": round(total_o2, 3)
        })

    return results

if __name__ == "__main__":
    coefficients = get_coefficients_from_db()
    weather = get_weather_data_from_db(1, "2023-10-01")
    user_plants = get_species_from_db(1)

    results = calculate_co2_o2_hourly(user_plants, weather, coefficients)
    print("Risultato (list of dict):", results)
    df = pd.DataFrame(results)
    print("\nRisultato in DataFrame:")
    print(df)
