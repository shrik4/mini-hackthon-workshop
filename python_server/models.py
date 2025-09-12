from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum


class GenerationStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class FeaturePriority(str, Enum):
    MVP = "mvp"
    STRETCH = "stretch"


class Feature(BaseModel):
    title: str
    description: str
    priority: FeaturePriority
    tech_stack: str = Field(alias="techStack")
    complexity: int = Field(ge=1, le=5)

    class Config:
        populate_by_name = True
        use_enum_values = True


class Competitor(BaseModel):
    name: str
    description: str


class MarketResearch(BaseModel):
    summary: str
    competitors: List[Competitor]


class GenerationRequest(BaseModel):
    problem_statement: str = Field(min_length=10, alias="problemStatement")
    api_key: str = Field(min_length=1, alias="apiKey")

    class Config:
        populate_by_name = True


class GenerationResponse(BaseModel):
    generation_id: str = Field(alias="generationId")

    class Config:
        populate_by_name = True


class GenerationDetail(BaseModel):
    id: str
    problem_statement: str = Field(alias="problemStatement")
    market_research: Optional[str] = Field(None, alias="marketResearch")
    features: Optional[Union[List[Feature], List[dict]]] = None
    scaffold_zip: Optional[str] = Field(None, alias="scaffoldZip")
    pitch_deck_pdf: Optional[str] = Field(None, alias="pitchDeckPdf")
    status: GenerationStatus
    created_at: datetime = Field(alias="createdAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")

    class Config:
        populate_by_name = True
        from_attributes = True
        use_enum_values = True


class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: str
    username: str

    class Config:
        from_attributes = True