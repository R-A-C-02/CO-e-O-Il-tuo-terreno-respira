from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from geoalchemy2 import Geometry
from pydantic import BaseModel, Field
from typing import List

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone_number = Column(String)
    created_at = Column(TIMESTAMP, server_default="now()")

    plots = relationship("Plot", backref="owner")


class Plot(Base):
    __tablename__ = "plots"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326))
    centroid = Column(Geometry(geometry_type="POINT", srid=4326))
    created_at = Column(TIMESTAMP, server_default="now()")

    species = relationship("PlotSpecies", backref="plot")
    weather = relationship("WeatherData", backref="plot")


class Species(Base):
    __tablename__ = "species"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    co2_absorption_rate = Column(Float)
    o2_production_rate = Column(Float)

    plots = relationship("PlotSpecies", backref="species")


class PlotSpecies(Base):
    __tablename__ = "plot_species"
    id = Column(Integer, primary_key=True)
    plot_id = Column(Integer, ForeignKey("plots.id"))
    species_id = Column(Integer, ForeignKey("species.id"))
    quantity = Column(Float, nullable=False)


class WeatherData(Base):
    __tablename__ = "weather_data"
    id = Column(Integer, primary_key=True)
    plot_id = Column(Integer, ForeignKey("plots.id"))
    date = Column(Date, nullable=False)
    temperature = Column(Float)
    precipitation = Column(Float)
    solar_radiation = Column(Float)


class CalcoloRequest(BaseModel):
    terreno: List[Plot]
    vegetazione: List[PlotSpecies]

class CalcoloResponse(BaseModel):
    co2_giornaliera: float
    o2_giornaliera: float
    dettaglio_per_specie: List[dict]  # Esempio: {"nome": "quercia", "co2": 12.4, "o2": 8.1} (vogliamo farlo così?)

class InserisciRequest(BaseModel):
    utente : str
    terreno: List[Plot]
    vegetazione: List[PlotSpecies]
   

class InserisciResponse(BaseModel):
    esito : str

class ClassificaRequest(BaseModel):
    criterio: str

class ClassificaResponse(BaseModel):
    Classifica: List[dict]

#pip install fastapi uvicorn sqlalchemy geoalchemy2 shapely psycopg2-binary
