from pydantic import BaseModel
from typing import List, Optional
from datetime import date


# ========== USER ==========

class UserBase(BaseModel):
    username: str
    email: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str  # richiesto in creazione

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class UserLogin(UserBase):
    ...
    
# ========== PLOT ==========

class PlotBase(BaseModel):
    name: str

class PlotCreate(PlotBase):
    user_id: int
    geom: dict  # GeoJSON

class PlotOut(PlotBase):
    id: int
    user_id: int
    geom: dict
    centroid: Optional[dict] = None  # anche questo in formato GeoJSON
    class Config:
        orm_mode = True


# ========== SPECIES ==========

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


# ========== PLOT_SPECIES ==========

class PlotSpeciesBase(BaseModel):
    plot_id: int
    species_id: int
    quantity: float

class PlotSpeciesCreate(PlotSpeciesBase):
    pass

class PlotSpeciesOut(PlotSpeciesBase):
    id: int
    class Config:
        orm_mode = True


# ========== WEATHER DATA ==========

class WeatherDataBase(BaseModel):
    plot_id: int
    date: date
    temperature: float
    precipitation: float
    solar_radiation: float

class WeatherDataCreate(WeatherDataBase):
    pass

class WeatherDataOut(WeatherDataBase):
    id: int
    class Config:
        orm_mode = True
