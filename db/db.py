from sqlalchemy import create_engine, Column, Integer, String, Float, Text
import sqlalchemy
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os

# Database setup - use absolute path to db folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'gamesdb.db')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = sqlalchemy.orm.declarative_base()

# Database model
class Games(Base):
    __tablename__ = "games"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    releaseYear = Column(Integer)
    imageUrl = Column(String)
    developer = Column(String)
    publisher = Column(String)
    platform = Column(Text)  # JSON array stored as text
    price = Column(Float)
    website = Column(String)
    genres = Column(Text)  # JSON array stored as text
    tags = Column(Text)  # JSON array stored as text
    screenshots = Column(Text)  # JSON array stored as text
    metacriticScore = Column(Integer)
    steamRating = Column(Float)
