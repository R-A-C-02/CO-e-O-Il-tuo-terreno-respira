from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ===== USER =====
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True


# ===== NATURAL PERSON =====
class NaturalPersonBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    gender: Optional[str] = None
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None

class NaturalPersonCreate(NaturalPersonBase):
    user_id: int

class NaturalPersonOut(NaturalPersonBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True


# ===== SOCIETY =====
class SocietyBase(BaseModel):
    username: str
    ragione_sociale: str
    sede_legale: Optional[str] = None
    partita_IVA: str
    COD_FIS: str
    email: EmailStr
    password: str
    province: Optional[str] = None
    city: Optional[str] = None

class SocietyCreate(SocietyBase):
    user_id: int

class SocietyOut(SocietyBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True


# ===== PLOTS =====
class PlotBase(BaseModel):
    name: str

class PlotCreate(PlotBase):
    user_id: int
    geom: dict  # GeoJSON

class PlotOut(PlotBase):
    id: int
    user_id: int
    geom: dict
    centroid: Optional[dict] = None
    total_co2_absorption: Optional[float] = 0
    total_o2_production: Optional[float] = 0
    created_at: datetime
    class Config:
        orm_mode = True


# ===== SPECIES =====
class SpeciesBase(BaseModel):
    name: str
    co2_absorption_rate: float
    o2_production_rate: float

class SpeciesCreate(SpeciesBase):
    pass

class SpeciesOut(SpeciesBase):
    id: int
    class Config:
        orm_mode = True


# ===== PLOT_SPECIES =====
class PlotSpeciesBase(BaseModel):
    plot_id: int
    species_id: int
    surface_area: Optional[float] = None

class PlotSpeciesCreate(PlotSpeciesBase):
    pass

class PlotSpeciesOut(PlotSpeciesBase):
    id: int
    actual_co2_absorption: Optional[float] = None
    actual_o2_production: Optional[float] = None
    class Config:
        orm_mode = True


# ===== WEATHER DATA =====
class WeatherDataBase(BaseModel):
    plot_id: int
    date_time: datetime
    temperature: Optional[float] = None
    precipitation: Optional[float] = None
    solar_radiation: Optional[float] = None
    humidity: Optional[int] = None

class WeatherDataCreate(WeatherDataBase):
    pass

class WeatherDataOut(WeatherDataBase):
    id: int
    total_co2_absorption: Optional[float] = None
    total_o2_production: Optional[float] = None
    class Config:
        orm_mode = True





#pip install fastapi uvicorn sqlalchemy geoalchemy2 shapely psycopg2-binary

