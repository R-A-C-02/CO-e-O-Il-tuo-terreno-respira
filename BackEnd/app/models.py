from pydantic import BaseModel, Field
from typing import List

class Coordinate(BaseModel):
    lat: float
    lon: float

class SpecieVegetale(BaseModel):
    nome: str
    quantita: int = Field(..., gt=0, description="Numero di piante o metri quadrati")

class CalcoloRequest(BaseModel):
    terreno: List[Coordinate]
    vegetazione: SpecieVegetale
    vegetazione: List[SpecieVegetale]

class CalcoloResponse(BaseModel):
    co2_giornaliera: float
    o2_giornaliera: float
    dettaglio_per_specie: List[dict]  # Esempio: {"nome": "quercia", "co2": 12.4, "o2": 8.1} (vogliamo farlo così?)

class InserisciRequest(BaseModel):
    utente : str
    terreno: List[Coordinate]
    vegetazione: SpecieVegetale
   

class InserisciResponse(BaseModel):
    esito : str

class ClassificaRequest(BaseModel):
    criterio: str

class ClassificaResponse(BaseModel):
    Classifica: List[dict]
    


