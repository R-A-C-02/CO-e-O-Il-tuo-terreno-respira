from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth import create_access_token, decode_access_token
from app.schemas import UserCreate, UserLogin
from app.models import User
from app.security import hash_password, verify_password
from app.database import SessionLocal

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Controlla se l'email è già registrata
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

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/utente-protetto")
async def protected_route(authorization: str = Header(...)):
    token = authorization.split("Bearer ")[-1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token non valido")
    return {"message": f"Benvenuto {payload['sub']}!"}
