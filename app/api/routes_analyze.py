from fastapi import APIRouter, HTTPException

from app.models import AnalyzeRequest
from app.services.batch_runner import run_batch

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/")
async def analyze(request: AnalyzeRequest) -> list[dict]:
    if not request.domains:
        raise HTTPException(status_code=400, detail="Provide at least one domain.")
    return await run_batch(request.domains)
