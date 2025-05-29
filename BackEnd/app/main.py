from fastapi import FastAPI
from BackEnd.app.database import engine
from BackEnd.app.models import Base, User
from BackEnd.app.routes import router
from BackEnd.app.security import hash_password, verify_password
from BackEnd.app.schemas import CalcoloRequest, CalcoloResponse, SaveCoordinatesRequest, SaveCoordinatesResponse, ClassificaRequest, ClassificaResponse, EsportaRequest, EsportaResponse
from BackEnd.app.utils import calcola_impatti,inserisci_terreno,mostra_classifica,Esporta
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.mount("/static", StaticFiles(directory="FrontEnd/static"), name="static")
# Imposta FrontEnd come directory dei template
templates = Jinja2Templates(directory="FrontEnd/templates")
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request): #async def home(request: Request):
    return templates.TemplateResponse("homepagedefinitiva.html", {"request": request})

@app.get("/calcola", response_model=CalcoloResponse)
async def calcola_impatti_ambientali(payload: CalcoloRequest):
    return await calcola_impatti(payload)

#inserimento plot (jherson)
@app.post("/save-coordinates", response_model=SaveCoordinatesResponse)
async def inserisci_coordinate(payload: SaveCoordinatesRequest):
    return await inserisci_terreno(payload)

@app.get("/classifica", response_model=ClassificaResponse)
async def get_classifica(payload: ClassificaRequest):
    return await mostra_classifica(payload)

@app.get("/esporta", response_model=EsportaResponse)
async def esporta_pdf(payload: EsportaRequest):
    return await Esporta(payload)

@app.get("/demo", response_class=HTMLResponse)
async def demo(request: Request):
    return templates.TemplateResponse("demo.html", {"request": request})

#@app.get("/getmeteo", response_model=MeteoResponse)
#async def Esporta(payload: MeteoRequest):
#    return await Esporta(payload)


#pip install uvicorn

#uvicorn BackEnd.app.main:app --reload

#http://localhost:8000