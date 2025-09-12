from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from database import init_db, get_db
from routes import generations_router, auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    init_db()
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="HackPal API",
    description="AI-Powered Hackathon Assistant API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(generations_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")

# Health check endpoint
@app.get("/api")
async def health_check():
    return {"status": "ok", "message": "HackPal API is running"}

# Serve frontend static files (if available)
if os.path.exists("client/dist"):
    app.mount("/", StaticFiles(directory="client/dist", html=True), name="static")
    
    # Fallback for SPA routing
    @app.api_route("/{path:path}", methods=["GET"])
    async def serve_spa(path: str):
        """Serve the React SPA for client-side routing"""
        file_path = f"client/dist/{path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Return index.html for client-side routing
        return FileResponse("client/dist/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "HackPal Python Backend is running! Frontend not built yet."}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )