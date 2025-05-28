from collections import defaultdict
import psycopg2

# Funzione per ottenere i coefficienti dal DB (la tieni)
def get_coefficients_from_db():
    
    conn = psycopg2.connect(
        host="localhost",
        database="co2_project",
        user="postgres",
        password="password"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT name, co2_absorption_rate, o2_production_rate FROM coefficients;")
    rows = cursor.fetchall()
    conn.close()

    return {
        row[0].lower(): {
            "co2": row[1],
            "o2": row[2]
        }
        for row in rows
    }

# Funzione principale di calcolo (non cambia)
def calculate_co2_o2_hourly(plants, hourly_weather, coefficients):
    results = []
    for plant in plants:
        species = plant.get("species")
        quantity = plant.get("quantity", 0)
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
            base = area if area else quantity
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
