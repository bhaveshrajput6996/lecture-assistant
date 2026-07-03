"""Q&A API."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()


class ChatRequest(BaseModel):
    lecture_id: int
    question: str


@router.post("/ask")
async def ask_question(request: ChatRequest):
    answer = rag_service.answer_question(request.lecture_id, request.question)
    return {"answer": answer}
