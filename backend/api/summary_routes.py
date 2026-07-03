"""Summary API."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.summarizer_service import SummarizerService

router = APIRouter()
summarizer_service = SummarizerService()


class SummaryRequest(BaseModel):
    lecture_id: int


@router.post("/generate")
async def generate_summary(request: SummaryRequest):
    summary = summarizer_service.generate_summary(request.lecture_id)
    return {"summary": summary}
