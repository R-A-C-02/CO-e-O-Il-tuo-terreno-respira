# utils.py
from app.models import Plot, Species, PlotSpecies
from app.schemas import SaveCoordinatesRequest, SaveCoordinatesResponse
from app.database import SessionLocal
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon, Point
from sqlalchemy import select
from app.utils import get_coefficients_from_db, calculate_co2_o2_hourly
def calcola_impatti(payload):
    coefficients = get_coefficients_from_db()

    plants = [
        {
            "species": s.name.lower(),
            "quantity": 0,
            "area_m2": s.surface_area
        }
        for s in payload.species
    ]

    hourly_weather = [{
        "radiation": 500,
        "temperature": 20,
        "humidity": 60
    }] * 24

    results = calculate_co2_o2_hourly(plants, hourly_weather, coefficients)
    total_co2 = sum(r["co2_kg_day"] for r in results)
    total_o2 = sum(r["o2_kg_day"] for r in results)
    co2o2 = [total_co2, total_o2]
    return co2o2

async def inserisci_terreno(payload: SaveCoordinatesRequest) -> SaveCoordinatesResponse:
    async with SessionLocal() as db:
        # --- Geometrie (POLYGON e POINT) ---
        polygon = Polygon([(v.lng, v.lat) for v in payload.vertices])
        point = Point(payload.centroid.lng, payload.centroid.lat)

        # --- Crea Plot ---
        plot = Plot(
            name=payload.terrainName,
            user_id=1,  # Sostituisci con ID utente reale
            geom=from_shape(polygon, srid=4326),
            centroid=from_shape(point, srid=4326),
        )
        db.add(plot)
        await db.flush()  # ottieni plot.id


        


        for specie_input in payload.species:
            # Recupera o fallisce se specie non esiste
            result = await db.execute(select(Species).where(Species.name == specie_input.name))
            specie = result.scalar_one_or_none()
            if not specie:
                raise ValueError(f"Specie '{specie_input.name}' non trovata nel DB")

            co2 = specie.co2_absorption_rate * specie_input.surface_area
            o2 = specie.o2_production_rate * specie_input.surface_area

            co2o2=calcola_impatti(payload)

            total_co2 = co2o2[0]
            total_o2 = co2o2[1]

            # Crea record PlotSpecies
            ps = PlotSpecies(
                plot_id=plot.id,
                species_id=specie.id,
                surface_area=specie_input.surface_area,
                actual_co2_absorption=co2,
                actual_o2_production=o2
            )
            db.add(ps)

        # Aggiorna valori totali nel plot
        plot.total_co2_absorption = total_co2
        plot.total_o2_production = total_o2

        await db.commit()

        return SaveCoordinatesResponse(
            message="Terreno salvato correttamente",
            terrain_id=plot.id
        )

def mostra_classifica():
    pass

class Esporta:
    pass
