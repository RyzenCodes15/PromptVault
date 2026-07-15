"""Static file serving for locally uploaded images (development fallback)."""

import os
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


@router.get("/{filename:path}")
async def serve_upload(filename: str):
    """Serve an uploaded file from the local uploads directory."""
    file_path = UPLOADS_DIR / filename
    # Prevent directory traversal
    try:
        file_path = file_path.resolve()
        if not str(file_path).startswith(str(UPLOADS_DIR.resolve())):
            raise HTTPException(status_code=403, detail="Access denied.")
    except (ValueError, OSError):
        raise HTTPException(status_code=400, detail="Invalid path.")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    return FileResponse(file_path)
