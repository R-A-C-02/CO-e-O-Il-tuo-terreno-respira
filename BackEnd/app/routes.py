from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from BackEnd.app.auth import create_access_token, decode_access_token
from BackEnd.app.schemas import UserCreate, UserLogin
from BackEnd.app.models import User
from BackEnd.app.security import hash_password, verify_password
from BackEnd.app.database import SessionLocal
from BackEnd.app.get_meteo import fetch_and_save_weather_daily,fetch_and_save_weather_weekly
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
###############

router = APIRouter()
security = HTTPBearer()  # definisce il tipo di security scheme Bearer
templates = Jinja2Templates(directory="FrontEnd")
async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/logreg", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("login_main.html", {"request": request})

@router.post("/register")
async def register(request: Request,user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email già registrata")
    new_user = User(
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    return {"message": "Registrazione completata"}

@router.post("/login", response_class=HTMLResponse)
async def login(request: Request, user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")

    token = create_access_token({"id": db_user.id, "mail": db_user.email})

    return templates.TemplateResponse(
        "AggiornamentiDash/DashBoardFinale/index.html",
        {
            "request": request,
            "user_id": db_user.id,
            "email": db_user.email,
            "token": token
        }
    )


@router.post("/weather/{plot_id}")
async def fetch_weather(plot_id: str):
    success = fetch_and_save_weather_daily(plot_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Plot {plot_id} non trovato o errore nella richiesta meteo.")
    return {"detail": "Dati meteo salvati con successo."}

#@router.get("/utente-protetto")
#async def protected_route(
#    credentials: HTTPAuthorizationCredentials = Security(security)
#):
#    token = credentials.credentials
#    payload = decode_access_token(token)
#    if not payload:
#        raise HTTPException(status_code=401, detail="Token non valido")
#    return {"message": f"Benvenuto {payload['sub']}!"}