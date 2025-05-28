from geopy.distance import geodesic
import pandas as pd
import psycopg2 
from dotenv import load_dotenv
import os
import sys  

#funzione "matematica"
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

# Dizionario da cui prendiamo il valore id_variabile
params = {'id': 6}  
# da inserire la funzione di collegamento con il "frontend" (è+ sbalito lo so , ma per capirci)


query = """
SELECT id, ST_X(centroid) AS longitude, ST_Y(centroid) AS latitude
FROM plots WHERE id= %s;
"""
cur.execute(query, (params['id'],))
row = cur.fetchone()  # Prendiamo UNA sola riga

diz_centroide = {}

if row:
    plot_id = row[0]
    longitude = row[1]
    latitude = row[2]

    diz_centroide[plot_id] = {
        'latitudine': latitude,
        'longitudine': longitude
    }
    print(f"\nPlot ID: {plot_id}, Latitudine: {latitude}, Longitude: {longitude}")

else:
    print(f"\nNessun plot trovato con id {params['id']}")
    cur.close()
    conn.close()
    sys.exit()

# Chiudere la connessione
cur.close()
conn.close()


# Lista di stazioni meteo 
df = pd.read_csv('stazioni_meteo_ITALIA_pulite.csv')
punti_meteo = df.values.tolist()
# print (punti_meteo)

# Trova la stazione più vicina
centroide_terreno= (diz_centroide['latitudine'], diz_centroide['longitudine'])
stazione, distanza = trova_stazione_piu_vicina(centroide_terreno, punti_meteo)

print(f"\nLa stazione meteo più vicina al terreno è: {stazione} a circa {distanza:.2f} km")