from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_analyze import router as analyze_router
from app.api.routes_companies import router as companies_router
from app.config import ALLOWED_ORIGINS
from app.db import init_db

app = FastAPI(
    title="Air Fit Signal Engine",
    description="Internal GTM tool — scrapes company sites and scores creative-ops fit for Air.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
async def startup() -> None:
    init_db()


app.include_router(analyze_router)
app.include_router(companies_router)


@app.get("/")
async def root() -> dict:
    return {"status": "ok", "service": "Air Fit Signal Engine"}
