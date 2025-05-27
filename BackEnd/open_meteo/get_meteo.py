import requests
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv
from BackEnd.app.models import Plot, WeatherData

PLOT_ID = "" # VA PRESO TRAMITE UNA CHIAMATA AL FRONTEND

# DB CONNECTION
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Recupera solo il plot con quell'ID
plot = session.query(
    Plot.id,
    func.ST_Y(Plot.centroid).label("latitude"),
    func.ST_X(Plot.centroid).label("longitude")
).filter(Plot.id == PLOT_ID).first()

if not plot:
    print(f"❌ Nessun plot trovato con ID {PLOT_ID}.")
    exit()

plot_id = plot.id
latitude = plot.latitude
longitude = plot.longitude

params = {
    "latitude": latitude,
    "longitude": longitude,
    "hourly": "temperature_2m,relative_humidity_2m,precipitation,shortwave_radiation"
}
url = "https://api.open-meteo.com/v1/forecast"

response = requests.get(url, params=params)

if response.status_code != 200:
    print(f"❌ Errore nella richiesta meteo: {response.status_code}")
    exit()

content = response.json()

hourly = content["hourly"]

# PARSING & SAVING
for i in range(len(hourly["time"])):
    timestamp = datetime.fromisoformat(hourly["time"][i])
    
    weather = WeatherData(
        plot_id = PLOT_ID,
        date = timestamp.date(),
        temperature = hourly["temperature_2m"][i],
        humidity = hourly["relative_humidity_2m"][i],
        precipitation = hourly["precipitation"][i],
        solar_radiation = hourly["shortwave_radiation"][i])
    
    session.add(weather)

session.commit()
session.close()
print("✅ Dati meteo salvati nel database.")