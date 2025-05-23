from geopy.distance import geodesic

def trova_stazione_piu_vicina(terreno, punti_meteo):
    '''
    Trova la stazione meteo più vicina al terreno.
    
    :param terreno: tuple (lat, lon) delle coordinate del terreno
    :param punti_meteo: lista di tuple (nome, lat, lon) delle stazioni meteo
    :return: nome della stazione più vicina e la distanza in km
    '''

    stazione_piu_vicina = None
    distanza_minima = float('inf')
    
    for nome, lat, lon in punti_meteo:
        try:
            distanza = geodesic(terreno, (lat, lon)).kilometers
            if distanza < distanza_minima:
                distanza_minima = distanza
                stazione_piu_vicina = nome
        except Exception as e:
            print(f"Errore calcolando la distanza per {nome}: {e}")
    
    return stazione_piu_vicina, distanza_minima








# Esempio di utilizzo:

# Coordinate del terreno (sostituisci con le tue coordinate)
lat_terreno = 45.1234
lon_terreno = 9.5678
terreno = (lat_terreno, lon_terreno)

# Lista di stazioni meteo (aggiungi le tue stazioni)
punti_meteo = [
    ('Stazione1', 45.1240, 9.5680),
    ('Stazione2', 45.1300, 9.5600),
    ('Stazione3', 45.1150, 9.5800),
]

# Trova la stazione più vicina
stazione, distanza = trova_stazione_piu_vicina(terreno, punti_meteo)

print(f"\nLa stazione meteo più vicina al terreno è: {stazione} a circa {distanza:.2f} km")