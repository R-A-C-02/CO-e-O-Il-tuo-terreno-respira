import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv
from models import WeatherData
from parte_finale_connect_db import recupero_coords_geocentroide

coords = list(recupero_coords_geocentroide().values())
# {'plot_id': 1, 'latitudine': 41.8902, 'longitudine': 12.4924}

plot_id = coords[0]["plot_id"]
latitude = coords[0]["latitudine"]
longitude = coords[0]["longitudine"]

def fetch_and_save_weather_day(plot_id, lat, lon):

    # DB CONNECTION
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,relative_humidity_2m,precipitation,shortwave_radiation",
        "forecast_days": "1"
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print(f"❌ Errore nella richiesta meteo: {response.status_code}")
        return False

    hourly = response.json()["hourly"]

    # PARSING & SAVING
    for i in range(len(hourly["time"])):
        timestamp = datetime.fromisoformat(hourly["time"][i])
        
        weather = WeatherData(
            plot_id = plot_id,
            date_time = timestamp,
            temperature = hourly["temperature_2m"][i],
            humidity = hourly["relative_humidity_2m"][i],
            precipitation = hourly["precipitation"][i],
            solar_radiation = hourly["shortwave_radiation"][i])
        
        session.add(weather)

    session.commit()
    session.close()
    print("✅ Dati meteo salvati nel database.")
    return True

def fetch_weather_week(plot_id, lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
    "latitude": lat,
    "longitude": lon,
    "daily": "temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,shortwave_radiation_sum",
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print(f"❌ Errore nella richiesta meteo: {response.status_code}")
        return False

    daily = response.json()["daily"]
    data = []

    for i in range(len(daily["time"])):
        data.append({
            "date": daily["time"][i],
            "temperature": daily["temperature_2m_mean"][i],
            "humidity": daily["relative_humidity_2m_mean"][i],
            "precipitation": daily["precipitation_sum"][i],
            "radiation": daily["shortwave_radiation_sum"][i]
        })

    print("✅ Dati meteo settimanali ottenuti.")
    return data

print(fetch_weather_week(plot_id, latitude, longitude))