from fastapi import FastAPI
from app.database import engine
from app.models import Base
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



#pip install uvicorn

#uvicorn app.main:app --reload

#http://localhost:8000