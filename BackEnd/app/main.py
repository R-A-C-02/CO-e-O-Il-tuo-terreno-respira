from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.models import CalcoloRequest, CalcoloResponse, InserisciRequest, InserisciResponse, ClassificaRequest, ClassificaResponse, EsportaRequest, EsportaResponse
from app.utils import calcola_impatti,inserisci_terreno,mostra_classifica,Esporta
from app.routes import weather


app = FastAPI()
app.include_router(weather.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "CO₂ e O₂ - Web App API online!"}

@app.get("/calcola", response_model=CalcoloResponse)
async def calcola_impatti_ambientali(payload: CalcoloRequest):
    return await calcola_impatti(payload)

@app.post("/inserisci", response_model=InserisciResponse)
async def inserisci_terreno(payload: InserisciRequest):
    return await inserisci_terreno(payload)

@app.get("/classifica", response_model=ClassificaResponse)
async def mostra_classifica(payload: ClassificaRequest):
    return await mostra_classifica(payload)

@app.get("/esporta", response_model=EsportaResponse)
async def Esporta(payload: EsportaRequest):
    return await Esporta(payload)

#pip install uvicorn

#uvicorn app.main:app --reload

#http://localhost:8000