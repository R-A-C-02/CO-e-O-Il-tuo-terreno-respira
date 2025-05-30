from BackEnd.app.models import Plot, Species, PlotSpecies
from BackEnd.app.schemas import SaveCoordinatesRequest, SaveCoordinatesResponse
from BackEnd.app.database import SessionLocal
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon, Point
from sqlalchemy import select
from BackEnd.app.co2_o2_calculator import get_coefficients_from_db, calculate_co2_o2_hourly
from sqlalchemy import delete


def get_species_distribution_by_plot(plot_id):
    import psycopg2
    conn = psycopg2.connect(...)  # Usa la tua stringa di connessione!
    cursor = conn.cursor()
    cursor.execute("""
        SELECT species.name, plot_species.surface_area
        FROM plot_species
        JOIN species ON species.id = plot_species.species_id
        WHERE plot_species.plot_id = %s
    """, (plot_id,))
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    # Restituisci una lista di dizionari per il frontend
    return [{"name": row[0], "surface_area": row[1]} for row in result]

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
            centroid=from_shape(point, srid=4326)
        )
        db.add(plot)
        await db.flush()  # ottieni plot.id


        for specie_input in payload.species:
            # Recupera o fallisce se specie non esiste
            result = await db.execute(select(Species).where(Species.name == specie_input.name))
            specie = result.scalar_one_or_none()
            if not specie:
                raise ValueError(f"Specie '{specie_input.name}' non trovata nel DB")


            # Crea record PlotSpecies
            ps = PlotSpecies(
                plot_id=plot.id,
                species_id=specie.id,
                surface_area=specie_input.surface_area,
            )
            db.add(ps)

        await db.commit()

        return SaveCoordinatesResponse(
            message="Terreno salvato correttamente",
            terrain_id=plot.id
        )

async def aggiorna_nome_plot(user_id: int, old_name: str, new_name: str) -> dict:
    async with SessionLocal() as db:
        # Cerco il plot col nome, e assicuro che appartenga all'utente
        result = await db.execute(
            select(Plot)
            .where(Plot.name == old_name, Plot.user_id == user_id)
        )
        plot = result.scalar_one_or_none()

        if not plot:
            raise ValueError(f"Plot '{old_name}' non trovato per l'utente ID {user_id}")

        # Aggiorna il nome
        plot.name = new_name
        await db.commit()

        return {"message": "Nome del terreno aggiornato", "terrain_id": plot.id}

async def elimina_plot(user_id: int, plot_name: str) -> dict:
    async with SessionLocal() as db:
        result = await db.execute(
            select(Plot)
            .where(Plot.name == plot_name, Plot.user_id == user_id)
        )
        plot = result.scalar_one_or_none()

        if not plot:
            raise ValueError(f"Plot '{plot_name}' non trovato per l'utente ID {user_id}")

        # Elimino prima i record figli se serve (PlotSpecies, WeatherData, ecc.)
        await db.execute(
            delete(PlotSpecies).where(PlotSpecies.plot_id == plot.id)
        )

        # Poi il plot
        await db.delete(plot)
        await db.commit()

        return {"message": f"Terreno '{plot_name}' eliminato correttamente"}

def mostra_classifica():
    pass

class Esporta:
    pass
