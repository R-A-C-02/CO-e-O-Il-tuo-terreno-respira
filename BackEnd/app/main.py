from BackEnd.app.database import engine
from BackEnd.app.models import Base
from BackEnd.app.routes import router
from BackEnd.app.schemas import SaveCoordinatesRequest, SaveCoordinatesResponse, ClassificaRequest, ClassificaResponse, EsportaRequest, EsportaResponse
from BackEnd.app.utils import inserisci_terreno, mostra_classifica, Esporta, get_species_distribution_by_plot,inserisci_terreno,mostra_classifica,Esporta, get_species_distribution_by_plot
from fastapi.staticfiles import StaticFiles
from fastapi import Request,FastAPI, Query, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from BackEnd.app.co2_o2_calculator import calculate_co2_o2_hourly, get_coefficients_from_db, get_weather_data_from_db, get_species_from_db
from BackEnd.app.get_meteo import fetch_and_save_weather_day
import pandas as pd
from datetime import date

app = FastAPI()
app.mount("/static", StaticFiles(directory="FrontEnd/static"), name="static")
# Imposta FrontEnd come directory dei template
templates = Jinja2Templates(directory="FrontEnd/templates")
app.include_router(router)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",  # ✅ il tuo frontend
        "http://localhost:8000",  # ✅ per sicurezza
    ],
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


SECRET_KEY = "il_tuo_segreto"
ALGORITHM = "HS256"
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token non valido")

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    # if not token:
    #     raise HTTPException(status_code=401, detail="Token mancante")
    return "" #decode_token(token)

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, user=Depends(get_current_user)): #async def home(request: Request):
    #return templates.TemplateResponse("index.html", {"request": request})
    return templates.TemplateResponse("index.html", {
        "request": request,
        "user_id": '1', #user["id"],
        "email": 'user@example.com' #user["mail"]
    })


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


@app.post("/get_open_meteo/{plot_id}")
async def get_open_meteo(plot_id: int):
    success = fetch_and_save_weather_day(plot_id)
    if not success:
        return {"success": False, "msg": "Errore nel salvataggio meteo"}
    return {"success": True, "msg": "Dati meteo salvati con successo"}

# 3. CALCOLA CO2/O2 (GET)


@app.get("/calcola_co2/{plot_id}")
async def calcola_co2(plot_id: int, giorno: str = None):
    giorno = giorno or date.today().isoformat()
    species = get_species_from_db(plot_id)
    weather = get_weather_data_from_db(plot_id, giorno)
    print("Esempio weather:", weather[0])
    coefs = get_coefficients_from_db()
    results = calculate_co2_o2_hourly(species, weather, coefs)
    df = pd.DataFrame(results)
    df_group = df.groupby("datetime")[["co2_kg_hour", "o2_kg_hour"]].sum().reset_index()
    df_group["datetime"] = df_group["datetime"].apply(lambda x: x.strftime("%Y-%m-%d %H:%M:%S"))

    # === NUOVO: colleziona dati meteo per ogni ora ===
    # ATTENZIONE: Adatta i nomi dei campi alle chiavi reali che ti restituisce get_weather_data_from_db
    weather_map = {
        w["datetime"].strftime("%Y-%m-%d %H:%M:%S"): w
        for w in weather
    }

    out = []
    for row in df_group.to_dict(orient="records"):
        meteo = weather_map.get(row["datetime"], {})
        row["precipitazioni_mm"] = meteo.get("precipitation")
        row["temperatura_c"]     = meteo.get("temperature")
        row["radiazione"]        = meteo.get("radiation")
        row["umidita"]           = meteo.get("humidity")

        out.append(row)
    return out

@app.get("/weather/{plot_id}")
def get_weather(plot_id: int, giorno: str = Query(...)):
    return {"meteo": get_weather_data_from_db(plot_id, giorno)}

@app.get("/species/{plot_id}")
def species_distribution(plot_id: int):
    return {"species": get_species_distribution_by_plot(plot_id)}


@app.post("/get_open_meteo/{plot_id}")
async def get_open_meteo(plot_id: int):
    success = fetch_and_save_weather_day(plot_id)
    if not success:
        return {"success": False, "msg": "Errore nel salvataggio meteo"}
    return {"success": True, "msg": "Dati meteo salvati con successo"}

#@app.get("/getmeteo", response_model=MeteoResponse)
#async def Esporta(payload: MeteoRequest):
#    return await Esporta(payload)


#pip install uvicorn

#uvicorn BackEnd.app.main:app --reload

#http://localhost:8000