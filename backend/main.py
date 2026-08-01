import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router as api_router

app = FastAPI(
    title="ATS Resume Analyzer API",
    description="Backend API for scoring resumes against job descriptions",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Include the API routes
app.include_router(api_router, prefix="/api")

# Serve frontend static files
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    current_dir = os.path.dirname(__file__)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, app_dir=current_dir)
