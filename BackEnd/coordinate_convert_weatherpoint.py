from geopy.distance import geodesic
import pandas as pd
import psycopg2 
from dotenv import load_dotenv
import os

def trova_stazione_piu_vicina(x, y):
    stazione_piu_vicina = None
    distanza_minima = float('inf')
    
    for nome, lat, lon in y:
        try:
            distanza = geodesic(x, (lat, lon)).kilometers
            if distanza < distanza_minima:
                distanza_minima = distanza
                stazione_piu_vicina = nome
        except Exception as e:
            print(f"Errore calcolando la distanza per {nome}: {e}")
    
    return stazione_piu_vicina, distanza_minima



# Connessione al database

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL_geo_station")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

query = """
SELECT id, ST_X(centroid) AS longitude, ST_Y(centroid) AS latitude
FROM plots;
"""
cur.execute(query)
rows = cur.fetchall()


# Coordinate del terreno (sostituisci con le tue coordinate)
diz_centroide = {}

for row in rows:
    plot_id = row[0]
    longitude = row[1]
    latitude = row[2]

    diz_centroide[plot_id] = {
        'latitude': latitude,
        'longitude': longitude
    }

# Chiudere la connessione
cur.close()
conn.close()

#centroide_terreno = (diz_centroide['latitude'], diz_centroide['longitude'])
for plot_id, coords in diz_centroide.items():
    print(f"Plot ID {plot_id}:Latitude {coords['latitude']}, Longitude {coords['longitude']}")


# # Lista di stazioni meteo 
# df = pd.read_csv('stazioni_meteo_ITALIA_pulite.csv')
# punti_meteo = df.values.tolist()
# # print (punti_meteo)

# # Trova la stazione più vicina
# stazione, distanza = trova_stazione_piu_vicina(centroide_terreno, punti_meteo)

# print(f"\nLa stazione meteo più vicina al terreno è: {stazione} a circa {distanza:.2f} km")