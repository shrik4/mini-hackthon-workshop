from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import datetime
import asyncio

from database import get_db, Generation as DBGeneration
from models import (
    GenerationRequest, GenerationResponse, GenerationDetail, 
    Feature, MarketResearch
)
from services.gemini_service import GeminiService
from services.file_generation import FileGenerationService

generations_router = APIRouter()
auth_router = APIRouter()


# Generation endpoints
@generations_router.post("/generate", response_model=GenerationResponse)
async def create_generation(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new generation process"""
    generation_id = str(uuid.uuid4())
    
    # Create generation record
    db_generation = DBGeneration(
        id=generation_id,
        problem_statement=request.problem_statement,
        status="pending"
    )
    db.add(db_generation)
    db.commit()
    
    # Start background generation
    background_tasks.add_task(
        run_generation_process,
        generation_id,
        request.problem_statement,
        request.api_key,
        db
    )
    
    return GenerationResponse(generationId=generation_id)


@generations_router.get("/generation/{generation_id}", response_model=GenerationDetail)
async def get_generation(generation_id: str, db: Session = Depends(get_db)):
    """Get generation status and results"""
    generation = db.query(DBGeneration).filter(
        DBGeneration.id == generation_id
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    return GenerationDetail.from_orm(generation)


@generations_router.get("/generation/{generation_id}/download/{file_type}")
async def download_file(generation_id: str, file_type: str, db: Session = Depends(get_db)):
    """Download generated files (zip or pdf)"""
    generation = db.query(DBGeneration).filter(
        DBGeneration.id == generation_id
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    if file_type == "zip":
        if not generation.scaffold_zip:
            raise HTTPException(status_code=404, detail="Scaffold ZIP not found")
        
        import base64
        zip_data = base64.b64decode(str(generation.scaffold_zip))
        return Response(
            content=zip_data,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=hackathon-app.zip"}
        )
    
    elif file_type == "pdf":
        if not generation.pitch_deck_pdf:
            raise HTTPException(status_code=404, detail="Pitch deck PDF not found")
        
        import base64
        pdf_data = base64.b64decode(str(generation.pitch_deck_pdf))
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=pitch-deck.pdf"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")


async def run_generation_process(
    generation_id: str,
    problem_statement: str,
    api_key: str,
    db: Session
):
    """Background task to run the full generation process"""
    try:
        # Update status to generating
        generation = db.query(DBGeneration).filter(
            DBGeneration.id == generation_id
        ).first()
        if generation:
            db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
                "status": "generating"
            })
            db.commit()
        
        gemini_service = GeminiService(api_key)
        file_service = FileGenerationService()
        
        print(f"[{generation_id}] Starting market research...")
        
        # Step 1: Market Research
        market_research = await gemini_service.analyze_market(problem_statement)
        db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
            "market_research": market_research.model_dump_json()
        })
        db.commit()
        
        print(f"[{generation_id}] Generating features...")
        
        # Step 2: Feature Generation
        features = await gemini_service.generate_features(problem_statement, market_research)
        db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
            "features": [f.model_dump() for f in features]
        })
        db.commit()
        
        print(f"[{generation_id}] Generating React scaffold...")
        
        # Step 3: React Scaffold
        scaffold_zip = file_service.generate_react_scaffold(problem_statement, features)
        db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
            "scaffold_zip": scaffold_zip
        })
        db.commit()
        
        print(f"[{generation_id}] Generating pitch deck...")
        
        # Step 4: Pitch Deck
        pitch_deck_pdf = file_service.generate_pitch_deck(
            problem_statement, market_research, features
        )
        
        # Final update
        db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
            "pitch_deck_pdf": pitch_deck_pdf,
            "status": "completed",
            "completed_at": datetime.utcnow()
        })
        db.commit()
        
        print(f"[{generation_id}] Generation completed successfully")
        
    except Exception as error:
        print(f"[{generation_id}] Generation failed: {error}")
        db.query(DBGeneration).filter(DBGeneration.id == generation_id).update({
            "status": "failed"
        })
        db.commit()


# Auth endpoints (placeholder)
@auth_router.post("/login")
async def login():
    """Login endpoint (placeholder)"""
    return {"message": "Auth not implemented yet"}


@auth_router.post("/register") 
async def register():
    """Register endpoint (placeholder)"""
    return {"message": "Auth not implemented yet"}