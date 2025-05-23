from fastapi import FastAPI
from app.models import CalcoloRequest, CalcoloResponse, InserisciRequest, InserisciResponse, ClassificaRequest, ClassificaResponse, EsportaRequest, EsportaResponse
from app.utils import calcola_impatti,inserisci_terreno,mostra_classifica,Esporta

app = FastAPI()

@app.post("/calcola", response_model=CalcoloResponse)
async def calcola_impatti_ambientali(payload: CalcoloRequest):
    return await calcola_impatti(payload)

@app.post("/inserisci", response_model=InserisciResponse)
async def inserisci_terreno(payload: InserisciRequest):
    return await inserisci_terreno(payload)

@app.post("/classifica", response_model=ClassificaResponse)
async def mostra_classifica(payload: ClassificaRequest):
    return await mostra_classifica(payload)

@app.post("/esporta", response_model=EsportaResponse)
async def Esporta(payload: EsportaRequest):
    return await Esporta(payload)
