from sqlalchemy import create_engine, Column, String, Text, JSON, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
import os
from typing import Generator

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hackpal.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(String, primary_key=True)
    problem_statement = Column(Text, nullable=False)
    market_research = Column(Text)  # JSON string
    features = Column(JSON)  # JSON array
    scaffold_zip = Column(Text)  # base64 encoded
    pitch_deck_pdf = Column(Text)  # base64 encoded
    status = Column(String, nullable=False, default="pending")  # pending, generating, completed, failed
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    completed_at = Column(DateTime)


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()