"""Upload audio API."""

from fastapi import APIRouter, File, UploadFile

from backend.services.audio_service import AudioService

router = APIRouter()
audio_service = AudioService()


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    result = await audio_service.save_upload(file)
    return {"filename": result["filename"], "path": result["path"]}
