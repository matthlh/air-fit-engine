from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.db import delete_result, get_all_results, get_result_by_domain
from app.services.exporters import export_csv

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/")
async def list_companies(limit: int = 100) -> list[dict]:
    return get_all_results(limit=limit)


@router.get("/export/csv")
async def export():
    path = export_csv()
    return FileResponse(path, media_type="text/csv", filename="results.csv")


@router.delete("/{domain:path}", status_code=204)
async def remove_company(domain: str) -> None:
    if not delete_result(domain):
        raise HTTPException(status_code=404, detail=f"No results found for '{domain}'.")


@router.get("/{domain:path}")
async def get_company(domain: str) -> dict:
    result = get_result_by_domain(domain)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No results found for '{domain}'.")
    return result
